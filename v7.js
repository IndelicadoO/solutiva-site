/* ClickGo v7 (21/10): cartões vivos dos sistemas + demonstração do formulário que se preenche sozinho.
   Sem dependência externa. Com prefers-reduced-motion: cartões abertos e parados; o formulário mostra só o fim. */
(function () {
  'use strict';
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var temIO = 'IntersectionObserver' in window;
  var celular = window.matchMedia ? window.matchMedia('(max-width: 959px)') : { matches: false };

  /* ================= cartões dos sistemas ================= */
  var lista = document.querySelector('.sis-lista');
  if (lista) {
    var cartoes = Array.prototype.slice.call(lista.querySelectorAll('.sc'));
    lista.classList.add('js');
    cartoes.forEach(function (c) {
      var lis = c.querySelectorAll('.galhos li');
      c.setAttribute('role', 'listitem');
      if (lis.length > 3) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'sc-mais';
        b.setAttribute('aria-expanded', 'false');
        var rot = function () { var ab = c.classList.contains('aberto'); b.textContent = ab ? 'Ver menos' : 'Ver os ' + lis.length + ' galhos'; b.setAttribute('aria-expanded', ab ? 'true' : 'false'); };
        rot();
        c.appendChild(b);
        // no celular o toque no cartão abre/fecha os galhos (o mapa, lá em cima, também acende pelo v6.js)
        c.addEventListener('click', function () { if (celular.matches) { c.classList.toggle('aberto'); rot(); } });
      }
    });
    if (temIO && !reduz) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
      }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
      cartoes.forEach(function (c) { io.observe(c); });
    } else cartoes.forEach(function (c) { c.classList.add('visto'); });
  }

  /* ================= demonstração do formulário ================= */
  var fd = document.getElementById('fd');
  if (!fd || reduz) return; // sem movimento: fica o estado final (tudo preenchido, site no ar)
  var q = function (s) { return fd.querySelector(s); };
  var qa = function (s) { return Array.prototype.slice.call(fd.querySelectorAll(s)); };
  var trilho = qa('.fd-trilho li');
  var prog = q('.fd-prog i'), np = q('.fd-np'), nf = q('.fd-nf');
  var digs = qa('.fd-dig');
  var heroNome = q('.fd-hero strong'), heroRamo = q('.fd-hero small');
  var nomeFinal = heroNome ? heroNome.textContent : '', ramoFinal = heroRamo ? heroRamo.textContent : '';
  var op = q('.fd-op.sel'), sug = q('.fd-sug i.sel'), fotos = qa('.fd-fotos span'), bt = q('.fd-bt');
  var timers = [], rodando = false, visivel = false;

  function depois(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function limpa() { timers.forEach(clearTimeout); timers = []; }
  function etapa(e, passo) {
    fd.setAttribute('data-e', String(e));
    trilho.forEach(function (li) { li.classList.toggle('ok', Number(li.getAttribute('data-e')) <= e); });
    if (passo) { np.textContent = String(passo); prog.style.transform = 'scaleX(' + (passo / 8) + ')'; }
  }
  function digita(elx, txt, ms, fim) {
    elx.textContent = ''; elx.classList.add('digitando');
    var i = 0;
    (function um() {
      i++; elx.textContent = txt.slice(0, i);
      if (elx === digs[0] && heroNome) heroNome.textContent = txt.slice(0, i) || 'Seu negócio';
      if (elx === digs[1] && heroRamo) heroRamo.textContent = txt.slice(0, i) || 'Seu ramo';
      if (i < txt.length) depois(ms, um); else { elx.classList.remove('digitando'); if (fim) fim(); }
    })();
  }
  function zera() {
    [op, sug, bt].forEach(function (x) { if (x) x.classList.remove('on'); });
    fotos.forEach(function (f) { f.classList.remove('on'); });
    digs.forEach(function (d) { d.textContent = ''; d.classList.remove('digitando'); });
    if (nf) nf.textContent = '0';
    if (heroNome) heroNome.textContent = 'Seu negócio';
    if (heroRamo) heroRamo.textContent = 'Seu ramo';
  }
  function ciclo() {
    limpa(); zera();
    etapa(0, 1);
    depois(900, function () { op && op.classList.add('on'); });
    depois(2000, function () {
      etapa(1, 2);
      digita(digs[0], digs[0].getAttribute('data-texto'), 55, function () {
        depois(250, function () { digita(digs[1], digs[1].getAttribute('data-texto'), 70, function () { sug && sug.classList.add('on'); }); });
      });
    });
    depois(5600, function () {
      etapa(2, 6);
      fotos.forEach(function (f, k) { depois(350 + k * 550, function () { f.classList.add('on'); if (nf) nf.textContent = String(k + 1); }); });
    });
    depois(8300, function () { etapa(3, 8); depois(500, function () { bt && bt.classList.add('on'); }); });
    depois(10600, function () { etapa(4, 8); });
    depois(13200, function () { etapa(5, 8); });
    depois(17000, function () { if (visivel) ciclo(); else rodando = false; });
  }
  function liga() { if (!rodando && visivel && !document.hidden) { rodando = true; ciclo(); } }
  function desliga() { limpa(); rodando = false; }

  fd.classList.add('rodando');
  etapa(0, 1); zera();
  if (temIO) {
    new IntersectionObserver(function (e) {
      visivel = e[0].isIntersecting;
      if (visivel) liga(); else desliga();
    }, { threshold: 0.15 }).observe(fd);
  } else { visivel = true; liga(); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) desliga(); else liga(); });
})();
