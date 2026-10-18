/* Solutiva v5: vídeos que só baixam e tocam na tela, e cortes entre cenas.
   Os contatos continuam centralizados no script.js (não mexer lá). */
(function () {
  'use strict';
  var html = document.documentElement;
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var celular = window.matchMedia && window.matchMedia('(max-width: 699px)').matches;
  var temIO = 'IntersectionObserver' in window;
  if (!reduz) html.classList.add('js-v5');

  // pôster vertical no celular (leve, aparece antes de qualquer vídeo)
  var videos = document.querySelectorAll('video.cena-video, video.vid');
  videos.forEach(function (v) {
    if (celular && v.getAttribute('data-poster-m')) v.poster = v.getAttribute('data-poster-m');
  });

  // vídeo: só baixa quando chega perto da tela; toca visível, pausa fora; movimento reduzido = só o pôster
  if (!reduz && temIO) {
    var vio = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (!v.getAttribute('src')) {
            v.src = (celular && v.getAttribute('data-src-m')) || v.getAttribute('data-src');
          }
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else if (!v.paused) { v.pause(); }
      });
    }, { threshold: 0.2 });
    videos.forEach(function (v) { vio.observe(v); });
  }

  // abertura entra depois do primeiro quadro
  requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('v5-pronto'); }); });

  // corte de cena: cada seção "entra" uma vez, como um corte de filme
  var cenas = document.querySelectorAll('.cena:not(.abertura)');
  if (!reduz && temIO) {
    var cio = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('em-cena'); cio.unobserve(e.target); } });
    }, { threshold: 0.22 });
    cenas.forEach(function (c) { cio.observe(c); });
  } else {
    cenas.forEach(function (c) { c.classList.add('em-cena'); });
  }
})();
