/* Medição do site: Pixel da Meta (dataset "ClickGo Site", ID 1109603448661652) + Microsoft Clarity (z1xe0alk23).
   Clarity: gravação de sessão e mapa de calor, mascaramento padrão; no /esboco/ os campos, a revisão, a prévia e o
   "continuar" ainda levam data-clarity-mask="true".
   Arquivo próprio porque a CSP só aceita script do próprio site (sem script inline).
   - PageView nas páginas públicas. NUNCA roda em /acompanhar (a chave do pedido vai no endereço).
   - Lead: o esboco.js chama window.cgLead(tipo) quando o pedido é aceito; nenhum dado pessoal vai junto.
   - autoConfig desligado: o pixel não varre botões nem campos do formulário sozinho.
   - Não roda em teste local (localhost/127.0.0.1). */
(function () {
  var ID = '1109603448661652';
  window.cgLead = function () {};
  if (/^\/acompanhar(\/|$)/.test(location.pathname)) return;
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;

  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', 'z1xe0alk23');

  fbq('set', 'autoConfig', false, ID);
  fbq('init', ID);
  fbq('track', 'PageView');

  window.cgLead = function (tipo) {
    try { fbq('track', 'Lead', { content_category: String(tipo || 'site').slice(0, 40) }); } catch (e) { /* sem pixel */ }
  };
})();
