/* ClickGo v9 (protótipo 2, 24/10/2026): a interação da nova página inicial, paleta oficial grafite + lima.
   - Abertura: animação de fundo PRÓPRIA em canvas ("site sendo montado": as peças de um site voam e se encaixam, reagem ao
     mouse e se desmontam ao rolar). Pausa fora da tela e com a aba escondida; movimento reduzido = quadro final parado;
     no celular menos peças e DPR limitado. Sem biblioteca.
   - Como funciona: índice numerado gigante grudado que troca conforme a etapa entra na tela.
   - Sem biblioteca. ~6 KB. Tudo que anima é transform/opacity (CSS); aqui só troca classe e estado.
   - View Transitions: entre estados (filtro do portfólio, categorias do cardápio) com document.startViewTransition e
     fallback (troca na hora); entre páginas o CSS declara @view-transition e o navegador faz (Firefox: navegação normal).
   - Entrada ao rolar: só onde o CSS não sabe animation-timeline (IntersectionObserver põe .in). Sem JS nada fica escondido.
   - Vídeo do topo só carrega depois da pintura e nunca com movimento/dados reduzidos.
   - Demonstrações (cardápio e agenda) são fictícias: nada vai para WhatsApp nenhum. */
(function () {
  'use strict';
  var d = document, w = window, html = d.documentElement;
  html.classList.remove('sem-js'); html.classList.add('js');
  var reduz = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // transição "pulada" (outra começou antes, aba escondida) rejeita a promessa finished: não é erro, só silencia
  var troca = function (fn) { if (!reduz && d.startViewTransition) { var t = d.startViewTransition(fn); if (t && t.finished && t.finished.catch) t.finished.catch(function () {}); if (t && t.ready && t.ready.catch) t.ready.catch(function () {}); } else fn(); };
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };

  var ano = $('#ano'); if (ano) ano.textContent = new Date().getFullYear();

  // ---- título: cada palavra sobe (só na página inicial) ----
  var h1 = $('[data-palavras]');
  if (h1 && !reduz) {
    var k = 0;
    var envolve = function (no) {
      Array.prototype.slice.call(no.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = d.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(d.createTextNode(' ')); return; }
            var s = d.createElement('span'); s.className = 'palavra'; var i = d.createElement('span'); i.textContent = p; i.style.setProperty('--i', k++); s.appendChild(i); frag.appendChild(s);
          });
          no.replaceChild(frag, c);
        } else if (c.nodeType === 1) envolve(c);
      });
    };
    envolve(h1);
  }

  // ---- fontes do Google depois da primeira pintura (o CSS delas travava ~0,9 s no 4G medido em 24/10) ----
  var fl = document.querySelector('link[data-fontes]');
  if (fl) { var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = fl.href; document.head.appendChild(l); }

  // ---- entrada ao rolar onde o CSS não sabe animation-timeline ----
  if (!(w.CSS && CSS.supports && CSS.supports('animation-timeline: view()')) && 'IntersectionObserver' in w) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -10% 0px' });
    $$('.rv, .trilha').forEach(function (el) { io.observe(el); });
  } else { $$('.rv').forEach(function (el) { el.classList.add('in'); }); }
  // os "checks" marcam ao entrar (também com animation-timeline, que não sabe pôr classe)
  if ('IntersectionObserver' in w) {
    var ioc = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { $$('li', e.target).forEach(function (li, i) { setTimeout(function () { li.classList.add('in'); }, reduz ? 0 : 120 + i * 110); }); ioc.unobserve(e.target); } }); }, { threshold: .4 });
    $$('.checks').forEach(function (el) { ioc.observe(el); });
  } else { $$('.checks li').forEach(function (li) { li.classList.add('in'); }); }

  // ---- topo some ao descer e volta ao subir; botão flutuante aparece depois da abertura ----
  var topo = $('#topo'), flut = $('#flut'), ultimo = 0, tick = false;
  var rola = function () {
    var y = w.scrollY || 0;
    if (topo) topo.classList.toggle('oculto', y > 120 && y > ultimo);
    if (flut) flut.classList.toggle('on', y > w.innerHeight * .8);
    ultimo = y; tick = false;
  };
  w.addEventListener('scroll', function () { if (!tick) { tick = true; w.requestAnimationFrame(rola); } }, { passive: true });
  // seção atual no menu
  var links = $$('.menu a[href^="#"]');
  if (links.length && 'IntersectionObserver' in w) {
    var ios = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); }); }, { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) ios.observe(s); });
  }

  // ---- demonstração do cardápio (fictícia) ----
  var itens = $('#itens');
  if (itens) {
    var ICO = { pizza: 'M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9zM3 12l9 9 9-9M9 9h.01M14 8h.01', massa: 'M4 10h16M4 14h16M6 18h12M6 6h12', bebida: 'M6 3h12l-1.5 17h-9zM8 8h8', doce: 'M12 3l3 5h-6zM6 8h12l-1 12H7z' };
    var CAT = {
      pizzas: [['Margherita', 'molho, muçarela, manjericão', '42,00', 'pizza', '#f6c6a3'], ['Calabresa', 'calabresa, cebola, azeitona', '46,00', 'pizza', '#f3b08b'], ['Quatro queijos', 'muçarela, provolone, gorgonzola, parmesão', '54,00', 'pizza', '#f9dcb0'], ['Portuguesa', 'presunto, ovo, ervilha, cebola', '49,00', 'pizza', '#eab79b']],
      massas: [['Lasanha à bolonhesa', 'serve 2', '38,00', 'massa', '#f2b5a0'], ['Nhoque ao sugo', 'batata, molho de tomate', '32,00', 'massa', '#f6c6a3'], ['Penne ao pesto', 'manjericão, nozes', '36,00', 'massa', '#cfe3b7']],
      bebidas: [['Refrigerante lata', '350 ml', '6,00', 'bebida', '#bfe3f2'], ['Suco natural', 'laranja, limão ou abacaxi', '9,00', 'bebida', '#f9e3a1'], ['Água', 'com ou sem gás', '4,00', 'bebida', '#d6ecf5']],
      doces: [['Pizza de brigadeiro', 'brigadeiro, granulado', '39,00', 'doce', '#d9b8a8'], ['Petit gâteau', 'com sorvete', '22,00', 'doce', '#e7c9b4']]
    };
    var qtd = 0, total = 0, nEl = $('#carrinho-n'), tEl = $('#carrinho-t'), car = $('#carrinho');
    var brl = function (v) { return 'R$ ' + v.toFixed(2).replace('.', ','); };
    var desenha = function (cat) {
      itens.innerHTML = '';
      (CAT[cat] || []).forEach(function (it, i) {
        var a = d.createElement('article'); a.className = 'item'; a.style.setProperty('--i', i); a.style.setProperty('--c', it[4]);
        var ic = d.createElement('i'); ic.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + ICO[it[3]] + '"/></svg>'; a.appendChild(ic);
        var tx = d.createElement('div'); var b = d.createElement('b'); b.textContent = it[0]; var s = d.createElement('small'); s.textContent = it[1]; var e = d.createElement('em'); e.textContent = 'R$ ' + it[2]; tx.appendChild(b); tx.appendChild(s); tx.appendChild(e); a.appendChild(tx);
        var bt = d.createElement('button'); bt.type = 'button'; bt.className = 'add'; bt.textContent = '+'; bt.setAttribute('aria-label', 'Adicionar ' + it[0] + ' ao pedido (demonstração)');
        bt.addEventListener('click', function () {
          qtd++; total += parseFloat(it[2].replace(',', '.'));
          nEl.textContent = qtd; tEl.textContent = brl(total); car.classList.add('on');
          nEl.classList.remove('pulo'); bt.classList.remove('pulo'); void nEl.offsetWidth; nEl.classList.add('pulo'); bt.classList.add('pulo');
          setTimeout(function () { bt.classList.remove('pulo'); nEl.classList.remove('pulo'); }, 350);
        });
        a.appendChild(bt); itens.appendChild(a);
      });
    };
    desenha('pizzas');
    $$('.chip').forEach(function (c) {
      c.addEventListener('click', function () {
        if (c.getAttribute('aria-pressed') === 'true') return;
        $$('.chip').forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        c.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduz ? 'auto' : 'smooth' });
        troca(function () { desenha(c.getAttribute('data-cat')); });
      });
    });
    car.addEventListener('click', function () { qtd = 0; total = 0; car.classList.remove('on'); nEl.textContent = '0'; tEl.textContent = brl(0); });
  }

  // ---- demonstração da agenda (fictícia) ----
  var dias = $('#dias'), horas = $('#horas');
  if (dias && horas) {
    var NOMES = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'], hoje = new Date(), diaSel = null, horaSel = null;
    var conf = $('#confirma'), confT = $('#confirma-t');
    var HORAS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    var atualiza = function () {
      if (diaSel == null || !horaSel) { conf.classList.remove('on'); return; }
      var dt = new Date(hoje); dt.setDate(hoje.getDate() + diaSel);
      confT.textContent = NOMES[dt.getDay()] + ' ' + dt.getDate() + '/' + (dt.getMonth() + 1) + ' às ' + horaSel;
      conf.classList.add('on');
    };
    var desenhaHoras = function () {
      horas.innerHTML = ''; horaSel = null;
      HORAS.forEach(function (h, i) {
        var b = d.createElement('button'); b.type = 'button'; b.className = 'hora'; b.textContent = h; b.style.setProperty('--i', i); b.setAttribute('aria-pressed', 'false');
        // ocupado de mentira: varia com o dia, para a demonstração parecer viva (determinístico, sem sorteio)
        if ((i + diaSel) % 4 === 1) { b.disabled = true; b.setAttribute('aria-label', h + ', ocupado'); }
        b.addEventListener('click', function () { $$('.hora', horas).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); b.setAttribute('aria-pressed', 'true'); horaSel = h; atualiza(); });
        horas.appendChild(b);
      });
      atualiza();
    };
    for (var i = 0; i < 7; i++) (function (i) {
      var dt = new Date(hoje); dt.setDate(hoje.getDate() + i);
      var b = d.createElement('button'); b.type = 'button'; b.className = 'dia'; b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      b.innerHTML = '<b></b>'; b.querySelector('b').textContent = dt.getDate(); b.appendChild(d.createTextNode(i === 0 ? 'hoje' : NOMES[dt.getDay()]));
      b.addEventListener('click', function () { $$('.dia', dias).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); b.setAttribute('aria-pressed', 'true'); diaSel = i; troca(desenhaHoras); });
      dias.appendChild(b);
    })(i);
    diaSel = 0; desenhaHoras();
    $('#confirma-b').addEventListener('click', function () { confT.textContent = 'enviado (demonstração)'; });
  }

  // ---- portfólio: índice revela a imagem; filtro com View Transition ----
  var lista = $('#port-lista');
  if (lista) {
    var vis = $$('.port-vis img'), cap = $('#port-cap');
    var mostra = function (a) {
      var id = a.getAttribute('data-img');
      vis.forEach(function (im) { im.classList.toggle('on', im.getAttribute('data-img') === id); });
      if (cap) cap.textContent = $('b', a).textContent;
      $$('.trab', lista).forEach(function (x) { x.classList.toggle('ativo', x === a); });
    };
    $$('.trab', lista).forEach(function (a) { a.addEventListener('mouseenter', function () { mostra(a); }); a.addEventListener('focus', function () { mostra(a); }); });
    $$('.filtro').forEach(function (f) {
      f.addEventListener('click', function () {
        var alvo = f.getAttribute('data-f');
        $$('.filtro').forEach(function (x) { x.setAttribute('aria-pressed', x === f ? 'true' : 'false'); });
        troca(function () {
          var primeiro = null;
          $$('.trab', lista).forEach(function (a) { var ok = alvo === 'todos' || a.getAttribute('data-f') === alvo; a.hidden = !ok; if (ok && !primeiro) primeiro = a; });
          if (primeiro) mostra(primeiro);
        });
      });
    });
  }

  // ---- transição entre páginas: o cartão clicado "vira" a imagem grande da página do trabalho ----
  w.addEventListener('pageswap', function (e) {
    if (!e.viewTransition || !lista) return;
    var url = e.activation && e.activation.entry && e.activation.entry.url || '';
    var m = /trabalho-v9\.html\?p=([a-z]+)/.exec(url);
    if (!m) return;
    // no celular a imagem grande está escondida: quem viaja é a miniatura da lista
    var cel = !w.matchMedia('(min-width: 900px)').matches;
    vis.forEach(function (im) { im.style.viewTransitionName = (!cel && im.getAttribute('data-img') === m[1]) ? 'trab-' + m[1] : 'none'; });
    if (cel) { var mini = $('.trab[data-img="' + m[1] + '"] .trab-img'); if (mini) mini.style.viewTransitionName = 'trab-' + m[1]; }
  });
  // ---- abertura v9: "site sendo montado" (canvas 2D, sem biblioteca) ----
  var cv = $('.abre-canvas');
  if (cv && cv.getContext) (function () {
    var ctx = cv.getContext('2d'); if (!ctx) return;
    var abre = cv.parentNode;
    var cel = !w.matchMedia('(min-width: 900px)').matches;
    var LIMA = '#ff5a36', TXT = '#fff3e4', SUP = '#262120', LINHA = '#3a322d', LINHA2 = '#5a4f47'; // tomate e creme sobre o grafite quente da abertura (LIMA = nome histórico da cor de destaque)
    // o "site" em frações do retângulo R: [x, y, w, h, tipo, profundidade (parallax), só-computador?]
    var LAYOUT = [
      [0, 0, 1, .07, 'barra', 1], [.02, .018, .06, .034, 'logo', 2], [.62, .024, .08, .022, 'nav', 2, 1], [.72, .024, .08, .022, 'nav', 2, 1], [.82, .024, .08, .022, 'nav', 2, 1], [.9, .016, .08, .038, 'cta', 3],
      [.02, .11, .5, .13, 'titulo', 2], [.02, .26, .36, .035, 'texto', 1], [.02, .31, .3, .035, 'texto', 1, 1], [.02, .38, .16, .06, 'cta', 3], [.2, .38, .16, .06, 'bt', 2, 1],
      [.56, .11, .42, .33, 'foto', 2],
      [.02, .5, .3, .08, 'item', 1], [.02, .6, .3, .08, 'item', 1], [.02, .7, .3, .08, 'item', 1, 1], [.02, .8, .3, .08, 'item', 1, 1],
      [.36, .5, .62, .05, 'texto', 1, 1],
      [.36, .58, .085, .09, 'dia', 2], [.46, .58, .085, .09, 'dia', 2], [.56, .58, .085, .09, 'dia', 2, 1], [.66, .58, .085, .09, 'dia', 2, 1], [.76, .58, .085, .09, 'dia', 2, 1], [.86, .58, .085, .09, 'dia', 3],
      [.36, .7, .13, .07, 'hora', 1], [.51, .7, .13, .07, 'hora', 1, 1], [.66, .7, .13, .07, 'hora', 1, 1], [.81, .7, .13, .07, 'hora', 3],
      [.36, .8, .62, .08, 'cta', 3]
    ].filter(function (p) { return !(cel && p[6]); });
    var W = 0, H = 0, dpr = 1, R = { x: 0, y: 0, w: 0, h: 0 }, pecas = [], fundo = null;
    var t0 = 0, rodando = false, naTela = true, mx = .5, my = .5, amx = .5, amy = .5, temMouse = false, rolou = 0, ultimaVarredura = 0;
    var rnd = function (a, b) { return a + Math.random() * (b - a); };
    var easeOut = function (x) { return 1 - Math.pow(1 - x, 4); };
    var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
    var mede = function () {
      W = abre.clientWidth; H = abre.clientHeight; dpr = Math.min(w.devicePixelRatio || 1, cel ? 1.5 : 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var gut = Math.max(16, Math.min(48, W * .04));
      if (cel) {
        // celular: o "site" fica no espaço ACIMA do texto (o texto encosta embaixo); nunca por cima do título
        var txt = abre.querySelector('.abre-txt'), topoTxt = txt ? (txt.getBoundingClientRect().top - abre.getBoundingClientRect().top) : H * .5;
        var alt = Math.min(H * .5, topoTxt - 84 - 18);
        R = { x: gut, y: 84, w: W - gut * 2, h: Math.max(120, alt) };
      }
      else { R = { x: W * .57, y: 108, w: W * .43 - gut, h: Math.min(H - 170, (W * .43 - gut) * 1.15) }; }
      pecas = LAYOUT.map(function (p, i) {
        var ang = rnd(0, Math.PI * 2), dist = Math.max(W, H) * rnd(.35, .7);
        return { x: R.x + p[0] * R.w, y: R.y + p[1] * R.h, w: p[2] * R.w, h: p[3] * R.h, tipo: p[4], prof: p[5],
          dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist, rot: rnd(-.6, .6), atraso: (i / LAYOUT.length) * 1.3 + rnd(0, .25), dur: rnd(.9, 1.4), fase: rnd(0, 6.28) };
      });
      // grade de pontos desenhada uma vez (fundo)
      fundo = d.createElement('canvas'); fundo.width = cv.width; fundo.height = cv.height;
      var fc = fundo.getContext('2d'); fc.setTransform(dpr, 0, 0, dpr, 0, 0); fc.fillStyle = LINHA;
      var passo = cel ? 28 : 36;
      for (var gx = (W % passo) / 2; gx < W; gx += passo) for (var gy = 20; gy < H; gy += passo) fc.fillRect(gx, gy, 1.5, 1.5);
    };
    var retang = function (x, y, wd, ht, r) { r = Math.min(r, wd / 2, ht / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + wd - r, y); ctx.arcTo(x + wd, y, x + wd, y + r, r); ctx.lineTo(x + wd, y + ht - r); ctx.arcTo(x + wd, y + ht, x + wd - r, y + ht, r); ctx.lineTo(x + r, y + ht); ctx.arcTo(x, y + ht, x, y + ht - r, r); ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath(); };
    var desenhaPeca = function (p, hover) {
      var x = -p.w / 2, y = -p.h / 2, wd = p.w, ht = p.h;
      ctx.lineWidth = 1.5;
      switch (p.tipo) {
        case 'barra': ctx.fillStyle = SUP; retang(x, y, wd, ht, 6); ctx.fill(); ctx.strokeStyle = LINHA2; ctx.stroke(); break;
        case 'logo': ctx.fillStyle = LIMA; retang(x, y, wd, ht, 4); ctx.fill(); break;
        case 'nav': case 'texto': ctx.fillStyle = hover ? LIMA : LINHA2; retang(x, y, wd, ht, ht / 2); ctx.fill(); break;
        case 'titulo': ctx.fillStyle = TXT; retang(x, y, wd, ht * .42, 4); ctx.fill(); retang(x, y + ht * .55, wd * .7, ht * .42, 4); ctx.fill(); break;
        case 'cta': ctx.fillStyle = hover ? '#ff7a5c' : LIMA; retang(x, y, wd, ht, 4); ctx.fill(); ctx.fillStyle = '#1a0c08'; retang(x + wd * .2, y + ht * .38, wd * .6, ht * .24, 2); ctx.fill(); break;
        case 'bt': ctx.strokeStyle = TXT; ctx.lineWidth = 2; retang(x, y, wd, ht, 4); ctx.stroke(); ctx.fillStyle = hover ? LIMA : TXT; retang(x + wd * .2, y + ht * .38, wd * .6, ht * .24, 2); ctx.fill(); break;
        case 'foto': ctx.fillStyle = SUP; retang(x, y, wd, ht, 8); ctx.fill(); ctx.strokeStyle = hover ? LIMA : LINHA2; ctx.lineWidth = 2; ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 8, y + 8); ctx.lineTo(x + wd - 8, y + ht - 8); ctx.moveTo(x + wd - 8, y + 8); ctx.lineTo(x + 8, y + ht - 8); ctx.strokeStyle = LINHA2; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = LIMA; ctx.beginPath(); ctx.arc(x + wd * .74, y + ht * .3, Math.max(4, ht * .07), 0, 6.283); ctx.fill(); break;
        case 'item': ctx.strokeStyle = hover ? LIMA : LINHA2; retang(x, y, wd, ht, 6); ctx.stroke(); ctx.fillStyle = SUP; retang(x + 6, y + 6, ht - 12, ht - 12, 4); ctx.fill(); ctx.fillStyle = LINHA2; retang(x + ht + 2, y + ht * .25, wd * .45, ht * .16, 3); ctx.fill(); ctx.fillStyle = LIMA; retang(x + ht + 2, y + ht * .55, wd * .22, ht * .16, 3); ctx.fill(); ctx.strokeStyle = LIMA; ctx.beginPath(); ctx.arc(x + wd - ht * .5, y + ht * .5, ht * .22, 0, 6.283); ctx.stroke(); break;
        case 'dia': ctx.strokeStyle = p.prof === 3 || hover ? LIMA : LINHA2; retang(x, y, wd, ht, 5); ctx.stroke(); if (p.prof === 3) { ctx.fillStyle = LIMA; ctx.fill(); } ctx.fillStyle = p.prof === 3 ? '#1a0c08' : TXT; retang(x + wd * .3, y + ht * .3, wd * .4, ht * .18, 2); ctx.fill(); ctx.fillStyle = p.prof === 3 ? '#1a0c08' : LINHA2; retang(x + wd * .25, y + ht * .6, wd * .5, ht * .12, 2); ctx.fill(); break;
        case 'hora': if (p.prof === 3) { ctx.fillStyle = LIMA; retang(x, y, wd, ht, 5); ctx.fill(); ctx.fillStyle = '#1a0c08'; } else { ctx.strokeStyle = hover ? LIMA : LINHA2; retang(x, y, wd, ht, 5); ctx.stroke(); ctx.fillStyle = TXT; } retang(x + wd * .25, y + ht * .38, wd * .5, ht * .24, 2); ctx.fill(); break;
      }
    };
    var quadro = function (t) {
      ctx.clearRect(0, 0, W, H);
      if (fundo) ctx.drawImage(fundo, 0, 0, W, H);
      amx += (mx - amx) * .08; amy += (my - amy) * .08;
      var desmonta = clamp(1 - rolou / (H * .85));             // rolou = as peças voltam a se soltar
      var pronto = 1;
      for (var i = 0; i < pecas.length; i++) {
        var p = pecas[i];
        var k = reduz ? 1 : easeOut(clamp((t - p.atraso) / p.dur)) * desmonta;
        if (k < pronto) pronto = k;
        if (k <= 0.001) continue;
        var par = (1 - k), px = (amx - .5) * p.prof * (cel ? 0 : 16), py = (amy - .5) * p.prof * (cel ? 0 : 10);
        var resp = reduz ? 0 : Math.sin(t * 1.2 + p.fase) * 1.4 * k;
        var cx = p.x + p.w / 2 + p.dx * par + px, cy = p.y + p.h / 2 + p.dy * par + py + resp;
        var hover = temMouse && !cel && k > .95 && mx * W > p.x && mx * W < p.x + p.w && my * H > p.y && my * H < p.y + p.h;
        ctx.save(); ctx.globalAlpha = Math.min(1, k * 1.4); ctx.translate(cx, cy); ctx.rotate(p.rot * par); desenhaPeca(p, hover); ctx.restore();
      }
      // varredura: um traço de lima passa pelo site montado de tempos em tempos
      if (!reduz && pronto > .98 && t > 2.8) {
        if (!ultimaVarredura || t - ultimaVarredura > 6.5) ultimaVarredura = t;
        var vt = (t - ultimaVarredura) / 1.3;
        if (vt < 1) { var vy = R.y + R.h * vt; ctx.globalAlpha = .55 * (1 - vt); ctx.fillStyle = LIMA; ctx.fillRect(R.x, vy, R.w, 1.5); ctx.globalAlpha = 1; }
      }
    };
    var raf = 0;
    var laco = function (ts) { if (!rodando) return; if (!t0) t0 = ts; quadro((ts - t0) / 1000); raf = w.requestAnimationFrame(laco); };
    var liga = function () { if (reduz || rodando || !naTela || d.hidden) return; rodando = true; raf = w.requestAnimationFrame(laco); };
    var desliga = function () { rodando = false; if (raf) w.cancelAnimationFrame(raf); raf = 0; };
    mede();
    if (reduz) { quadro(99); }
    else {
      liga();
      abre.addEventListener('mousemove', function (e) { var r = abre.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width; my = (e.clientY - r.top) / r.height; temMouse = true; }, { passive: true });
      abre.addEventListener('mouseleave', function () { mx = .5; my = .5; temMouse = false; }, { passive: true });
      w.addEventListener('scroll', function () { rolou = w.scrollY || 0; }, { passive: true });
      if ('IntersectionObserver' in w) { new IntersectionObserver(function (es) { naTela = es[0].isIntersecting; if (naTela) liga(); else desliga(); }).observe(abre); }
      d.addEventListener('visibilitychange', function () { if (d.hidden) desliga(); else liga(); });
    }
    var rt; w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { var c2 = !w.matchMedia('(min-width: 900px)').matches; if (c2 !== cel) { w.location.reload(); return; } mede(); if (reduz) quadro(99); }, 200); });
  })();

  // ---- como funciona v9: índice numerado gigante grudado ----
  var ng = $('.indice-fixo .ng span'), nt = $('.indice-fixo .nt'), nd = $('.indice-fixo .nd'), passos = $$('.passo9');
  if (passos.length && 'IntersectionObserver' in w) {
    var atual = -1, trocando = 0;
    var poe = function (i) {
      if (i === atual) return; atual = i; var p = passos[i];
      passos.forEach(function (x, k) { x.classList.toggle('on', k === i); });
      if (!ng) return;
      var num = ('0' + (i + 1)).slice(-2), tit = $('b', p).textContent, desc = $('span', p).textContent;
      if (reduz) { ng.textContent = num; nt.textContent = tit; nd.textContent = desc; return; }
      clearTimeout(trocando); ng.classList.add('sai');
      trocando = setTimeout(function () { ng.textContent = num; nt.textContent = tit; nd.textContent = desc; ng.classList.remove('sai'); ng.classList.add('entra'); void ng.offsetWidth; ng.classList.remove('entra'); }, 200);
    };
    var iop = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) poe(passos.indexOf(e.target)); }); }, { rootMargin: '-38% 0px -48% 0px' });
    passos.forEach(function (p) { iop.observe(p); });
    poe(0);
  }
})();
