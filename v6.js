/* ClickGo v6: mapa dos sistemas (SVG desenhado aqui) e animações vivas em canvas.
   Os contatos continuam centralizados no script.js (não mexer lá). */
(function () {
  'use strict';
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var temIO = 'IntersectionObserver' in window;
  var NS = 'http://www.w3.org/2000/svg';

  /* (21/10) o mapa dos sistemas saiu: a seção abre com a central desenhada no v7.js */

  /* ================= FITA DE VÍDEOS (03) ================= */
  var reel = document.querySelector('.reel');
  var faixa = reel && reel.querySelector('.reel-faixa');
  if (faixa) {
    var rio = null;
    if (temIO && !reduz) {
      rio = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) {
          var v = e.target;
          if (e.isIntersecting) {
            if (!v.getAttribute('src')) v.src = v.getAttribute('data-src');
            var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
          } else if (!v.paused) v.pause();
        });
      }, { threshold: 0.15 });
    }
    var originais = Array.prototype.slice.call(faixa.children);
    var copia = function (c) {
      var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true');
      var v = k.querySelector('video'); if (v) { v.removeAttribute('src'); v.removeAttribute('aria-label'); }
      return k;
    };
    var observa = function () { if (rio) faixa.querySelectorAll('video.rv').forEach(function (v) { rio.observe(v); }); };
    var montaFita = function () {
      if (rio) rio.disconnect();
      // volta só aos clipes originais
      while (faixa.children.length > originais.length) faixa.removeChild(faixa.lastChild);
      // metade A: repete os clipes até passar da largura do espaço (+1 clipe de folga)
      var largura = reel.clientWidth, um = originais[0].getBoundingClientRect().width + 12;
      while (faixa.scrollWidth < largura + um) originais.forEach(function (c) { faixa.appendChild(copia(c)); });
      // metade B: cópia exata da metade A; -50% cai no mesmo quadro, sem emenda
      var metade = faixa.scrollWidth;
      Array.prototype.slice.call(faixa.children).forEach(function (c) { faixa.appendChild(copia(c)); });
      faixa.style.setProperty('--fita-dur', Math.round(metade / 38) + 's');
      observa();
    };
    if (!reduz) {
      montaFita();
      document.documentElement.classList.add('js-reel');
      var largAnt = reel.clientWidth, rt = 0;
      window.addEventListener('resize', function () {
        clearTimeout(rt);
        rt = setTimeout(function () { if (reel.clientWidth !== largAnt) { largAnt = reel.clientWidth; montaFita(); } }, 200);
      });
    } else observa();
  }

  /* ================= ANIMAÇÕES VIVAS (canvas 2D) ================= */
  var celular = window.matchMedia && window.matchMedia('(max-width: 699px)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, celular ? 1.5 : 2);
  var PAL = [[214, 242, 255], [150, 222, 255], [76, 201, 255], [60, 165, 250], [52, 130, 235], [70, 110, 210]];
  function cor(i, a) { var c = PAL[Math.max(0, Math.min(PAL.length - 1, i | 0))]; return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  var cenas = [];
  function Cena(cv, tipo) {
    this.cv = cv; this.ctx = cv.getContext('2d'); this.tipo = tipo; this.vis = false;
    this.mx = 0; this.my = 0; this.tx = 0; this.ty = 0; this.w = 0; this.h = 0;
    this.monta();
    var self = this;
    if (tipo === 'galaxia') {
      var move = function (e) { var r = cv.getBoundingClientRect(); self.tx = ((e.clientX - r.left) / r.width - .5) * 2; self.ty = ((e.clientY - r.top) / r.height - .5) * 2; };
      cv.addEventListener('pointermove', move);
      cv.addEventListener('pointerleave', function () { self.tx = 0; self.ty = 0; });
    }
  }
  Cena.prototype.ajusta = function () {
    var r = this.cv.getBoundingClientRect();
    var w = Math.max(1, Math.round(r.width * DPR)), h = Math.max(1, Math.round(r.height * DPR));
    if (w !== this.cv.width || h !== this.cv.height) { this.cv.width = w; this.cv.height = h; }
    this.w = w; this.h = h;
  };
  Cena.prototype.monta = function () {
    var t = this.tipo, i, n;
    if (t === 'galaxia') {
      n = 900; this.p = [];
      for (i = 0; i < n; i++) {
        var braco = i % 3, r = Math.pow(Math.random(), 0.6) * 1.0;
        var ang = braco * (Math.PI * 2 / 3) + r * 5.2 + rnd(-.35, .35) * (1.1 - r);
        this.p.push({ r: r, a: ang, y: rnd(-1, 1) * 0.07 * (1.1 - r), s: rnd(.9, 2.4), c: Math.min(5, r * 6 + rnd(-.8, .8)) });
      }
      this.estrelas = []; for (i = 0; i < (celular ? 90 : 200); i++) this.estrelas.push([Math.random(), Math.random(), Math.random()]);
    } else if (t === 'rede') {
      n = celular ? 90 : 140; this.p = [];
      var gold = Math.PI * (3 - Math.sqrt(5));
      for (i = 0; i < n; i++) { var y = 1 - (i / (n - 1)) * 2, rr = Math.sqrt(1 - y * y), th = gold * i; this.p.push([Math.cos(th) * rr, y, Math.sin(th) * rr]); }
      this.pares = [];
      for (i = 0; i < n; i++) for (var j = i + 1; j < n; j++) {
        var dx = this.p[i][0] - this.p[j][0], dy = this.p[i][1] - this.p[j][1], dz = this.p[i][2] - this.p[j][2];
        if (dx * dx + dy * dy + dz * dz < 0.09) this.pares.push([i, j]);
      }
    }
  };
  Cena.prototype.quadro = function (t) {
    this.ajusta();
    var c = this.ctx, w = this.w, h = this.h;
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, w, h);
    this[this.tipo](c, w, h, t / 1000);
  };
  // projeção 3D simples
  function proj(x, y, z, w, h, esc, dist) { var f = dist / (dist + z); return [w / 2 + x * esc * f, h / 2 + y * esc * f, f]; }

  Cena.prototype.galaxia = function (c, w, h, t) {
    this.mx += (this.tx - this.mx) * .05; this.my += (this.ty - this.my) * .05;
    var esc = Math.min(w, h * 1.6) * (celular ? 0.44 : 0.36), dist = 3;
    var inc = 1.05 + this.my * .35 + Math.sin(t * .2) * .08, gir = t * .12 + this.mx * .6;
    var ci = Math.cos(inc), si = Math.sin(inc);
    // estrelas de fundo
    for (var k = 0; k < this.estrelas.length; k++) {
      var e = this.estrelas[k], tw = .35 + .35 * Math.sin(t * 2 + k);
      c.fillStyle = cor(k % 6, tw * e[2]); c.fillRect(e[0] * w, e[1] * h, DPR, DPR);
    }
    // núcleo
    var g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, esc * .5);
    g.addColorStop(0, 'rgba(220,245,255,.35)'); g.addColorStop(.25, 'rgba(76,201,255,.12)'); g.addColorStop(.6, 'rgba(52,130,235,.04)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.globalCompositeOperation = 'lighter';
    var p = this.p;
    for (var i = 0; i < p.length; i++) {
      var q = p[i], a = q.a + gir * (1.4 - q.r * .6);
      var x = Math.cos(a) * q.r, z0 = Math.sin(a) * q.r, y0 = q.y;
      var y = y0 * ci - z0 * si, z = y0 * si + z0 * ci;
      var pr = proj(x, y, z, w, h, esc, dist);
      var s = q.s * pr[2] * DPR * (celular ? 1.1 : 1);
      c.fillStyle = cor(q.c, Math.min(1, .35 + pr[2] * .45));
      c.fillRect(pr[0] - s / 2, pr[1] - s / 2, s, s);
    }
  };

  Cena.prototype.dna = function (c, w, h, t) {
    c.globalCompositeOperation = 'lighter';
    var n = 26, alt = h * .86, raio = Math.min(w, h) * .26;
    var pts = [];
    for (var i = 0; i < n; i++) {
      var y = (i / (n - 1) - .5) * alt, a = i * .45 + t * 1.3;
      for (var f = 0; f < 2; f++) {
        var aa = a + f * Math.PI, x = Math.cos(aa) * raio, z = Math.sin(aa) * raio;
        var pr = proj(x, y, z, w, h, 1, raio * 4);
        pts.push([pr[0], pr[1], pr[2], f, i]);
      }
      var A = pts[pts.length - 2], B = pts[pts.length - 1];
      c.strokeStyle = cor(4, .22); c.lineWidth = DPR; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke();
    }
    pts.sort(function (a, b) { return a[2] - b[2]; });
    for (var k = 0; k < pts.length; k++) {
      var P = pts[k], r = (2.2 + P[2] * 2.6) * DPR;
      var gg = c.createRadialGradient(P[0], P[1], 0, P[0], P[1], r * 2.6);
      gg.addColorStop(0, cor(P[3] ? 5 : 1, .95)); gg.addColorStop(1, cor(P[3] ? 4 : 2, 0));
      c.fillStyle = gg; c.beginPath(); c.arc(P[0], P[1], r * 2.6, 0, 6.283); c.fill();
    }
  };

  Cena.prototype.onda = function (c, w, h, t) {
    var N = celular ? 16 : 22, esc = Math.min(w, h) * .95, dist = 2.4;
    var lin = [];
    for (var i = 0; i < N; i++) {
      var row = [];
      for (var j = 0; j < N; j++) {
        var x = j / (N - 1) - .5, z = i / (N - 1) - .5;
        var y = Math.sin(x * 9 + t * 1.6) * .05 + Math.cos(z * 7 - t * 1.2) * .05 + Math.sin((x + z) * 6 + t) * .03;
        // inclina a malha para dar profundidade
        var yy = y * 1 + z * .35, zz = z * .9 - y * .3;
        var pr = proj(x * 1.6, yy + .12, zz, w, h, esc, dist);
        row.push([pr[0], pr[1], y]);
      }
      lin.push(row);
    }
    c.globalCompositeOperation = 'lighter';
    c.lineWidth = DPR;
    for (i = 0; i < N; i++) {
      var dep = i / (N - 1);
      c.strokeStyle = cor(1 + dep * 3, .15 + dep * .45);
      c.beginPath();
      for (j = 0; j < N; j++) { var P = lin[i][j]; if (j) c.lineTo(P[0], P[1]); else c.moveTo(P[0], P[1]); }
      c.stroke();
      c.beginPath();
      for (j = 0; j < N; j++) { P = lin[j][i]; if (j) c.lineTo(P[0], P[1]); else c.moveTo(P[0], P[1]); }
      c.stroke();
    }
    for (i = 0; i < N; i++) for (j = 0; j < N; j++) {
      P = lin[i][j]; if (P[2] > .06) { c.fillStyle = cor(0, .9); c.fillRect(P[0] - DPR, P[1] - DPR, 2 * DPR, 2 * DPR); }
    }
  };

  Cena.prototype.rede = function (c, w, h, t) {
    var esc = Math.min(w, h) * .36, dist = 3.2, ay = t * .35, ax = .4 + Math.sin(t * .3) * .2;
    var cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
    var pr = this.p.map(function (q) {
      var x = q[0] * cy + q[2] * sy, z = -q[0] * sy + q[2] * cy, y = q[1];
      var y2 = y * cx - z * sx, z2 = y * sx + z * cx;
      return proj(x, y2, z2, w, h, esc, dist);
    });
    c.globalCompositeOperation = 'lighter';
    c.lineWidth = DPR * .8;
    for (var k = 0; k < this.pares.length; k++) {
      var A = pr[this.pares[k][0]], B = pr[this.pares[k][1]], f = (A[2] + B[2]) / 2;
      c.strokeStyle = cor(f > 1 ? 1 : 4, Math.max(.05, (f - .7) * 1.1));
      c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke();
    }
    // sinal que percorre a rede
    var pulso = (t * 12) % this.pares.length | 0;
    for (k = 0; k < 6; k++) {
      var par = this.pares[(pulso + k * 37) % this.pares.length], P = pr[par[0]], Q = pr[par[1]], u = (t * 2 + k * .3) % 1;
      c.fillStyle = cor(0, .95); var X = P[0] + (Q[0] - P[0]) * u, Y = P[1] + (Q[1] - P[1]) * u;
      c.beginPath(); c.arc(X, Y, 2.2 * DPR, 0, 6.283); c.fill();
    }
    for (k = 0; k < pr.length; k++) { var p = pr[k]; c.fillStyle = cor(p[2] > 1 ? 0 : 3, Math.min(1, (p[2] - .6) * 1.6)); c.fillRect(p[0] - DPR, p[1] - DPR, 2 * DPR, 2 * DPR); }
  };

  document.querySelectorAll('canvas.anima').forEach(function (cv) {
    if (!cv.getContext) return;
    cenas.push(new Cena(cv, cv.getAttribute('data-anima')));
  });

  if (cenas.length) {
    if (reduz) {
      // movimento reduzido: um quadro parado de cada
      requestAnimationFrame(function () { cenas.forEach(function (s) { s.quadro(4000); }); });
    } else {
      var rodando = false, ativo = !document.hidden;
      var laco = function (t) {
        var algum = false;
        cenas.forEach(function (s) { if (s.vis) { s.quadro(t); algum = true; } });
        if (algum && ativo) requestAnimationFrame(laco); else rodando = false;
      };
      var liga = function () { if (!rodando && ativo && cenas.some(function (s) { return s.vis; })) { rodando = true; requestAnimationFrame(laco); } };
      if (temIO) {
        var io = new IntersectionObserver(function (ents) {
          ents.forEach(function (e) { cenas.forEach(function (s) { if (s.cv === e.target) s.vis = e.isIntersecting; }); });
          liga();
        }, { rootMargin: '80px 0px' });
        cenas.forEach(function (s) { io.observe(s.cv); });
      } else { cenas.forEach(function (s) { s.vis = true; }); liga(); }
      document.addEventListener('visibilitychange', function () { ativo = !document.hidden; liga(); });
      // primeiro quadro já desenhado (para não ficar caixa vazia antes de rolar)
      requestAnimationFrame(function () { cenas.forEach(function (s) { s.quadro(1500); }); });
    }
  }
})();
