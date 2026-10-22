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
