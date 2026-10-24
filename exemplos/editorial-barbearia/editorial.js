/* Modelo EDITORIAL · exemplo fictício · ClickGo. JS pequeno, sem biblioteca; só liga classes (quem anima é o CSS). */
(function () {
  'use strict';
  var d = document, w = window;
  var reduz = w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fontes do Google depois da primeira pintura (a CSP não permite script inline, por isso aqui).
  var fl = d.querySelector('link[data-fontes]');
  if (fl) { var l = d.createElement('link'); l.rel = 'stylesheet'; l.href = fl.href; d.head.appendChild(l); }

  // Abertura: entra assim que a página pinta.
  var abre = d.querySelector('.abre');
  if (abre) { w.requestAnimationFrame(function () { w.requestAnimationFrame(function () { abre.classList.add('pronto'); }); }); }

  // Vídeo só no computador, com rede boa e sem movimento reduzido; o celular fica com a foto (poster).
  var v = d.querySelector('.abre-video');
  var con = navigator.connection || {};
  if (v && !reduz && w.matchMedia('(min-width: 700px)').matches && !con.saveData && !/^(slow-2g|2g|3g)$/.test(con.effectiveType || '')) {
    var s = v.querySelector('source[data-src]');
    if (s) { s.src = s.getAttribute('data-src'); v.load(); }
    var toca = function () { var p = v.play(); if (p && p.then) p.then(function () { v.classList.add('tocando'); }).catch(function () {}); };
    if (d.readyState === 'complete') toca(); else w.addEventListener('load', toca, { once: true });
  }

  // Revelar ao rolar (fallback por IntersectionObserver; navegador antigo mostra tudo).
  var rvs = d.querySelectorAll('.rv');
  if (!('IntersectionObserver' in w) || reduz) { rvs.forEach(function (e) { e.classList.add('vi'); }); }
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vi'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    rvs.forEach(function (e) { io.observe(e); });
  }

  // Índice de serviços: a foto da direita troca no hover/foco (computador).
  var fotos = d.querySelectorAll('.vis img');
  var links = d.querySelectorAll('.lista a[data-foto]');
  var mostra = function (n) {
    fotos.forEach(function (f) { f.classList.toggle('on', f.getAttribute('data-foto') === n); });
    links.forEach(function (a) { a.classList.toggle('ativo', a.getAttribute('data-foto') === n); });
  };
  if (links.length) {
    links.forEach(function (a) {
      var n = a.getAttribute('data-foto');
      a.addEventListener('mouseenter', function () { mostra(n); });
      a.addEventListener('focus', function () { mostra(n); });
    });
    mostra(links[0].getAttribute('data-foto'));
  }

  // Risco do "role" pulsa com transform (só quando tem movimento).
  var r = d.querySelector('.rolar span');
  if (r && !reduz && r.animate) { r.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: 1800, iterations: Infinity, easing: 'ease-in-out' }); }
})();
