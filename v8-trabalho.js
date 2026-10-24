/* ClickGo v8: dados dos trabalhos do portfólio (protótipo). Só trabalhos REAIS já citados na página inicial.
   Carregado síncrono no <head> de trabalho-v8.html para preencher a página antes do primeiro quadro, assim a imagem
   compartilhada (view-transition-name) já existe quando a transição entre páginas começa. Sem HTML vindo de fora:
   tudo é textContent/atributos, e o ?p= só escolhe uma chave da lista abaixo. */
(function () {
  'use strict';
  var T = {
    eah: { n: '01', tipo: 'Site com agenda', nome: 'English at Home', desc: 'Aulas de inglês online. O aluno escolhe o dia e a hora da aula experimental, e o professor confirma pelo painel.', tem: 'Agenda de aula experimental, área do aluno, página do professor parceiro', como: 'Site estático com agenda ligada ao WhatsApp; formulário com proteção contra robô', link: 'https://cursoenglishathome.online', img: 'assets/port-eah-desktop.webp', w: 1200, h: 750, vt: 'trab-eah' },
    orbix: { n: '02', tipo: 'Site de links', nome: 'Orbix', desc: 'Site de links de afiliado com a Lila, avatar criado com IA. Cada clique é medido e os produtos trocam sozinhos.', tem: 'Links por produto, fundo animado leve, tema claro e escuro, medição de cliques', como: 'Página gerada pelo servidor, sem biblioteca pesada; animação em canvas que para quando a aba some', link: 'https://orbixbr.onrender.com', img: 'assets/port-orbix-desktop.webp', w: 1200, h: 750, vt: 'trab-orbix' },
    clickgo: { n: '03', tipo: 'Vitrine', nome: 'ClickGo', desc: 'Este site: a vitrine, o formulário que pede a prévia, a página de acompanhamento e a sala do cliente.', tem: 'Prévia grátis, pagamento pelo Mercado Pago, sala do site com chat e mudanças', como: 'Site estático no Render + Cloudflare, sem script de fora além da medição; cabeçalhos de segurança (CSP)', link: 'https://clickgo.dev.br', img: 'assets/hero-poster.webp', w: 1280, h: 720, vt: 'trab-clickgo' }
  };
  var ordem = ['eah', 'orbix', 'clickgo'];
  var p = (new URLSearchParams(location.search).get('p') || '').toLowerCase();
  if (!T[p]) p = 'eah';
  var t = T[p], i = ordem.indexOf(p);
  var ant = T[ordem[(i + ordem.length - 1) % ordem.length]], prox = T[ordem[(i + 1) % ordem.length]];
  function pronto() {
    var g = function (id) { return document.getElementById(id); };
    document.title = t.nome + ' · ClickGo';
    g('t-num').textContent = t.n; g('t-tipo').textContent = t.tipo; g('t-nome').textContent = t.nome; g('t-desc').textContent = t.desc;
    g('t-tem').textContent = t.tem; g('t-como').textContent = t.como;
    var l = g('t-link'); l.textContent = t.link.replace(/^https?:\/\//, ''); l.href = t.link;
    var im = g('t-img'); im.src = t.img; im.width = t.w; im.height = t.h; im.alt = 'Tela do site ' + t.nome; im.style.viewTransitionName = t.vt;
    var a = g('t-ant'); a.href = 'trabalho-v8.html?p=' + ordem[(i + ordem.length - 1) % ordem.length]; a.querySelector('b').textContent = ant.nome;
    var x = g('t-prox'); x.href = 'trabalho-v8.html?p=' + ordem[(i + 1) % ordem.length]; x.querySelector('b').textContent = prox.nome;
  }
  // o script roda no <head>: espera o corpo existir, mas ANTES do primeiro quadro (DOMContentLoaded vem antes da pintura)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pronto); else pronto();
})();
