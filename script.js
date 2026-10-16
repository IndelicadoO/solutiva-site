/* =====================================================================
   CONTATO: o ÚNICO lugar para trocar para onde os botões levam.
   - principal: botão laranja (todos os "Orçamento grátis").
   - secundario: botão "Falar no LinkedIn".
   - whatsapp: quando tiver o número comercial, preencha só com dígitos,
     com 55 + DDD, ex.: '5561999999999'. Aí todos os botões principais
     passam a abrir o WhatsApp com a mensagem pronta abaixo.
   ===================================================================== */
const CONTATO = {
  principal: 'https://ig.me/m/solutiva.dev',
  secundario: 'https://www.linkedin.com/in/erinaldo-gomes-a30442264/',
  whatsapp: '',
  mensagemWhatsapp: 'Olá! Vi o site da Solutiva e quero um orçamento do site em 48 h.'
};

(function () {
  'use strict';
  document.documentElement.classList.remove('sem-js');

  // ---- links de contato ----
  var usaZap = /^\d{12,13}$/.test(CONTATO.whatsapp || '');
  var principal = usaZap
    ? 'https://wa.me/' + CONTATO.whatsapp + '?text=' + encodeURIComponent(CONTATO.mensagemWhatsapp)
    : CONTATO.principal;
  document.querySelectorAll('[data-contato]').forEach(function (a) {
    a.href = a.getAttribute('data-contato') === 'secundario' ? CONTATO.secundario : principal;
  });
  if (usaZap) {
    document.querySelectorAll('[data-rotulo-canal]').forEach(function (el) { el.textContent = 'WhatsApp'; });
  }

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  // ---- revelar ao rolar ----
  var revelas = document.querySelectorAll('.revela');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visivel'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    revelas.forEach(function (el) { io.observe(el); });
  } else {
    revelas.forEach(function (el) { el.classList.add('visivel'); });
  }

  // ---- vídeo da Vitrine: só baixa quando chega perto ----
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vit = document.querySelector('.vitrine-video');
  if (vit && 'IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting) {
          if (!vit.src) { vit.src = vit.getAttribute('data-src'); }
          if (!reduz) { var p = vit.play(); if (p && p.catch) p.catch(function () {}); }
        } else if (!vit.paused) { vit.pause(); }
      });
    }, { rootMargin: '200px 0px' });
    vio.observe(vit);
  }
  if (vit && reduz) { vit.controls = true; }

  // ---- vídeo do topo: pausa fora da tela ----
  var hv = document.querySelector('.hero-video');
  if (hv && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting) { var p = hv.play(); if (p && p.catch) p.catch(function () {}); } else { hv.pause(); }
      });
    }).observe(hv);
  }

  // ---- botão flutuante no celular depois do topo ----
  var flut = document.querySelector('.flutuante');
  var hero = document.getElementById('inicio');
  var fim = document.getElementById('contato');
  if (flut && hero && 'IntersectionObserver' in window) {
    var vis = { hero: true, fim: false };
    var upd = function () { flut.classList.toggle('mostra', !vis.hero && !vis.fim); };
    new IntersectionObserver(function (e) { vis.hero = e[0].isIntersecting; upd(); }).observe(hero);
    if (fim) new IntersectionObserver(function (e) { vis.fim = e[0].isIntersecting; upd(); }).observe(fim);
  }

  // ---- fundo vivo: constelação azul/ciano atrás da página inteira ----
  if (reduz) return;
  var cv = document.getElementById('bgCanvas');
  var ctx = cv && cv.getContext('2d');
  if (!ctx) return;
  var W = 0, H = 0, DPR = 1, small = false, pts = [], tris = [];
  var mouse = { x: -9999, y: -9999, on: false };
  var COR = ['56,214,255', '47,140,255', '159,226,255', '255,170,60'];
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    W = window.innerWidth; H = window.innerHeight; small = W < 760;
    DPR = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var n = Math.max(26, Math.min(small ? 44 : 100, Math.round(W * H / (small ? 9000 : 15000))));
    while (pts.length < n) {
      var r = Math.random();
      pts.push({ x: rnd(0, W), y: rnd(0, H), vx: rnd(-.22, .22), vy: rnd(-.22, .22), r: rnd(.8, 2.2), c: r < .08 ? 3 : (r < .5 ? 0 : (r < .8 ? 1 : 2)) });
    }
    pts.length = n;
    var nt = small ? 5 : 9;
    while (tris.length < nt) tris.push({ x: rnd(0, W), y: rnd(0, H), s: rnd(14, 38), a: rnd(0, 6.28), va: rnd(-.004, .004), vy: rnd(-.25, -.08), o: rnd(.05, .14), c: Math.random() < .5 ? 0 : 1 });
    tris.length = nt;
  }

  var lastY = window.scrollY || 0, sv = 0, last = 0, rodando = true;
  function frame(t) {
    if (!rodando) return;
    requestAnimationFrame(frame);
    if (small && t - last < 32) return; // ~30 fps no celular
    last = t;
    var y = window.scrollY || 0, ds = y - lastY; lastY = y; sv = sv * .85 + ds * .15;
    ctx.clearRect(0, 0, W, H);

    // triângulos (eco da logo) subindo devagar
    for (var k = 0; k < tris.length; k++) {
      var tr = tris[k];
      tr.y += tr.vy - sv * .05; tr.a += tr.va;
      if (tr.y < -60) { tr.y = H + 60; tr.x = rnd(0, W); }
      if (tr.y > H + 60) tr.y = -60;
      ctx.save(); ctx.translate(tr.x, tr.y); ctx.rotate(tr.a);
      ctx.beginPath(); ctx.moveTo(0, -tr.s); ctx.lineTo(tr.s * .87, tr.s * .5); ctx.lineTo(-tr.s * .87, tr.s * .5); ctx.closePath();
      ctx.fillStyle = 'rgba(' + COR[tr.c] + ',' + tr.o + ')'; ctx.fill();
      ctx.strokeStyle = 'rgba(' + COR[2] + ',' + (tr.o * 1.6) + ')'; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
    }

    var link = small ? 95 : 130, l2 = link * link;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.x += p.vx; p.y += p.vy - sv * .1 * (.4 + p.r / 2.2);
      if (mouse.on) {
        var dx = mouse.x - p.x, dy = mouse.y - p.y, d2 = dx * dx + dy * dy;
        if (d2 < 40000) { var f = (1 - d2 / 40000) * .012; p.x += dx * f; p.y += dy * f; }
      }
      if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;
    }
    ctx.lineWidth = 1;
    for (i = 0; i < pts.length; i++) {
      for (var j = i + 1; j < pts.length; j++) {
        var a = pts[i], b = pts[j], ex = a.x - b.x, ey = a.y - b.y, e2 = ex * ex + ey * ey;
        if (e2 < l2) {
          ctx.strokeStyle = 'rgba(' + COR[a.c === 3 ? 0 : a.c] + ',' + ((1 - e2 / l2) * .28).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (i = 0; i < pts.length; i++) {
      p = pts[i];
      ctx.fillStyle = 'rgba(' + COR[p.c] + ',.9)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
    }
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  if (window.matchMedia && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true; }, { passive: true });
    document.addEventListener('mouseleave', function () { mouse.on = false; });
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { rodando = false; } else if (!rodando) { rodando = true; requestAnimationFrame(frame); }
  });
  requestAnimationFrame(frame);
})();
