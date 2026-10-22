/* =====================================================================
   WHATSAPP DA CLICKGO: o ÚNICO lugar para trocar o número no site.
   (WhatsApp Business comum, não a API oficial.) Carregado por todas as
   páginas (início, /esboco/, /acompanhar/, privacidade, termos, exclusão).
   O HTML traz o número escrito como reserva (sem JS); este arquivo
   sobrescreve tudo que tiver:
     data-zap            -> href = wa.me/<número>?text=<mensagem>
                            (mensagem: data-zap-msg, ou a padrão abaixo)
     data-zap-num        -> texto = número formatado
   Os botões principais (data-contato="principal") seguem no Instagram;
   para virarem WhatsApp, preencha CONTATO.whatsapp em script.js.
   ===================================================================== */
(function () {
  'use strict';
  var Z = window.CLICKGO_ZAP = {
    numero: '5561984717809',
    formatado: '(61) 98471-7809',
    mensagem: 'Olá! Vim pelo site da ClickGo e tenho uma dúvida.',
    link: function (msg) {
      return 'https://wa.me/' + Z.numero + '?text=' + encodeURIComponent(msg || Z.mensagem);
    },
    // Código do pedido (só o id, NUNCA a chave secreta que vem depois do ponto no #id.chave).
    pedido: function () {
      var id = (location.hash || '').replace(/^#/, '').split('.')[0];
      if (!/^[A-Za-z0-9_-]{4,40}$/.test(id)) {
        id = '';
        try { var u = JSON.parse(localStorage.getItem('cg_pedidos') || '[]')[0]; if (u && /^[A-Za-z0-9_-]{4,40}$/.test(u.id)) id = u.id; } catch (e) { /* sem armazenamento */ }
      }
      return id;
    },
    aplicar: function (raiz) {
      raiz = raiz || document;
      raiz.querySelectorAll('[data-zap]').forEach(function (a) {
        var msg = a.getAttribute('data-zap-msg');
        if (a.hasAttribute('data-zap-pedido')) {
          var id = Z.pedido();
          msg = id ? 'Olá! Tenho uma dúvida sobre o meu pedido ' + id + ' na ClickGo.' : 'Olá! Tenho uma dúvida sobre o pedido de site na ClickGo.';
        }
        a.href = Z.link(msg);
      });
      raiz.querySelectorAll('[data-zap-num]').forEach(function (el) { el.textContent = Z.formatado; });
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { Z.aplicar(); });
  else Z.aplicar();
  window.addEventListener('hashchange', function () { Z.aplicar(); });
  // a página do pedido pode trocar o endereço sem hashchange: refaz o link na hora do clique
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('[data-zap]');
    if (a && a.parentNode) Z.aplicar(a.parentNode);
  }, true);
})();
