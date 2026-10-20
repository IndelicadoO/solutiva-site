/* ClickGo: comum ao formulário e ao acompanhamento. Fila pública no orbixbr (Render). Local (teste): ?api=http://127.0.0.1:PORTA */
(function () {
  var api = 'https://orbixbr.onrender.com/api/clickgo';
  try {
    var q = new URLSearchParams(location.search).get('api');
    if (q && /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(q)) api = q + '/api/clickgo';
  } catch (e) { /* sem URLSearchParams */ }

  // Foto -> JPEG até 1280 px e ~350 KB (o servidor recusa acima de 450 KB)
  function comprimir(arquivo, lado) {
    lado = lado || 1280;
    return new Promise(function (ok, falha) {
      var leitor = new FileReader();
      leitor.onerror = function () { falha(new Error('Não consegui ler a foto.')); };
      leitor.onload = function () {
        var img = new Image();
        img.onerror = function () { falha(new Error('Esse arquivo não parece uma foto.')); };
        img.onload = function () {
          var e = Math.min(1, lado / Math.max(img.width, img.height));
          var c = document.createElement('canvas');
          c.width = Math.round(img.width * e); c.height = Math.round(img.height * e);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          var q = 0.82, url = c.toDataURL('image/jpeg', q);
          while (url.length > 470000 && q > 0.4) { q -= 0.1; url = c.toDataURL('image/jpeg', q); }
          ok(url);
        };
        img.src = leitor.result;
      };
      leitor.readAsDataURL(arquivo);
    });
  }
  function chamar(caminho, opcoes) {
    opcoes = opcoes || {};
    var h = { 'Content-Type': 'application/json' };
    if (opcoes.chave) h['X-Pedido-Chave'] = opcoes.chave;
    return fetch(api + caminho, { method: opcoes.metodo || 'GET', headers: h, body: opcoes.corpo ? JSON.stringify(opcoes.corpo) : undefined, cache: 'no-store' })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.erro || 'Não consegui falar com o servidor (' + r.status + ').'); return j; }); });
  }
  window.CG = { api: api, comprimir: comprimir, chamar: chamar };
})();
