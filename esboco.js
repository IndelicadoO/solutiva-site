/* ClickGo: formulário do esboço grátis -> fila pública -> página de acompanhamento só do cliente (#id.chave) */
(function () {
  var form = document.getElementById('form');
  var t0 = Date.now();
  var fotos = [];
  var caixa = document.getElementById('fotos'), add = document.getElementById('foto-add'), input = document.getElementById('foto-input');
  var erro = document.getElementById('erro'), botao = document.getElementById('enviar');
  var api = new URLSearchParams(location.search).get('api');

  // já pediu neste aparelho: cartão grande no topo "Continuar de onde parei" (sem redirecionar sozinho). "Fazer outro pedido"
  // mostra o formulário; o pedido novo SUBSTITUI o antigo (id + chave do antigo vão junto; a fila confere a chave).
  var antigo = null;
  try {
    var ult = JSON.parse(localStorage.getItem('cg_pedidos') || '[]')[0];
    if (ult && ult.id && ult.k) {
      antigo = ult;
      var card = document.getElementById('continuar'), hero = document.querySelector('.cg-hero');
      document.getElementById('continuar-nome').textContent = ult.negocio || 'seu negócio';
      document.getElementById('continuar-ir').href = '/acompanhar/' + (api ? '?api=' + encodeURIComponent(api) : '') + '#' + ult.id + '.' + ult.k;
      card.parentNode.insertBefore(card, card.parentNode.firstChild);
      card.hidden = false; form.hidden = true; if (hero) hero.hidden = true;
      document.getElementById('continuar-outro').onclick = function () {
        form.hidden = false; if (hero) hero.hidden = false; this.hidden = true;
        document.getElementById('continuar-aviso').hidden = false;
        botao.textContent = 'Fazer o pedido novo (substitui o anterior)';
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
    }
  } catch (e) { /* sem localStorage */ }

  function desenhar() {
    Array.prototype.slice.call(caixa.querySelectorAll('.cg-foto')).forEach(function (n) { n.remove(); });
    fotos.forEach(function (url, i) {
      var d = document.createElement('div'); d.className = 'cg-foto';
      d.innerHTML = '<img alt=""><button type="button" aria-label="Tirar foto">×</button>';
      d.querySelector('img').src = url;
      d.querySelector('button').onclick = function () { fotos.splice(i, 1); desenhar(); };
      caixa.insertBefore(d, add);
    });
    add.hidden = fotos.length >= 3;
  }
  input.addEventListener('change', function () {
    var lista = Array.prototype.slice.call(input.files || []).slice(0, 3 - fotos.length);
    Promise.all(lista.map(function (f) { return CG.comprimir(f).catch(function () { return null; }); })).then(function (urls) {
      urls.forEach(function (u) { if (u) fotos.push(u); });
      input.value = ''; desenhar();
    });
  });

  // WhatsApp oficial (a API diz em /config): DESLIGADO = e-mail obrigatório (padrão seguro, inclusive se a consulta falhar);
  // LIGADO = WhatsApp ou e-mail, qualquer um basta. A fila confere a mesma regra.
  var waOficial = false;
  CG.chamar('/config').then(function (c) {
    if (!c || !c.whatsappOficial) return;
    waOficial = true;
    document.getElementById('avisos-sub').textContent = 'Deixe pelo menos um. O esboço também fica numa página só sua.';
    document.getElementById('rot-email').textContent = 'E-mail';
    document.getElementById('rot-whats').textContent = 'WhatsApp';
    form.querySelector('[name=email]').required = false;
  }).catch(function () { /* fica o padrão: e-mail obrigatório */ });

  function mostrarErro(msg) { erro.textContent = msg; erro.hidden = !msg; if (msg) erro.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var d = new FormData(form);
    var v = function (k) { return String(d.get(k) || '').trim(); };
    if (!v('negocio')) return mostrarErro('Diga o nome do negócio.');
    if (!v('ramo')) return mostrarErro('Diga o ramo (ex.: barbearia, clínica, restaurante).');
    if (!v('cidade')) return mostrarErro('Diga a cidade.');
    var zap = v('whatsapp').replace(/\D/g, '');
    var emailOk = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v('email'));
    if (!waOficial && !emailOk) return mostrarErro('Deixe o seu e-mail: é por ele que a gente te avisa do pedido.');
    if (zap.length < 10 && !emailOk) return mostrarErro('Deixe um WhatsApp (com DDD) ou um e-mail para a gente te avisar.');
    if (!d.get('aceite')) return mostrarErro('Marque que concorda com o uso dos dados para montar o esboço.');
    mostrarErro('');
    botao.disabled = true; botao.textContent = 'Enviando…';
    CG.chamar('/pedido', { metodo: 'POST', corpo: {
      negocio: v('negocio'), ramo: v('ramo'), cidade: v('cidade'), tipo: d.get('tipo') === 'cardapio' ? 'Cardápio digital' : 'site', quer: v('quer'), servicos: v('servicos'),
      cores: v('cores'), whatsapp: v('whatsapp'), email: v('email'), instagram: v('instagram'), site_url: v('site_url'), t0: t0, aceite: true, fotos: fotos,
      precisa: d.getAll('precisa').map(String).slice(0, 6),
      substitui: antigo && !form.hidden && !document.getElementById('continuar-aviso').hidden ? { id: antigo.id, k: antigo.k } : undefined
    } }).then(function (r) {
      if (r.isca) { botao.textContent = 'Recebido!'; return; }
      try {
        var l = JSON.parse(localStorage.getItem('cg_pedidos') || '[]').filter(function (x) { return x.id !== r.id && !(antigo && x.id === antigo.id); });
        l.unshift({ id: r.id, k: r.k, negocio: v('negocio'), em: Date.now() });
        localStorage.setItem('cg_pedidos', JSON.stringify(l.slice(0, 5)));
      } catch (e) { /* sem localStorage: o link vai no endereço */ }
      location.href = '/acompanhar/' + (api ? '?api=' + encodeURIComponent(api) : '') + '#' + r.id + '.' + r.k;
    }).catch(function (e) {
      mostrarErro(e.message || 'Não deu para enviar agora. Tente de novo em instantes.');
      botao.disabled = false; botao.textContent = antigo ? 'Fazer o pedido novo (substitui o anterior)' : 'Quero meu esboço grátis';
    });
  });
})();
