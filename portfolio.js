/* ClickGo: autorização de portfólio na página do pedido / Sala do site (dono 23/10/2026).
   Nasce autorizada (caixa já marcada no formulário); o cliente retira ou devolve quando quiser.
   Fala com a fila pública pelo CG.chamar (tipo "portfolio"); o app grava no pedido e confirma na conversa. */
(function () {
  var caixa = document.getElementById('portfolio');
  if (!caixa || !window.CG) return;
  var h = (location.hash || '').replace(/^#/, '').split('.');
  var ID = h[0] || '', K = h[1] || '';
  if (!ID || !K) return;
  var txt = document.getElementById('portfolio-t'), bt = document.getElementById('portfolio-b');
  var atual = true, enviando = false;
  function desenhar(sim) {
    atual = sim;
    caixa.classList.toggle('nao', !sim);
    txt.textContent = sim ? 'Seu site pode aparecer no portfólio da ClickGo (prints, link e nome do negócio).' : 'Seu site não aparece no portfólio da ClickGo.';
    bt.textContent = sim ? 'Não mostrar no portfólio' : 'Pode mostrar no portfólio';
    caixa.hidden = false;
  }
  CG.chamar('/pedido/' + encodeURIComponent(ID), { chave: K }).then(function (r) {
    // servidor antigo (sem o campo): não mostra o botão
    if (r && typeof r.portfolio === 'boolean') desenhar(r.portfolio);
  }).catch(function () { /* sem conexão: a página principal já avisa */ });
  bt.addEventListener('click', function () {
    if (enviando) return;
    enviando = true; bt.disabled = true;
    CG.chamar('/pedido/' + encodeURIComponent(ID) + '/mensagem', { metodo: 'POST', chave: K, corpo: { tipo: 'portfolio', portfolio: !atual } })
      .then(function (r) { desenhar(r && typeof r.portfolio === 'boolean' ? r.portfolio : !atual); })
      .catch(function (e) { txt.textContent = (e && e.message) || 'Não consegui mudar agora. Tente de novo.'; })
      .then(function () { enviando = false; bt.disabled = false; });
  });
})();
