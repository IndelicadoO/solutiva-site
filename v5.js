/* ClickGo v5: vídeos que só baixam e tocam na tela, e cortes entre cenas.
   Os contatos continuam centralizados no script.js (não mexer lá). */
(function () {
  'use strict';
  // fontes do Google sem travar a 1a pintura (23/10/2026): o <link> nasce como preload e vira folha de estilo aqui (CSP sem script inline)
  var lf = document.querySelector('link[data-fontes]');
  if (lf) requestAnimationFrame(function () { requestAnimationFrame(function () { lf.rel = 'stylesheet'; }); });
  var html = document.documentElement;
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var celular = window.matchMedia && window.matchMedia('(max-width: 699px)').matches;
  var temIO = 'IntersectionObserver' in window;
  if (!reduz) html.classList.add('js-v5');

  var videos = document.querySelectorAll('video.cena-video, video.vid');

  // pôsteres só perto da tela (23/10/2026): eram ~20 imagens baixando junto com o topo e atrasando a 1a tela no celular.
  // O vertical (data-poster-m) vai para o celular. Roda depois dos outros scripts (a fita do v6.js clona os vídeos).
  function poePoster(v) { var u = (celular && v.getAttribute('data-poster-m')) || v.getAttribute('data-poster'); if (u && v.getAttribute('poster') !== u) v.poster = u; }
  document.addEventListener('DOMContentLoaded', function () {
    var lista = document.querySelectorAll('video[data-poster]');
    if (!temIO) { lista.forEach(poePoster); return; }
    var pio = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { poePoster(e.target); pio.unobserve(e.target); } });
    }, { rootMargin: '600px 600px' });
    lista.forEach(function (v) { pio.observe(v); });
  });

  // vídeo: só baixa quando chega perto da tela; toca visível, pausa fora; movimento reduzido = só o pôster
  if (!reduz && temIO) {
    var vio = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (!v.dataset.carregado) {
            v.dataset.carregado = '1';
            var fontes = v.querySelectorAll('source[data-src]');
            if (fontes.length) {
              // o navegador escolhe a fonte pelo media: a leve vai só para o celular
              fontes.forEach(function (s) { s.src = s.getAttribute('data-src'); });
              v.load();
            } else {
              v.src = (celular && v.getAttribute('data-src-m')) || v.getAttribute('data-src');
            }
          }
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else if (!v.paused) { v.pause(); }
      });
    }, { threshold: 0.2 });
    // celular: o vídeo de fundo das cenas NÃO baixa (o do topo pesava 4 MB e segurava o LCP em 7 s); fica o pôster.
    // Economia de dados ligada também fica só no pôster. Os vídeos de conteúdo (vitrine) continuam carregando ao chegar na tela.
    var poupa = celular || !!(navigator.connection && navigator.connection.saveData);
    videos.forEach(function (v) { if (poupa && v.classList.contains('cena-video')) return; vio.observe(v); });
  }

  // abertura entra depois do primeiro quadro
  requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('v5-pronto'); }); });

  // corte de cena: cada seção "entra" uma vez, como um corte de filme
  var cenas = document.querySelectorAll('.cena:not(.abertura)');
  if (!reduz && temIO) {
    var cio = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('em-cena'); cio.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    cenas.forEach(function (c) { cio.observe(c); });
  } else {
    cenas.forEach(function (c) { c.classList.add('em-cena'); });
  }
})();
