/* =====================================================================
   CONTATO: o ÚNICO lugar para trocar para onde os botões levam.
   - principal: botão ciano (todos os "Orçamento grátis").
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

  // ---- painel do topo: robôs trabalhando (demonstração, sem números) ----
  var feed = document.getElementById('feed');
  var EVENTOS = [
    ['Orbix', 'achou um produto novo para divulgar'],
    ['NexoFrame', 'gravou o vídeo do produto'],
    ['Orbix', 'conferiu o preço antes de publicar'],
    ['Orbix', 'publicou o vídeo em 4 redes'],
    ['Robô de WhatsApp', 'respondeu um cliente e marcou o horário'],
    ['LYRA', 'editou a gameplay e agendou'],
    ['Certeza Duvidosa', 'montou roteiro, narração e cenas'],
    ['Orbit', 'recebeu um comando pelo Telegram']
  ];
  // a lista estática do HTML vale sem JS ou com movimento reduzido; com JS ela recomeça do ciclo
  if (feed && !reduz) {
    var idx = 0, vivo = true, noTopo = true, timer = null, MAX = 5, DUR = 2600;
    var cria = function (ev) {
      var li = document.createElement('li');
      li.className = 'ev rodando entra';
      li.style.setProperty('--dur', DUR + 'ms');
      var m = document.createElement('span'); m.className = 'ev-marca'; m.setAttribute('aria-hidden', 'true');
      var t = document.createElement('span'); t.className = 'ev-txt';
      var b = document.createElement('b'); b.textContent = ev[0];
      t.appendChild(b); t.appendChild(document.createTextNode(' ' + ev[1]));
      if (ev[2]) { var i = document.createElement('i'); i.textContent = ev[2]; t.appendChild(document.createTextNode(' ')); t.appendChild(i); }
      li.appendChild(m); li.appendChild(t);
      return li;
    };
    var passo = function () {
      timer = null;
      if (!vivo || !noTopo) return;
      var li = cria(EVENTOS[idx % EVENTOS.length]); idx++;
      feed.insertBefore(li, feed.firstChild);
      while (feed.children.length > MAX) feed.removeChild(feed.lastChild);
      setTimeout(function () { li.classList.remove('rodando', 'entra'); li.classList.add('feito'); }, DUR);
      timer = setTimeout(passo, DUR + 900);
    };
    feed.textContent = '';
    for (var k0 = MAX - 1; k0 >= 0; k0--) { var li0 = cria(EVENTOS[k0]); li0.className = 'ev feito'; feed.appendChild(li0); }
    idx = MAX;
    var liga = function () { if (!timer && vivo && noTopo) timer = setTimeout(passo, 700); };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { noTopo = e[0].isIntersecting; liga(); }).observe(feed);
    }
    document.addEventListener('visibilitychange', function () { vivo = !document.hidden; liga(); });
    liga();
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

  // ---- fundo vivo: triângulos da logo subindo devagar ----
  if (reduz) return;
  var cv = document.getElementById('bgCanvas');
  var ctx = cv && cv.getContext('2d');
  if (!ctx) return;
  var W = 0, H = 0, DPR = 1, small = false, tris = [];
  var COR = ['63,210,255', '58,134,255', '166,230,255', '52,224,192', '154,146,255'];
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    W = window.innerWidth; H = window.innerHeight; small = W < 760;
    DPR = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var nt = small ? 7 : 14;
    while (tris.length < nt) tris.push({ x: rnd(0, W), y: rnd(0, H), s: rnd(12, 40), a: rnd(0, 6.28), va: rnd(-.003, .003), vy: rnd(-.22, -.06), o: rnd(.05, .13), c: Math.floor(Math.random() * COR.length) });
    tris.length = nt;
  }

  var lastY = window.scrollY || 0, sv = 0, last = 0, rodando = true;
  function frame(t) {
    if (!rodando) return;
    requestAnimationFrame(frame);
    if (t - last < 32) return; // ~30 fps basta
    last = t;
    var y = window.scrollY || 0, ds = y - lastY; lastY = y; sv = sv * .85 + ds * .15;
    ctx.clearRect(0, 0, W, H);
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
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { rodando = false; } else if (!rodando) { rodando = true; requestAnimationFrame(frame); }
  });
  requestAnimationFrame(frame);
})();
