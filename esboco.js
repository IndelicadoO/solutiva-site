/* ClickGo: formulário do esboço grátis -> fila pública -> página de acompanhamento só do cliente (#id.chave) */
(function () {
  var form = document.getElementById('form');
  var t0 = Date.now();
  var fotos = [];
  var caixa = document.getElementById('fotos'), add = document.getElementById('foto-add'), input = document.getElementById('foto-input');
  var erro = document.getElementById('erro'), botao = document.getElementById('enviar');
  var api = new URLSearchParams(location.search).get('api');

  // já pediu neste aparelho: oferece voltar à página dele
  try {
    var ult = JSON.parse(localStorage.getItem('cg_pedidos') || '[]')[0];
    if (ult && ult.id) {
      var aviso = document.createElement('p');
      aviso.className = 'cg-dica';
      aviso.innerHTML = 'Você já pediu o esboço de <b></b>. <a href="#">Abrir a sua página</a>';
      aviso.querySelector('b').textContent = ult.negocio || 'seu negócio';
      aviso.querySelector('a').href = '/acompanhar/' + (api ? '?api=' + encodeURIComponent(api) : '') + '#' + ult.id + '.' + ult.k;
      form.parentNode.insertBefore(aviso, form);
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

  function mostrarErro(msg) { erro.textContent = msg; erro.hidden = !msg; if (msg) erro.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var d = new FormData(form);
    var v = function (k) { return String(d.get(k) || '').trim(); };
    if (!v('negocio')) return mostrarErro('Diga o nome do negócio.');
    if (!v('ramo')) return mostrarErro('Diga o ramo (ex.: barbearia, clínica, restaurante).');
    if (!v('cidade')) return mostrarErro('Diga a cidade.');
    var zap = v('whatsapp').replace(/\D/g, '');
    if (zap.length < 10 && !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v('email'))) return mostrarErro('Deixe um WhatsApp (com DDD) ou um e-mail para a gente te avisar.');
    if (!d.get('aceite')) return mostrarErro('Marque que concorda com o uso dos dados para montar o esboço.');
    mostrarErro('');
    botao.disabled = true; botao.textContent = 'Enviando…';
    CG.chamar('/pedido', { metodo: 'POST', corpo: {
      negocio: v('negocio'), ramo: v('ramo'), cidade: v('cidade'), tipo: d.get('tipo') === 'cardapio' ? 'Cardápio digital' : 'site', quer: v('quer'), servicos: v('servicos'),
      cores: v('cores'), whatsapp: v('whatsapp'), email: v('email'), instagram: v('instagram'), site_url: v('site_url'), t0: t0, aceite: true, fotos: fotos
    } }).then(function (r) {
      if (r.isca) { botao.textContent = 'Recebido!'; return; }
      try {
        var l = JSON.parse(localStorage.getItem('cg_pedidos') || '[]').filter(function (x) { return x.id !== r.id; });
        l.unshift({ id: r.id, k: r.k, negocio: v('negocio'), em: Date.now() });
        localStorage.setItem('cg_pedidos', JSON.stringify(l.slice(0, 5)));
      } catch (e) { /* sem localStorage: o link vai no endereço */ }
      location.href = '/acompanhar/' + (api ? '?api=' + encodeURIComponent(api) : '') + '#' + r.id + '.' + r.k;
    }).catch(function (e) {
      mostrarErro(e.message || 'Não deu para enviar agora. Tente de novo em instantes.');
      botao.disabled = false; botao.textContent = 'Quero meu esboço grátis';
    });
  });
})();
