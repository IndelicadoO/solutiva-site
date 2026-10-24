/* ClickGo · /conectar?c=<código do pedido>: Embedded Signup v4 da Meta (ClickGo é Tech Provider).
   Fluxo: acorda a nuvem (GET /robo/config: o código da Meta vale 30 s, e o servidor grátis dorme) -> carrega o SDK do
   Facebook -> FB.login com o config_id -> guarda waba_id/phone_number_id do evento WA_EMBEDDED_SIGNUP (só de *.facebook.com)
   -> manda { c, code, waba_id, phone_number_id } para a nuvem trocar (o segredo do app fica SÓ no servidor).
   Teste local: ?api=http://127.0.0.1:PORTA (só com a página aberta em localhost). */
(function () {
  'use strict';
  var api = 'https://orbixbr.onrender.com/api/clickgo/robo';
  var q = new URLSearchParams(location.search);
  var qa = q.get('api');
  if (qa && /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(qa)) api = qa + '/api/clickgo/robo';
  var c = String(q.get('c') || '').toLowerCase();
  var $ = function (id) { return document.getElementById(id); };
  var btn = $('conectar'), msg = $('msg'), pill = $('online');
  var cfg = null, ids = null, esperandoIds = null;

  function dizer(t, erro) { msg.textContent = t || ''; msg.classList.toggle('erro', !!erro); }
  function fbOrigem(o) { try { var h = new URL(o).hostname; return h === 'facebook.com' || /\.facebook\.com$/.test(h); } catch (e) { return false; } }

  if (!/^[a-f0-9]{10}$/.test(c)) { pill.textContent = 'link inválido'; dizer('Este link está incompleto. Abra pelo link que a ClickGo mandou na conversa.', true); return; }

  // dados que a Meta manda da janela do cadastro (ids da conta e do número; a nuvem confere de novo com o token)
  window.addEventListener('message', function (ev) {
    if (!fbOrigem(ev.origin)) return;
    var d; try { d = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data; } catch (e) { return; }
    if (!d || d.type !== 'WA_EMBEDDED_SIGNUP') return;
    if (/^FINISH/.test(String(d.event || '')) && d.data && d.data.waba_id) {
      ids = { waba_id: String(d.data.waba_id || ''), phone_number_id: String(d.data.phone_number_id || '') };
      if (esperandoIds) esperandoIds();
    } else if (d.event === 'CANCEL') {
      dizer('Você fechou antes de terminar. Quando quiser, toque em "Conectar meu WhatsApp" de novo.');
      btn.disabled = false;
    } else if (d.event === 'ERROR') {
      dizer('A Meta mostrou um erro no cadastro. Tente de novo; se repetir, fale com a ClickGo.', true);
      btn.disabled = false;
    }
  });
  function aguardarIds(ms) {
    if (ids) return Promise.resolve(ids);
    return new Promise(function (ok) { var t = setTimeout(function () { ok(ids); }, ms); esperandoIds = function () { clearTimeout(t); ok(ids); }; });
  }

  function trocar(code) {
    dizer('Ligando o robô no seu número…');
    return aguardarIds(6000).then(function (x) {
      if (!x || !x.phone_number_id) throw new Error('Não recebi o número escolhido. Tente de novo e vá até o fim do cadastro (escolha o número).');
      return fetch(api + '/trocar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ c: c, code: code, waba_id: x.waba_id, phone_number_id: x.phone_number_id }) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.erro || 'Não deu para concluir agora. Tente de novo.'); return j; }); });
    }).then(function (j) {
      $('passo').hidden = true; $('feito').hidden = false;
      if (!j.conectado) $('feito-s').textContent = 'Recebemos a conexão' + (j.numero ? ' do ' + j.numero : '') + '. Falta um ajuste do nosso lado; a ClickGo já foi avisada e te confirma na conversa.';
      else if (j.numero) $('feito-s').textContent = 'Seu robô já pode atender no ' + j.numero + '. Volte para a conversa com a ClickGo e diga "pronto".';
    }).catch(function (e) { dizer(e.message, true); btn.disabled = false; });
  }

  btn.addEventListener('click', function () {
    if (!window.FB || !cfg) return;
    btn.disabled = true; ids = null; dizer('Abrindo a janela da Meta…');
    window.FB.login(function (resp) {
      var code = resp && resp.authResponse && resp.authResponse.code;
      if (!code) { btn.disabled = false; if (!msg.classList.contains('erro')) dizer('A conexão não foi concluída. Tente de novo quando quiser.'); return; }
      trocar(code);
    }, { config_id: cfg.configId, response_type: 'code', override_default_response_type: true, extras: { setup: {}, featureType: '', sessionInfoVersion: '3' } });
  });

  function carregarSdk() {
    window.fbAsyncInit = function () {
      window.FB.init({ appId: cfg.appId, autoLogAppEvents: true, xfbml: false, version: cfg.versao || 'v23.0' });
      btn.disabled = false; pill.textContent = 'pronto'; pill.classList.add('ok'); dizer('');
    };
    var s = document.createElement('script');
    s.src = 'https://connect.facebook.net/pt_BR/sdk.js'; s.async = true; s.defer = true; s.crossOrigin = 'anonymous';
    s.onerror = function () { dizer('Não consegui abrir o cadastro da Meta. Desative o bloqueador de anúncios desta página e recarregue.', true); };
    document.head.appendChild(s);
  }

  // acorda a nuvem e pega o que a página precisa (nada secreto)
  dizer('Preparando…');
  (function tentar(n) {
    fetch(api + '/config', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('acordando'); return r.json(); }).then(function (j) {
      if (!j || !j.ligado || !/^\d{5,25}$/.test(String(j.configId || '')) || !/^\d{5,25}$/.test(String(j.appId || ''))) { pill.textContent = 'em breve'; dizer('A conexão ainda não está aberta. A ClickGo te avisa na conversa quando puder fazer este passo.', true); return; }
      cfg = j; carregarSdk();
    }).catch(function () { if (n < 10) { dizer('Acordando o servidor da ClickGo…'); setTimeout(function () { tentar(n + 1); }, 6000); } else dizer('Sem conexão com a ClickGo agora. Recarregue a página em instantes.', true); });
  })(0);
})();
