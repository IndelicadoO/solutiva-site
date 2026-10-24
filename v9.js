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
    if (flut) { var hs = d.querySelector('.historia'); flut.classList.toggle('on', y > (hs ? hs.offsetHeight - w.innerHeight * .2 : w.innerHeight * .8)); }
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
  // ---- história v9: palco preso ao topo; a animação CONTA a ClickGo e avança com a rolagem ----
  // Capítulos (fração da rolagem dentro de .historia): 0 título · 1 o cardápio se monta e a foto do prato entra ·
  // 2 o cliente toca no + e o pedido voa até o celular do dono (plim) · 3 a agenda da barbearia se preenche · 4 o site no ar.
  // Canvas 2D sem biblioteca; mouse = paralaxe leve; fora da tela pausa; movimento reduzido = 4 quadros parados.
  var hist = $('.historia'), cv = $('.abre-canvas');
  if (hist && cv && cv.getContext) (function () {
    var ctx = cv.getContext('2d'); if (!ctx) return;
    var abre = cv.parentNode;
    var cel = !w.matchMedia('(min-width: 900px)').matches;
    var AC = '#ff5a36', AC2 = '#ff7a5c', TXT = '#fff3e4', TXT2 = '#cdbfae', SUP = '#262120', SUP2 = '#332b27', LINHA = '#3a322d', LINHA2 = '#5a4f47', ESC = '#1a0c08', ZAP = '#25d366', ZAP2 = '#0b3d22', FUNDO = '#171310';
    var CAPS = [0, .12, .36, .58, .80, 1];
    var W = 0, H = 0, dpr = 1, R0 = null, R1 = null, fundo = null;
    var mx = .5, my = .5, amx = .5, amy = .5, temMouse = false, p = 0, pv = 0, intro = 0, rodando = false, naTela = true, raf = 0, t0 = 0, tAtual = 0, ultimoDesenho = -1, capAtual = -1;
    var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
    var lerp = function (a, b, k) { return a + (b - a) * k; };
    var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };
    var easeIn = function (x) { return x * x * x; };
    var easeBack = function (x) { var c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
    var faixa = function (a, b) { return clamp((pv - a) / (b - a)); };       // progresso local entre dois pontos da rolagem
    var seq = function (q, i, n, dur) { return clamp((q - (i / n) * (1 - dur)) / dur); }; // item i de n entra em sequência
    var mede = function () {
      W = abre.clientWidth; H = abre.clientHeight; dpr = Math.min(w.devicePixelRatio || 1, cel ? 1.5 : 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var gut = Math.max(16, Math.min(48, W * .04));
      if (cel) {
        // celular: no capítulo 0 o palco fica ACIMA do título; nos outros o título some e o palco cresce (a legenda fica embaixo)
        var txt = abre.querySelector('.abre-txt'), topoTxt = txt ? (txt.getBoundingClientRect().top - abre.getBoundingClientRect().top) : H * .5;
        R0 = { x: gut, y: 84, w: W - gut * 2, h: Math.max(200, H * .6) }; // o celular espia por trás do bloco de texto (que tem fundo sólido no celular)
        R1 = { x: gut, y: 84, w: W - gut * 2, h: Math.max(200, H - 84 - 196) };
      } else {
        R0 = R1 = { x: W * .5, y: 100, w: W * .5 - gut, h: H - 100 - 56 };
      }
      fundo = d.createElement('canvas'); fundo.width = cv.width; fundo.height = cv.height;
      var fc = fundo.getContext('2d'); fc.setTransform(dpr, 0, 0, dpr, 0, 0); fc.fillStyle = LINHA;
      var passo = cel ? 28 : 36;
      for (var gx = (W % passo) / 2; gx < W; gx += passo) for (var gy = 20; gy < H; gy += passo) fc.fillRect(gx, gy, 1.5, 1.5);
      ultimoDesenho = -1;
    };
    var retang = function (x, y, wd, ht, r) { if (wd <= 0 || ht <= 0) return; r = Math.min(r, wd / 2, ht / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + wd - r, y); ctx.arcTo(x + wd, y, x + wd, y + r, r); ctx.lineTo(x + wd, y + ht - r); ctx.arcTo(x + wd, y + ht, x + wd - r, y + ht, r); ctx.lineTo(x + r, y + ht); ctx.arcTo(x, y + ht, x, y + ht - r, r); ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath(); };
    var cheio = function (cor, x, y, wd, ht, r) { ctx.fillStyle = cor; retang(x, y, wd, ht, r); ctx.fill(); };
    var traco = function (cor, x, y, wd, ht, r, lw) { ctx.strokeStyle = cor; ctx.lineWidth = lw || 1.5; retang(x, y, wd, ht, r); ctx.stroke(); };
    var circulo = function (cor, x, y, r, soTraco) { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, 6.2832); if (soTraco) { ctx.strokeStyle = cor; ctx.stroke(); } else { ctx.fillStyle = cor; ctx.fill(); } };
    var check = function (cor, x, y, s) { ctx.strokeStyle = cor; ctx.lineWidth = Math.max(1.5, s * .22); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x - s * .45, y); ctx.lineTo(x - s * .1, y + s * .35); ctx.lineTo(x + s * .5, y - s * .35); ctx.stroke(); ctx.lineCap = 'butt'; };
    var aneis = function (cor, x, y, k, rmax) { if (k <= 0 || k >= 1) return; for (var i = 0; i < 3; i++) { var kk = clamp(k * 1.4 - i * .2); if (kk <= 0 || kk >= 1) continue; ctx.globalAlpha *= (1 - kk); circulo(cor, x, y, rmax * kk, true); ctx.globalAlpha /= (1 - kk); } };
    // a foto do prato: uma pizza desenhada (círculo tomate, borda creme, fatias e rodelas)
    var pizza = function (x, y, r) {
      circulo(TXT, x, y, r); circulo(AC, x, y, r * .86); ctx.strokeStyle = TXT; ctx.lineWidth = Math.max(1, r * .06);
      for (var i = 0; i < 4; i++) { var a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * r * .86, y - Math.sin(a) * r * .86); ctx.lineTo(x + Math.cos(a) * r * .86, y + Math.sin(a) * r * .86); ctx.stroke(); }
      [[.45, .3], [-.4, .35], [.1, -.5], [-.35, -.3], [.5, -.15]].forEach(function (q) { circulo(ESC, x + q[0] * r * .7, y + q[1] * r * .7, r * .13); });
    };
    // celular: moldura; devolve a área da tela
    var celular = function (F, k) {
      if (k <= 0) return null;
      var s = easeBack(k), cx = F.x + F.w / 2, cy = F.y + F.h / 2;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy);
      cheio(TXT, F.x - 3, F.y - 3, F.w + 6, F.h + 6, F.w * .14);
      cheio(FUNDO, F.x, F.y, F.w, F.h, F.w * .12);
      cheio(SUP, F.x + F.w * .04, F.y + F.w * .04, F.w * .92, F.h - F.w * .08, F.w * .09);
      cheio(FUNDO, F.x + F.w * .32, F.y + F.w * .06, F.w * .36, F.w * .06, F.w * .03); // entalhe
      ctx.restore();
      return { x: F.x + F.w * .04, y: F.y + F.w * .16, w: F.w * .92, h: F.h - F.w * .22 };
    };
    // CAP 1: o cardápio se monta peça por peça dentro da tela T; q = 0..1; retorna geometria útil
    var cardapio = function (T, q, extras) {
      var g = {}, u = T.w, pad = u * .06, e;
      var entra = function (i, n) { return easeOut(seq(q, i, n, .3)); };
      ctx.save(); retang(T.x, T.y, T.w, T.h, u * .09); ctx.clip();
      // cabeçalho: nome e horário
      e = entra(0, 9); if (e > 0) { ctx.globalAlpha = e; var dy = (1 - e) * -18; cheio(TXT, T.x + pad, T.y + pad + dy, u * .5, u * .07, 3); cheio(LINHA2, T.x + pad, T.y + pad + u * .1 + dy, u * .34, u * .04, 2); circulo(ZAP, T.x + T.w - pad - u * .04, T.y + pad + u * .04, u * .025); ctx.globalAlpha = 1; }
      // categorias
      var cy = T.y + pad + u * .2;
      for (var c = 0; c < 4; c++) { e = entra(1 + c * .35, 9); if (e <= 0) continue; ctx.globalAlpha = e; var cx = T.x + pad + c * u * .23 + (1 - e) * 20; if (c === 0) { cheio(AC, cx, cy, u * .2, u * .085, 4); cheio(ESC, cx + u * .04, cy + u * .03, u * .12, u * .025, 2); } else { traco(LINHA2, cx, cy, u * .2, u * .085, 4); cheio(TXT2, cx + u * .04, cy + u * .03, u * .12, u * .025, 2); } ctx.globalAlpha = 1; }
      // itens
      var iy = cy + u * .14, ih = u * .22; g.itens = [];
      for (var i = 0; i < 3; i++) {
        var y = iy + i * (ih + u * .04); e = entra(3 + i, 9); if (e <= 0) break; ctx.globalAlpha = e;
        var ox = (1 - e) * 26;
        cheio(SUP2, T.x + pad + ox, y, T.w - pad * 2, ih, 6);
        var foto = { x: T.x + pad + u * .03 + ox, y: y + u * .03, s: ih - u * .06 }; cheio(LINHA, foto.x, foto.y, foto.s, foto.s, 5);
        if (i > 0 || (extras && extras.pizzaPronta)) { if (i === 1) { var hx = foto.x + foto.s * .2, hw2 = foto.s * .6, hy = foto.y + foto.s * .22; cheio(TXT, hx, hy, hw2, foto.s * .2, foto.s * .1); cheio(ZAP, hx - foto.s * .03, hy + foto.s * .2, hw2 + foto.s * .06, foto.s * .06, 2); cheio(AC, hx, hy + foto.s * .27, hw2, foto.s * .14, 3); cheio(TXT, hx, hy + foto.s * .42, hw2, foto.s * .14, 4); } else if (i === 2) { cheio(AC, foto.x + foto.s * .2, foto.y + foto.s * .3, foto.s * .6, foto.s * .45, 4); cheio(TXT, foto.x + foto.s * .3, foto.y + foto.s * .2, foto.s * .4, foto.s * .14, 3); } }
        var tx = foto.x + foto.s + u * .04; cheio(TXT, tx, y + u * .04, u * .3, u * .035, 2); cheio(LINHA2, tx, y + u * .095, u * .36, u * .025, 2); cheio(AC, tx, y + u * .15, u * .16, u * .03, 2);
        var mais = { x: T.x + T.w - pad - u * .1 + ox, y: y + ih / 2, r: u * .055 }; g.itens.push({ foto: foto, mais: mais, y: y, h: ih });
        var ativo = extras && extras.toque > 0 && i === 0;
        circulo(AC, mais.x, mais.y, mais.r); if (ativo) { circulo(TXT, mais.x, mais.y, mais.r); check(AC, mais.x, mais.y, mais.r * .9); } else { ctx.fillStyle = ESC; ctx.fillRect(mais.x - mais.r * .5, mais.y - 1.2, mais.r, 2.4); ctx.fillRect(mais.x - 1.2, mais.y - mais.r * .5, 2.4, mais.r); }
        ctx.globalAlpha = 1;
      }
      // botão de pedir (fica verde quando o cliente toca)
      e = entra(7, 9); if (e > 0) {
        ctx.globalAlpha = e; var by = T.y + T.h - pad - u * .14 + (1 - e) * 20, verde = extras ? extras.verde : 0;
        g.cta = { x: T.x + pad, y: by, w: T.w - pad * 2, h: u * .13 };
        cheio(AC, g.cta.x, by, g.cta.w, g.cta.h, 6); if (verde > 0) { ctx.globalAlpha = e * verde; cheio(ZAP, g.cta.x, by, g.cta.w, g.cta.h, 6); ctx.globalAlpha = e; }
        cheio(verde > .5 ? ZAP2 : ESC, g.cta.x + g.cta.w * .28, by + g.cta.h * .38, g.cta.w * .44, g.cta.h * .24, 2);
        if (extras && extras.toque > 0) { var bx = g.cta.x + g.cta.w - u * .06, bb = by - u * .02; circulo(TXT, bx, bb, u * .05 * easeBack(clamp(extras.toque * 2))); cheio(ESC, bx - u * .012, bb - u * .02, u * .024, u * .04, 1); }
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      return g;
    };
    // CAP 3: agenda da barbearia dentro da tela T
    var ORDEM = [4, 1, 7, 10, 2, 8, 0, 11, 5, 9];
    var agenda = function (T, q) {
      var u = T.w, pad = u * .06, e;
      ctx.save(); retang(T.x, T.y, T.w, T.h, u * .09); ctx.clip();
      e = easeOut(clamp(q / .2)); if (e > 0) {
        ctx.globalAlpha = e; var dy = (1 - e) * -16;
        // ícone da barbearia: tesoura simplificada (dois anéis e duas lâminas)
        var ix = T.x + pad + u * .06, iy = T.y + pad + u * .06 + dy; ctx.lineWidth = 2;
        circulo(AC, ix - u * .03, iy + u * .035, u * .025, true); circulo(AC, ix + u * .03, iy + u * .035, u * .025, true);
        ctx.strokeStyle = TXT; ctx.beginPath(); ctx.moveTo(ix - u * .02, iy + u * .015); ctx.lineTo(ix + u * .05, iy - u * .05); ctx.moveTo(ix + u * .02, iy + u * .015); ctx.lineTo(ix - u * .05, iy - u * .05); ctx.stroke();
        cheio(TXT, ix + u * .1, T.y + pad + u * .02 + dy, u * .42, u * .06, 3); cheio(LINHA2, ix + u * .1, T.y + pad + u * .11 + dy, u * .3, u * .035, 2);
        ctx.globalAlpha = 1;
      }
      // semana: 6 dias, o terceiro escolhido
      var dy2 = T.y + pad + u * .24, dw = (T.w - pad * 2 - u * .1) / 6;
      for (var dI = 0; dI < 6; dI++) { e = easeOut(seq(clamp((q - .1) / .35), dI, 6, .4)); if (e <= 0) continue; ctx.globalAlpha = e; var dx = T.x + pad + dI * (dw + u * .02), sel = dI === 2; if (sel) cheio(AC, dx, dy2 + (1 - e) * 10, dw, u * .2, 5); else traco(LINHA2, dx, dy2 + (1 - e) * 10, dw, u * .2, 5); cheio(sel ? ESC : TXT, dx + dw * .3, dy2 + u * .05 + (1 - e) * 10, dw * .4, u * .035, 2); cheio(sel ? ESC : LINHA2, dx + dw * .22, dy2 + u * .12 + (1 - e) * 10, dw * .56, u * .03, 2); ctx.globalAlpha = 1; }
      // horários: 3 colunas x 4 linhas; vão sendo marcados na ORDEM
      var hy = dy2 + u * .3, hw = (T.w - pad * 2 - u * .06) / 3, hh = u * .15, qh = clamp((q - .3) / .45), qm = clamp((q - .5) / .5);
      for (var h = 0; h < 12; h++) {
        e = easeOut(seq(qh, h, 12, .35)); if (e <= 0) continue; ctx.globalAlpha = e;
        var col = h % 3, lin = Math.floor(h / 3), hx = T.x + pad + col * (hw + u * .03), yy = hy + lin * (hh + u * .035) + (1 - e) * 12;
        var pos = ORDEM.indexOf(h), m = pos < 0 ? 0 : easeBack(seq(qm, pos, ORDEM.length, .3));
        traco(LINHA2, hx, yy, hw, hh, 4); cheio(TXT2, hx + hw * .25, yy + hh * .38, hw * .5, hh * .22, 2);
        if (m > 0) { ctx.save(); ctx.translate(hx + hw / 2, yy + hh / 2); ctx.scale(m, m); ctx.translate(-(hx + hw / 2), -(yy + hh / 2)); cheio(AC, hx, yy, hw, hh, 4); check(ESC, hx + hw * .5, yy + hh * .5, hh * .5); ctx.restore(); }
        ctx.globalAlpha = 1;
      }
      // rodapé: "confirmado" em verde quando a agenda está cheia
      e = easeOut(clamp((q - .88) / .12)); if (e > 0) { ctx.globalAlpha = e; var fy = T.y + T.h - pad - u * .13; cheio(ZAP, T.x + pad, fy, T.w - pad * 2, u * .12, 6); cheio(ZAP2, T.x + pad + u * .28, fy + u * .045, T.w - pad * 2 - u * .56, u * .03, 2); check(ZAP2, T.x + pad + u * .18, fy + u * .06, u * .06); ctx.globalAlpha = 1; }
      ctx.restore();
    };
    // CAP 4: janela do navegador com o site no ar
    var navegador = function (B, q, noAr) {
      var e = easeBack(clamp(q / .3)); if (e <= 0) return;
      ctx.save(); ctx.translate(B.x + B.w / 2, B.y + B.h / 2); ctx.scale(e, e); ctx.translate(-(B.x + B.w / 2), -(B.y + B.h / 2));
      cheio(TXT, B.x - 2, B.y - 2, B.w + 4, B.h + 4, 12); cheio(FUNDO, B.x, B.y, B.w, B.h, 10);
      var bar = B.w * .06; cheio(SUP, B.x, B.y, B.w, bar, 10); cheio(SUP, B.x, B.y + bar / 2, B.w, bar / 2, 0);
      [AC, TXT2, ZAP].forEach(function (c, i) { circulo(c, B.x + bar * .5 + i * bar * .42, B.y + bar / 2, bar * .14); });
      var ux = B.x + bar * 2.2; cheio(FUNDO, ux, B.y + bar * .22, B.w - bar * 3.4, bar * .56, bar * .28); // barra de endereço
      ctx.strokeStyle = TXT2; ctx.lineWidth = 1.2; retang(ux + bar * .3, B.y + bar * .4, bar * .16, bar * .2, 2); ctx.stroke(); circulo(TXT2, ux + bar * .38, B.y + bar * .4, bar * .09, true); // cadeado
      cheio(TXT2, ux + bar * .6, B.y + bar * .44, B.w * .3, bar * .12, 2);
      var dot = { x: B.x + B.w - bar * .6, y: B.y + bar / 2 }; circulo(noAr > 0 ? ZAP : LINHA2, dot.x, dot.y, bar * .14);
      // o site dentro: barra, título, foto, 3 cartões (entra em sequência)
      var S = { x: B.x + B.w * .05, y: B.y + bar + B.w * .04, w: B.w * .9 }, qq = clamp((q - .25) / .6), k;
      ctx.save(); retang(B.x, B.y + bar, B.w, B.h - bar, 10); ctx.clip();
      k = easeOut(seq(qq, 0, 6, .4)); if (k > 0) { ctx.globalAlpha = k; cheio(SUP, S.x, S.y, S.w, S.w * .06, 4); cheio(AC, S.x + S.w * .02, S.y + S.w * .015, S.w * .06, S.w * .03, 2); for (var n = 0; n < 3; n++) cheio(TXT2, S.x + S.w * (.6 + n * .11), S.y + S.w * .022, S.w * .07, S.w * .016, 2); ctx.globalAlpha = 1; }
      k = easeOut(seq(qq, 1, 6, .4)); if (k > 0) { ctx.globalAlpha = k; var ty = S.y + S.w * .1 + (1 - k) * 14; cheio(TXT, S.x, ty, S.w * .42, S.w * .07, 3); cheio(TXT, S.x, ty + S.w * .09, S.w * .3, S.w * .07, 3); cheio(AC, S.x, ty + S.w * .09, S.w * .3, S.w * .07, 3); cheio(LINHA2, S.x, ty + S.w * .2, S.w * .36, S.w * .03, 2); cheio(AC, S.x, ty + S.w * .27, S.w * .16, S.w * .06, 3); ctx.globalAlpha = 1; }
      k = easeOut(seq(qq, 2, 6, .4)); if (k > 0) { ctx.globalAlpha = k; var fx = S.x + S.w * .52, fy = S.y + S.w * .1 + (1 - k) * 14, fs = S.w * .3; cheio(SUP2, fx, fy, S.w * .48, fs, 6); pizza(fx + S.w * .24, fy + fs / 2, fs * .36); ctx.globalAlpha = 1; }
      for (var c = 0; c < 3; c++) { k = easeOut(seq(qq, 3 + c, 6, .4)); if (k <= 0) continue; ctx.globalAlpha = k; var cx = S.x + c * S.w * .34, cyy = S.y + S.w * .46 + (1 - k) * 14; cheio(SUP2, cx, cyy, S.w * .3, S.w * .22, 5); cheio(LINHA, cx + S.w * .02, cyy + S.w * .02, S.w * .26, S.w * .1, 4); cheio(TXT, cx + S.w * .02, cyy + S.w * .14, S.w * .16, S.w * .025, 2); cheio(AC, cx + S.w * .02, cyy + S.w * .18, S.w * .1, S.w * .02, 2); ctx.globalAlpha = 1; }
      ctx.restore();
      // "no ar": anéis verdes no ponto e confete sólido (quadradinhos tomate/creme) caindo uma vez
      if (noAr > 0) { ctx.lineWidth = 2; aneis(ZAP, dot.x, dot.y, noAr, bar * 1.6); }
      ctx.restore();
      if (noAr > 0 && noAr < 1) {
        for (var i = 0; i < 14; i++) { var f = (i * 7919) % 100 / 100, g2 = (i * 104729) % 100 / 100, kk = clamp(noAr * 1.3 - f * .3); if (kk <= 0 || kk >= 1) continue; ctx.save(); ctx.globalAlpha = 1 - kk; ctx.translate(B.x + f * B.w, B.y - 10 + easeIn(kk) * B.h * .9 + kk * 20); ctx.rotate(kk * 6 * (g2 - .5)); cheio(i % 3 ? AC : TXT, -4, -4, 8, 8, 1); ctx.restore(); }
      }
    };
    var quadro = function (t) {
      ctx.clearRect(0, 0, W, H);
      if (fundo) ctx.drawImage(fundo, 0, 0, W, H);
      amx += (mx - amx) * .08; amy += (my - amy) * .08;
      var par = cel ? 0 : 1;
      var kR = clamp((p - (CAPS[1] - .03)) / .07);   // celular: o palco cresce quando o título some (pela rolagem real, não pela abertura)
      var R = { x: lerp(R0.x, R1.x, kR), y: lerp(R0.y, R1.y, kR), w: lerp(R0.w, R1.w, kR), h: lerp(R0.h, R1.h, kR) };
      // geometria do celular principal (no cap 4 ele vai para o canto e encolhe)
      var fh = Math.min(R.h * .96, R.w * (cel ? .58 : .6) * 2.05), fw = fh / 2.05;
      var F = { x: R.x + (cel ? (R.w - fw) / 2 : R.w * .42 - fw / 2), y: cel ? R.y + (R.h - fh) / 2 * kR : R.y + (R.h - fh) / 2, w: fw, h: fh };
      var q4 = faixa(CAPS[4], CAPS[4] + .22), k4 = easeOut(q4);
      if (k4 > 0) { var s4 = lerp(1, cel ? .42 : .72, k4); var F4 = cel ? { x: R.x + R.w - fw * s4, y: R.y + R.h - fh * s4 } : { x: R.x, y: R.y + R.h - fh * s4 - R.h * .02 }; F = { x: lerp(F.x, F4.x, k4), y: lerp(F.y, F4.y, k4), w: fw * s4, h: fh * s4 }; }
      ctx.save(); ctx.translate((amx - .5) * 14 * par, (amy - .5) * 8 * par);
      // capítulo 4 atrás do celular: a janela do navegador
      if (q4 > 0) {
        var B = cel ? { x: R.x, y: R.y, w: R.w, h: Math.min(R.h * .78, R.w * .72) } : { x: F.x + F.w + 28, y: R.y + R.h * .06, w: R.x + R.w - (F.x + F.w + 28), h: 0 };
        if (!cel) B.h = Math.min(R.h * .88, B.w * .76);
        navegador(B, q4, faixa(CAPS[4] + .16, CAPS[4] + .2) > 0 ? faixa(CAPS[4] + .16, CAPS[5]) : 0);
      }
      // celular principal
      var kF = reduz ? 1 : clamp(intro * 3); var T = celular(F, kF);
      if (T) {
        var q1 = faixa(CAPS[1], CAPS[2]), q2 = faixa(CAPS[2], CAPS[3]), q3 = faixa(CAPS[3], CAPS[4]);
        var somePrimeiro = easeOut(clamp(q3 / .15));
        // cap 1 + 2 (cardápio, toque, botão verde); some quando a agenda chega
        if (somePrimeiro < 1) {
          ctx.save(); ctx.globalAlpha = 1 - somePrimeiro; ctx.translate(0, -somePrimeiro * T.h * .5);
          var qIntro = Math.max(q1, clamp((intro - .33) / .67) * .45); // a abertura já mostra o cardápio se montando, sem rolar
          var ex = { toque: clamp((q2 - .05) / .2), verde: easeOut(clamp((q2 - .22) / .18)), pizzaPronta: q1 > .62 };
          var g = cardapio(T, qIntro, ex);
          // a foto do prato voa de fora e pousa no primeiro item
          var qp = clamp((q1 - .62) / .26);
          if (qp > 0 && g.itens && g.itens[0]) { var fo = g.itens[0].foto, k = easeOut(qp), ax = T.x - T.w * .7, ay = T.y - T.h * .35, dx = fo.x + fo.s / 2, dy = fo.y + fo.s / 2, px = lerp(ax, dx, k), py = lerp(ay, dy, k) - Math.sin(k * Math.PI) * T.h * .12; ctx.save(); ctx.translate(px, py); ctx.rotate((1 - k) * -1.4); ctx.scale(lerp(1.6, 1, easeBack(qp)), lerp(1.6, 1, easeBack(qp))); pizza(0, 0, fo.s * .42); ctx.restore(); }
          else if (qp <= 0 && g.itens && g.itens[0] && q1 > .3) { /* quadrado vazio aguardando a foto */ }
          // dedo do cliente tocando no +
          if (ex.toque > 0 && g.itens && g.itens[0]) { var m = g.itens[0].mais, kt = ex.toque; ctx.lineWidth = 2; aneis(TXT, m.x, m.y, clamp(kt * 1.6), m.r * 4); var dk = clamp(kt * 2.2); if (dk < 1) { ctx.globalAlpha = (1 - somePrimeiro) * (1 - easeIn(dk)); circulo(TXT, m.x + (1 - dk) * 30, m.y + (1 - dk) * 40, m.r * .9); ctx.globalAlpha = 1 - somePrimeiro; } }
          ctx.restore();
          // cap 2: o segundo celular (do dono) e a bolha que voa com o pedido
          var qd = clamp((q2 - .25) / .2), kd = easeBack(qd);
          if (qd > 0 && somePrimeiro < 1) {
            var dw = F.w * .5, dh = dw * 2.05, D = cel ? { x: R.x + R.w - dw - 4, y: R.y + 6, w: dw, h: dh } : { x: R.x + R.w - dw - 8, y: R.y + R.h * .06, w: dw, h: dh };
            ctx.save(); ctx.globalAlpha = 1 - somePrimeiro; ctx.translate((1 - kd) * 80, 0);
            var TD = celular(D, 1);
            if (TD) { ctx.save(); retang(TD.x, TD.y, TD.w, TD.h, TD.w * .09); ctx.clip(); cheio(TXT, TD.x + TD.w * .08, TD.y + TD.w * .1, TD.w * .4, TD.w * .06, 2); for (var l = 0; l < 4; l++) cheio(LINHA2, TD.x + TD.w * .08, TD.y + TD.w * (.28 + l * .16), TD.w * .84, TD.w * .08, 4); ctx.restore(); }
            // a bolha
            var qb = clamp((q2 - .42) / .4), kb = easeOut(qb);
            if (qb > 0 && g.cta && TD) {
              var sx = g.cta.x + g.cta.w / 2, sy = g.cta.y, tx = TD.x + TD.w / 2, ty = TD.y + TD.w * .36, bx = lerp(sx, tx, kb), by = lerp(sy, ty, kb) - Math.sin(kb * Math.PI) * (cel ? 50 : 90);
              var bw = Math.max(44, F.w * .46) * lerp(1, .9, kb), bh = bw * .46;
              ctx.save(); ctx.translate(bx, by); ctx.scale(easeBack(clamp(qb * 3)), easeBack(clamp(qb * 3)));
              cheio(ZAP, -bw / 2, -bh / 2, bw, bh, 8); ctx.fillStyle = ZAP; ctx.beginPath(); ctx.moveTo(-bw / 2 + 6, bh / 2 - 1); ctx.lineTo(-bw / 2 - 5, bh / 2 + 6); ctx.lineTo(-bw / 2 + 14, bh / 2 - 1); ctx.fill();
              pizza(-bw / 2 + bh * .42, 0, bh * .28); cheio(ZAP2, -bw / 2 + bh * .85, -bh * .22, bw * .5, bh * .14, 2); cheio(ZAP2, -bw / 2 + bh * .85, bh * .06, bw * .34, bh * .14, 2);
              ctx.restore();
            }
            // plim: a bolha chega, anéis verdes e a notificação desce na tela do dono
            var qPlim = clamp((q2 - .8) / .2);
            if (qPlim > 0 && TD) { ctx.lineWidth = 2; aneis(ZAP, TD.x + TD.w / 2, TD.y + TD.w * .36, qPlim, TD.w * .9); var kn = easeBack(qPlim); cheio(ZAP, TD.x + TD.w * .06, TD.y + TD.w * .04 + (kn - 1) * 30, TD.w * .88, TD.w * .18, 6); circulo(TXT, TD.x + TD.w * .18, TD.y + TD.w * .13 + (kn - 1) * 30, TD.w * .05); cheio(ZAP2, TD.x + TD.w * .3, TD.y + TD.w * .1 + (kn - 1) * 30, TD.w * .5, TD.w * .05, 2); }
            ctx.restore();
          }
        }
        // cap 3: agenda da barbearia
        if (q3 > 0) { var ea = easeOut(clamp((q3 - .08) / .2)); if (ea > 0) { ctx.save(); ctx.globalAlpha = ea; ctx.translate(0, (1 - ea) * T.h * .35); agenda(T, clamp((q3 - .08) / .92)); ctx.restore(); } }
      }
      ctx.restore();
    };
    var CAP_IDX = function (v) { for (var i = CAPS.length - 2; i >= 0; i--) if (v >= CAPS[i]) return i; return 0; };
    var leRolagem = function () {
      var topoH = hist.getBoundingClientRect().top + (w.scrollY || 0), alt = hist.offsetHeight - H;
      p = alt > 0 ? clamp(((w.scrollY || 0) - topoH) / alt) : 0;
      if (reduz) { var c = CAP_IDX(p); p = c === 0 ? 0 : CAPS[c + 1] - .001; } // movimento reduzido: quadros parados, no fim de cada capítulo
      pv = Math.max(p, Math.min(intro, 1) * CAPS[1] * .999);
      var c2 = CAP_IDX(pv === 0 ? 0 : p);
      if (c2 !== capAtual) { capAtual = c2; hist.setAttribute('data-cap', String(c2)); }
      hist.style.setProperty('--p', p.toFixed(4));
    };
    var laco = function (ts) {
      if (!rodando) return;
      if (!t0) t0 = ts; tAtual = (ts - t0) / 1000; intro = clamp(tAtual / 2.6);
      leRolagem();
      var chave = Math.round(pv * 4000) + '|' + Math.round(amx * 200) + '|' + Math.round(amy * 200) + '|' + (intro < 1 ? Math.round(tAtual * 60) : 0);
      // no celular (sem mouse) só redesenha quando a rolagem ou a abertura mudaram: poupa bateria
      if (!cel || chave !== ultimoDesenho) { ultimoDesenho = chave; quadro(tAtual); }
      raf = w.requestAnimationFrame(laco);
    };
    var liga = function () { if (rodando || !naTela || d.hidden) return; rodando = true; raf = w.requestAnimationFrame(laco); };
    var desliga = function () { rodando = false; if (raf) w.cancelAnimationFrame(raf); raf = 0; };
    mede();
    if (reduz) { intro = 1; leRolagem(); quadro(99); w.addEventListener('scroll', function () { leRolagem(); quadro(99); }, { passive: true }); }
    else {
      liga();
      abre.addEventListener('mousemove', function (e) { var r = abre.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width; my = (e.clientY - r.top) / r.height; temMouse = true; }, { passive: true });
      abre.addEventListener('mouseleave', function () { mx = .5; my = .5; temMouse = false; }, { passive: true });
      if ('IntersectionObserver' in w) { new IntersectionObserver(function (es) { naTela = es[0].isIntersecting; if (naTela) liga(); else desliga(); }).observe(hist); }
      d.addEventListener('visibilitychange', function () { if (d.hidden) desliga(); else liga(); });
    }
    // seta "rolar": vai para o primeiro capítulo (sem JS o href leva ao cardápio)
    var rolar = $('.abre .rolar');
    if (rolar) rolar.addEventListener('click', function (e) { e.preventDefault(); w.scrollTo({ top: hist.offsetTop + (hist.offsetHeight - H) * (CAPS[1] + .02), behavior: reduz ? 'auto' : 'smooth' }); });
    var rt; w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { var c2 = !w.matchMedia('(min-width: 900px)').matches; if (c2 !== cel) { w.location.reload(); return; } mede(); if (reduz) { leRolagem(); quadro(99); } }, 200); });
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
