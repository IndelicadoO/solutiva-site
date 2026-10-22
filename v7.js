/* ClickGo v7 (21/10): cartões vivos dos sistemas + demonstração do formulário que se preenche sozinho.
   Sem dependência externa. Com prefers-reduced-motion: cartões abertos e parados; o formulário mostra só o fim. */
(function () {
  'use strict';
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var temIO = 'IntersectionObserver' in window;

  /* ================= cartões dos sistemas ================= */
  var lista = document.querySelector('.sis-lista');
  if (lista) {
    var cartoes = Array.prototype.slice.call(lista.querySelectorAll('.sc'));
    lista.classList.add('js');
    cartoes.forEach(function (c) {
      var lis = c.querySelectorAll('.galhos li');
      c.setAttribute('role', 'listitem');
      if (lis.length) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'sc-mais';
        b.setAttribute('aria-expanded', 'false');
        var rot = function () { var ab = c.classList.contains('aberto'); b.textContent = ab ? 'Ver menos' : 'Ver os ' + lis.length + ' galhos'; b.setAttribute('aria-expanded', ab ? 'true' : 'false'); };
        rot();
        c.appendChild(b);
        // o toque/clique no cartão abre e fecha os galhos (o mapa já mostra os galhos; o cartão fica curto)
        c.addEventListener('click', function () { c.classList.toggle('aberto'); rot(); });
      }
    });
    if (temIO && !reduz) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
      }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
      cartoes.forEach(function (c) { io.observe(c); });
    } else cartoes.forEach(function (c) { c.classList.add('visto'); });
  }

  /* ================= CENTRAL (a "aranha v3" aprovada, em código) =================
     O robozinho no centro; perninhas MOLES (curvas que ondulam de leve) até 8 cartões; a luz corre na perna, o cartão
     acende com ✓; a "Aprovação" para com STOP piscando e depois vira "aprovado". Ciclo de 11 s, só com a seção na tela.
     Movimento reduzido: fica o fim, tudo aceso e parado. Sem JS: a lista simples (.hub-lista) aparece no lugar. */
  var hub = document.getElementById('hub');
  if (hub) (function () {
    var NS = 'http://www.w3.org/2000/svg';
    var FR = Array.prototype.map.call(hub.querySelectorAll('.hub-lista li'), function (li) { return li.textContent.trim(); });
    var iDec = FR.indexOf('Aprovação');
    var D = 11, svg, legs = [], cards = [], centro, R, fmt = null, visivel = !temIO, rodando = false, t0 = 0;
    function el(tag, at, pai) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (pai) pai.appendChild(e); return e; }
    // quando cada cartão acende (a decisão segura os seguintes por 1,6 s)
    var ATIVA = FR.map(function (_, i) { return 0.9 + i * 0.85 + (iDec >= 0 && i > iDec ? 1.6 : 0); });
    var VIAGEM = 0.65, LIBERA = iDec >= 0 ? ATIVA[iDec] + 1.6 : 1e9, APAGA = D - 0.9;

    function montar() {
      var larga = hub.clientWidth >= 640;
      var novo = larga ? 'l' : 'p';
      if (novo === fmt) return; fmt = novo;
      hub.innerHTML = ''; legs = []; cards = [];
      var W = larga ? 900 : 360, H = larga ? 420 : 480;
      var cx = W / 2, cy = H / 2, rx = larga ? 330 : 124, ry = larga ? 152 : 196;
      var bw = larga ? 156 : 108, bh = larga ? 46 : 40, fs = larga ? 16 : 13;
      R = larga ? 58 : 46; centro = { x: cx, y: cy };
      svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'hub-svg', 'aria-hidden': 'true', focusable: 'false' }, hub);
      var defs = el('defs', {}, svg);
      defs.innerHTML = '<radialGradient id="hb-g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#38d6ff" stop-opacity=".35"/><stop offset="1" stop-color="#38d6ff" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="hb-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3FA2F7"/><stop offset=".55" stop-color="#2D7BF0"/><stop offset="1" stop-color="#1F5FD6"/></linearGradient>' +
        '<linearGradient id="hb-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2D7BF0"/><stop offset="1" stop-color="#0F2C66"/></linearGradient>' +
        '<linearGradient id="hb-c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fe8ff"/><stop offset="1" stop-color="#22D3EE"/></linearGradient>' +
        '<filter id="hb-luz" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
      var gLeg = el('g', { 'class': 'hb-pernas' }, svg);
      FR.forEach(function (nome, i) {
        var a = -Math.PI / 2 + i * 2 * Math.PI / FR.length;
        var bx = cx + Math.cos(a) * rx, by = cy + Math.sin(a) * ry;
        var ax = cx + Math.cos(a) * R * 0.7, ay = cy + Math.sin(a) * R * 0.7;
        // a perna termina na borda do cartão que olha para o centro
        var dx = ax - bx, dy = ay - by, k = Math.min((bw / 2) / Math.max(0.01, Math.abs(dx)), (bh / 2) / Math.max(0.01, Math.abs(dy)));
        var ex = bx + dx * k, ey = by + dy * k;
        var L = Math.hypot(ex - ax, ey - ay);
        legs.push({
          ax: ax, ay: ay, ex: ex, ey: ey, mx: (ax + ex) / 2 + Math.cos(a + Math.PI / 2) * L * 0.18, my: (ay + ey) / 2 + Math.sin(a + Math.PI / 2) * L * 0.18,
          px: Math.cos(a + Math.PI / 2), py: Math.sin(a + Math.PI / 2), amp: Math.min(larga ? 13 : 9, L * 0.12), fase: i * 1.9,
          base: el('path', { 'class': 'hb-perna' }, gLeg), luz: el('path', { 'class': 'hb-perna-luz', filter: 'url(#hb-luz)' }, gLeg),
          gota: el('circle', { r: larga ? 4 : 3.2, 'class': 'hb-gota' }, gLeg),
          pulsos: [el('circle', { r: 2.4, 'class': 'hb-pulso' }, gLeg), el('circle', { r: 2.4, 'class': 'hb-pulso' }, gLeg)]
        });
        var g = el('g', { 'class': 'hb-card' + (i === iDec ? ' dec' : ''), transform: 'translate(' + (bx - bw / 2) + ' ' + (by - bh / 2) + ')' }, svg);
        el('rect', { width: bw, height: bh, rx: 12, 'class': 'hb-caixa' }, g);
        var tx = el('text', { x: bw / 2, y: bh / 2 + fs * 0.36, 'text-anchor': 'middle', 'class': 'hb-txt', 'font-size': fs }, g); tx.textContent = nome;
        var ck = el('g', { 'class': 'hb-ck', transform: 'translate(' + (bw - 4) + ' 4)' }, g);
        el('circle', { r: larga ? 10 : 9 }, ck); el('path', { d: 'M-4 0l3 3 5-6' }, ck);
        var pill = null;
        if (i === iDec) {
          pill = el('g', { 'class': 'hb-pill', transform: 'translate(' + (bw / 2) + ' -16)' }, g);
          el('rect', { x: larga ? -84 : -70, y: -12, width: larga ? 168 : 140, height: 24, rx: 12 }, pill);
          var pt = el('text', { 'text-anchor': 'middle', y: 4.5, 'font-size': larga ? 12 : 11 }, pill); pt.textContent = '■ STOP · decisão humana';
          pill.txt = pt;
        }
        cards.push({ g: g, pill: pill });
      });
      // núcleo + robozinho (o mesmo desenho do mascote)
      el('circle', { cx: cx, cy: cy, r: R * 1.9, fill: 'url(#hb-g)', 'class': 'hb-aura' }, svg);
      el('circle', { cx: cx, cy: cy, r: R, 'class': 'hb-disco' }, svg);
      el('circle', { cx: cx, cy: cy, r: R + 8, 'class': 'hb-anel' }, svg);
      var rb = el('g', { 'class': 'hb-robo', transform: 'translate(' + (cx - R * 0.82) + ' ' + (cy - R * 0.88) + ') scale(' + (R * 1.64 / 300) + ')' }, svg);
      rb.innerHTML = '<rect x="96" y="182" width="108" height="86" rx="30" fill="url(#hb-b)" stroke="url(#hb-c)" stroke-width="4"/>' +
        '<path d="M162.9 209.6 A19 19 0 1 0 162.9 238.4" stroke="#22D3EE" stroke-width="8" fill="none" stroke-linecap="round"/>' +
        '<line x1="150" y1="44" x2="150" y2="70" stroke="url(#hb-c)" stroke-width="6" stroke-linecap="round"/><circle cx="150" cy="38" r="11" fill="#7fe8ff"/>' +
        '<rect x="62" y="66" width="176" height="124" rx="46" fill="url(#hb-a)" stroke="url(#hb-c)" stroke-width="5"/>' +
        '<rect x="80" y="84" width="140" height="88" rx="44" fill="#0B1220" stroke="rgba(34,211,238,.55)" stroke-width="3"/>' +
        '<g class="hb-olhos"><rect x="104" y="106" width="22" height="26" rx="11" fill="#22D3EE"/><rect x="174" y="106" width="22" height="26" rx="11" fill="#22D3EE"/></g>' +
        '<rect x="128" y="146" width="44" height="6" rx="3" fill="#38d6ff"/>' +
        '<path d="M92 200 q-26 8 -34 34" stroke="url(#hb-c)" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="57" cy="236" r="9" fill="#38d6ff"/>' +
        '<path d="M208 200 q26 8 34 34" stroke="url(#hb-c)" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="243" cy="236" r="9" fill="#38d6ff"/>';
      hub.classList.add('vivo');
      quadro(reduz ? 9.6 : tempo());
    }

    // ponto u (0..1) da perna no instante t: curva base + onda que corre + balanço lento; as pontas ficam presas
    var OM = 2 * Math.PI * 4 / D;
    function ponto(l, u, t) {
      var v = 1 - u, x = v * v * l.ax + 2 * v * u * l.mx + u * u * l.ex, y = v * v * l.ay + 2 * v * u * l.my + u * u * l.ey;
      var o = Math.sin(Math.PI * u) * (l.amp * Math.sin(2 * Math.PI * 1.6 * u - OM * t + l.fase) + l.amp * 0.55 * Math.sin(OM * 0.5 * t + l.fase));
      return [x + l.px * o, y + l.py * o];
    }
    function caminho(l, t, ate) {
      var n = 22, m = Math.max(1, Math.round(n * ate)), d = '';
      for (var k = 0; k <= m; k++) { var p = ponto(l, Math.min(1, k / n), t); d += (k ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }
      return d;
    }
    function quadro(t) {
      var reset = t >= APAGA;
      legs.forEach(function (l, i) {
        var viagem = reset ? 0 : Math.max(0, Math.min(1, (t - (ATIVA[i] - VIAGEM)) / VIAGEM));
        var ehDec = i === iDec, parado = ehDec && t >= ATIVA[i] && t < LIBERA && !reset;
        l.base.setAttribute('d', caminho(l, t, 1));
        if (viagem > 0) { l.luz.setAttribute('d', caminho(l, t, viagem)); l.luz.style.opacity = '1'; } else l.luz.style.opacity = '0';
        l.luz.classList.toggle('stop', parado);
        var pe = ponto(l, 1, t); l.gota.setAttribute('cx', pe[0].toFixed(1)); l.gota.setAttribute('cy', pe[1].toFixed(1));
        l.gota.classList.toggle('acesa', viagem >= 1);
        l.pulsos.forEach(function (c, k) {
          var on = viagem >= 1 && !parado && !reduz;
          c.style.opacity = on ? '1' : '0';
          if (on) { var u = ((t - ATIVA[i]) * 0.8 + k * 0.5) % 1; var p = ponto(l, u, t); c.setAttribute('cx', p[0].toFixed(1)); c.setAttribute('cy', p[1].toFixed(1)); }
        });
        var c = cards[i], aceso = !reset && t >= ATIVA[i];
        c.g.classList.toggle('aceso', aceso);
        c.g.classList.toggle('parado', parado);
        c.g.classList.toggle('feito', aceso && (!ehDec || t >= LIBERA));
        if (c.pill) {
          var mostra = parado || (!reset && t >= LIBERA && t < LIBERA + 1.3);
          c.pill.classList.toggle('vis', mostra);
          c.pill.classList.toggle('ok', !parado);
          c.pill.txt.textContent = parado ? '■ STOP · decisão humana' : '✓ aprovado';
        }
      });
    }
    function tempo() { return ((performance.now() / 1000 - t0) % D + D) % D; }
    function laco() {
      if (!visivel || document.hidden) { rodando = false; return; }
      quadro(tempo()); requestAnimationFrame(laco);
    }
    function liga() { if (!reduz && !rodando && visivel && !document.hidden) { rodando = true; requestAnimationFrame(laco); } }
    montar();
    t0 = performance.now() / 1000;
    if (temIO) new IntersectionObserver(function (e) { var antes = visivel; visivel = e[0].isIntersecting; if (visivel && !antes) t0 = performance.now() / 1000; liga(); }, { threshold: 0.2 }).observe(hub);
    else liga();
    document.addEventListener('visibilitychange', liga);
    var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { montar(); }, 150); });
  })();

  /* ================= demonstração do formulário (segue o tipo escolhido no topo) =================
     Landing e Cardápio: nome, ramo e fotos → esboço → prévia → no ar.
     Sistema e Automação: "Preço a consultar" → briefing → proposta (sem preço) → aprovação.
     Sem interação, passa pelos 4 tipos sozinha; com um clique, fica no tipo escolhido.
     Movimento reduzido: sem animação; o seletor mostra direto o fim de cada tipo. */
  var fd = document.getElementById('fd');
  if (!fd) return;
  var q = function (s) { return fd.querySelector(s); };
  var qa = function (s) { return Array.prototype.slice.call(fd.querySelectorAll(s)); };
  // exemplos fictícios (os mesmos do formulário de verdade: placeholders e sugestões de lá)
  var TIPOS = {
    landing:   { proj: false, nome: 'Barbearia Dois Irmãos', rot2: 'Ramo', campo2: 'Barbearia', cta: 'Chamar no WhatsApp', fim: 'Site no ar', slug: 'barbearia-dois-irmaos', url: 'site' },
    cardapio:  { proj: false, nome: 'Hamburgueria do Bairro', rot2: 'Ramo', campo2: 'Hamburgueria', cta: 'Pedir no WhatsApp', fim: 'Cardápio no ar', slug: 'hamburgueria-do-bairro', url: 'cardapio' },
    sistema:   { proj: true, nome: 'Contabilidade Central', rot2: 'O que o sistema precisa fazer?', campo2: 'Ler meus contratos em PDF e responder dúvidas da equipe', prop: 'Sistema Contabilidade Central', itens: ['Leitura dos contratos em PDF', 'Respostas para a equipe', 'Acesso por usuário'], fim: 'Proposta aprovada', sub: 'a construção começa · exemplo', url: 'sistema' },
    automacao: { proj: true, nome: 'Clínica Bem-Estar', rot2: 'O que deve acontecer sozinho?', campo2: 'Lembrete automático do horário marcado', prop: 'Automação Clínica Bem-Estar', itens: ['Lê a agenda do dia', 'Manda o lembrete na hora certa', 'Anota quem confirmou'], fim: 'Proposta aprovada', sub: 'a construção começa · exemplo', url: 'automacao' }
  };
  var ORDEM = ['landing', 'cardapio', 'sistema', 'automacao'];
  var abas = qa('.fd-tipos [role="tab"]');
  var trilho = qa('.fd-trilho li');
  var prog = q('.fd-prog i'), np = q('.fd-np'), nf = q('.fd-nf');
  var digs = qa('.fd-dig'), rot2 = q('.fd-rot2');
  var ops = qa('.fd-op'), fotos = qa('.fd-fotos span'), bt = q('.fd-bt');
  var heroNome = q('.fd-hero strong'), heroRamo = q('.fd-hero small'), heroCta = q('.fd-cta');
  var selo = q('.fd-selo-prev'), noarB = q('.fd-noar b'), noarS = q('.fd-noar small');
  var propNome = q('.fd-prop-nome'), propItens = qa('.fd-prop-itens li');
  var cta = document.querySelector('#pedido .acoes a');
  var tipo = 'landing', escolhido = false;
  var timers = [], rodando = false, visivel = false;

  function depois(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function limpa() { timers.forEach(clearTimeout); timers = []; }
  function rotulos(el, proj) { var v = el.getAttribute(proj ? 'data-proj' : 'data-site'); if (v) el.textContent = v; }

  function aplicaTipo(k) {
    tipo = k; var T = TIPOS[k];
    fd.setAttribute('data-tipo', k);
    fd.classList.toggle('proj', T.proj);
    abas.forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-tipo') === k ? 'true' : 'false'); b.tabIndex = b.getAttribute('data-tipo') === k ? 0 : -1; });
    trilho.forEach(function (li) { rotulos(li, T.proj); });
    [bt, selo].forEach(function (el) { if (el) rotulos(el, T.proj); });
    if (rot2) rot2.textContent = T.rot2;
    digs[0].setAttribute('data-texto', T.nome); digs[1].setAttribute('data-texto', T.campo2);
    if (heroCta) heroCta.textContent = T.cta || '';
    if (noarB) noarB.textContent = T.fim;
    if (noarS) noarS.textContent = T.proj ? T.sub : 'sites.clickgo.dev.br/' + T.slug + ' · exemplo';
    if (propNome) propNome.textContent = T.prop || '';
    propItens.forEach(function (li, i) { li.textContent = (T.itens && T.itens[i]) || ''; });
    if (cta) cta.href = '/esboco/?tipo=' + T.url;
  }
  function etapa(e, passo) {
    fd.setAttribute('data-e', String(e));
    trilho.forEach(function (li) { li.classList.toggle('ok', Number(li.getAttribute('data-e')) <= e); });
    if (passo) { np.textContent = String(passo); prog.style.transform = 'scaleX(' + (passo / 8) + ')'; }
  }
  function espelha(i, txt) {
    var T = TIPOS[tipo];
    if (i === 0 && heroNome) heroNome.textContent = txt || 'Seu negócio';
    if (i === 1 && heroRamo && !T.proj) heroRamo.textContent = txt || 'Seu ramo';
  }
  function digita(i, ms, fim) {
    var elx = digs[i], txt = elx.getAttribute('data-texto'), k = 0;
    elx.textContent = ''; elx.classList.add('digitando');
    (function um() {
      k++; elx.textContent = txt.slice(0, k); espelha(i, txt.slice(0, k));
      if (k < txt.length) depois(ms, um); else { elx.classList.remove('digitando'); if (fim) fim(); }
    })();
  }
  function zera() {
    ops.forEach(function (o) { o.classList.remove('on'); });
    fotos.forEach(function (f) { f.classList.remove('on'); });
    if (bt) bt.classList.remove('on');
    digs.forEach(function (d) { d.textContent = ''; d.classList.remove('digitando'); });
    espelha(0, ''); espelha(1, '');
    if (nf) nf.textContent = '0';
  }
  function cheio() { // estado final do tipo (movimento reduzido)
    var T = TIPOS[tipo];
    ops.forEach(function (o) { o.classList.toggle('on', o.getAttribute('data-tipo') === tipo); });
    digs.forEach(function (d, i) { d.textContent = d.getAttribute('data-texto'); espelha(i, d.textContent); });
    fotos.forEach(function (f) { f.classList.add('on'); }); if (nf) nf.textContent = '3';
    etapa(5, 8);
    return T;
  }
  function ciclo() {
    limpa(); zera();
    var T = TIPOS[tipo];
    etapa(0, 1);
    depois(900, function () { var o = q('.fd-op[data-tipo="' + tipo + '"]'); if (o) o.classList.add('on'); });
    depois(2000, function () {
      etapa(1, 2);
      digita(0, 55, function () { depois(250, function () { digita(1, T.proj ? 28 : 70); }); });
    });
    depois(T.proj ? 6400 : 5600, function () {
      etapa(2, 6);
      if (!T.proj) fotos.forEach(function (f, k) { depois(350 + k * 550, function () { f.classList.add('on'); if (nf) nf.textContent = String(k + 1); }); });
    });
    depois(8300, function () { etapa(3, 8); depois(500, function () { if (bt) bt.classList.add('on'); }); });
    depois(10600, function () { etapa(4, 8); });
    depois(13200, function () { etapa(5, 8); });
    depois(17000, function () {
      if (!visivel) { rodando = false; return; }
      if (!escolhido) aplicaTipo(ORDEM[(ORDEM.indexOf(tipo) + 1) % ORDEM.length]);
      ciclo();
    });
  }
  function liga() { if (!rodando && visivel && !document.hidden) { rodando = true; ciclo(); } }
  function desliga() { limpa(); rodando = false; }

  // seletor (só aparece com JS); setas do teclado trocam de aba
  var tl = q('.fd-tipos'); if (tl) tl.hidden = false;
  function escolhe(k) {
    escolhido = true; aplicaTipo(k);
    if (reduz) { cheio(); return; }
    limpa(); rodando = false; liga();
  }
  abas.forEach(function (b, i) {
    b.addEventListener('click', function () { escolhe(b.getAttribute('data-tipo')); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
      e.preventDefault(); var nb = abas[(i + d + abas.length) % abas.length]; nb.focus(); escolhe(nb.getAttribute('data-tipo'));
    });
  });

  fd.classList.add('rodando');
  aplicaTipo('landing');
  if (reduz) { cheio(); return; }
  etapa(0, 1); zera();
  if (temIO) {
    new IntersectionObserver(function (e) {
      visivel = e[0].isIntersecting;
      if (visivel) liga(); else desliga();
    }, { threshold: 0.15 }).observe(fd);
  } else { visivel = true; liga(); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) desliga(); else liga(); });
})();
