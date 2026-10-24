/* ClickGo · SUBIR DE PLANO na sala do site (dono 24/10/2026).
   O app manda em r.sala.planos SÓ os pacotes acima do atual que estão à venda (nome, diferença da implantação, mensalidade
   nova, o que inclui). A página só escolhe o NOME do pacote: "Quero este plano" -> confirma -> tipo "upgrade" -> o pagamento
   (diferença da implantação) aparece no quadro do Pix desta página; a mensalidade nova vale a partir do próximo vencimento.
   Nenhum preço escrito aqui. acompanhar.js chama window.CGSalaPlanos.desenhar(estado, { mandar, toast }) a cada atualização.
   Sólido (sem vidro), movimento só transform/opacity, prefers-reduced-motion. Sem script inline. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var api = null, escolhido = '', assinatura = '';

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function brl(v) { return window.CGVitrine ? window.CGVitrine.preco(Number(v) || 0) : 'R$ ' + (Number(v) || 0).toLocaleString('pt-BR'); }
  function data(iso) { try { return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); } catch (e) { return ''; } }
  function depois(ancora, no) { if (ancora && ancora.parentNode && no.previousElementSibling !== ancora) ancora.parentNode.insertBefore(no, ancora.nextSibling); }

  function montar() {
    var sec = el('section', 'cgp'); sec.id = 'cgp'; sec.setAttribute('aria-labelledby', 'cgp-t');
    sec.innerHTML = '<div class="cgp-cab"><h2 id="cgp-t">Suba de plano</h2><p class="cg-sub cgp-sub"></p></div>' +
      '<p class="cgp-aberto" hidden></p><div class="cgp-meus" hidden></div><div class="cgp-grade"></div>' +
      '<form class="cgp-confirma cg-sala-form" hidden novalidate><p class="cgp-c-t"></p><p class="cgp-c-s"></p>' +
      '<div class="cg-sala-acoes"><button type="button" class="cgp-voltar">Agora não</button><button type="submit" class="cg-btn cg-btn-prim">Quero, ir para o pagamento</button></div></form>';
    var f = sec.querySelector('.cgp-confirma');
    sec.querySelector('.cgp-voltar').onclick = function () { f.hidden = true; escolhido = ''; marcar(); };
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!escolhido) return;
      var b = f.querySelector('button[type=submit]'); b.disabled = true;
      api.mandar('', { tipo: 'upgrade', pacote: escolhido }).then(function () {
        api.toast('Pedido enviado! O pagamento da diferença aparece aqui em instantes.'); f.hidden = true; escolhido = ''; marcar();
      }).catch(function () {}).finally(function () { b.disabled = false; });
    });
    return sec;
  }
  function marcar() {
    Array.prototype.forEach.call(document.querySelectorAll('.cgp-card'), function (c) { c.classList.toggle('cgp-on', c.dataset.pacote === escolhido); var b = c.querySelector('.cgp-quero'); if (b) b.setAttribute('aria-pressed', String(c.dataset.pacote === escolhido)); });
  }
  function abrir(sec, u, atual) {
    escolhido = u.pacote; marcar();
    var f = sec.querySelector('.cgp-confirma');
    f.querySelector('.cgp-c-t').textContent = 'Passar do ' + (atual || 'plano atual') + ' para o ' + u.pacote + ' · ' + brl(u.diferenca) + ' hoje';
    f.querySelector('.cgp-c-s').textContent = 'Você paga só a diferença da implantação, uma vez. ' + (u.mensalidade > 0 ? 'A mensalidade passa a ' + brl(u.mensalidade) + ' por mês a partir do próximo vencimento. ' : '') + 'Confirmado o pagamento, o plano muda na hora e a equipe fala com você aqui sobre o que o plano novo inclui.';
    f.hidden = false;
    f.scrollIntoView({ behavior: 'smooth', block: 'center' });
    f.querySelector('button[type=submit]').focus();
  }
  function cartao(sec, u, atual, i) {
    var c = el('article', 'cgp-card'); c.dataset.pacote = u.pacote; c.style.setProperty('--cgp-i', String(i));
    var cab = el('div', 'cgp-c-cab');
    cab.appendChild(el('h3', 'cgp-nome', u.pacote));
    var pr = el('p', 'cgp-preco'); pr.appendChild(el('strong', '', brl(u.diferenca))); pr.appendChild(el('span', '', 'de diferença, uma vez')); cab.appendChild(pr);
    c.appendChild(cab);
    if (u.mensalidade > 0) { var m = el('p', 'cgp-mens'); m.appendChild(el('b', '', brl(u.mensalidade) + '/mês')); m.appendChild(document.createTextNode(' a partir do próximo vencimento' + (u.mensalidadeInclui ? ' · ' + u.mensalidadeInclui : ''))); c.appendChild(m); }
    if (u.inclui && u.inclui.length) { var ul = el('ul', 'cgp-inclui'); u.inclui.slice(0, 8).forEach(function (t) { ul.appendChild(el('li', '', t)); }); c.appendChild(ul); }
    if (u.prazo) c.appendChild(el('p', 'cgp-prazo', 'Prazo: ' + u.prazo));
    var b = el('button', 'cg-btn cg-btn-prim cgp-quero', 'Quero este plano'); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
    b.onclick = function () { abrir(sec, u, atual); };
    c.appendChild(b);
    return c;
  }

  function desenhar(r, fns) {
    api = fns;
    var i = r.info || {}, s = r.sala || {};
    var na = !!(i.publicado || r.situacao === 'publicado') && !i.cancelado && r.sala && s.ligada !== false;
    var planos = Array.isArray(s.planos) ? s.planos : [];
    var sec = $('cgp');
    if (!na || !planos.length) { if (sec) sec.hidden = true; return; }
    if (!sec) {
      sec = montar();
      var ancora = $('cge-vitrine') || document.querySelector('#sala .cg-sala-grade');
      if (ancora) depois(ancora, sec); else $('sala').appendChild(sec);
    } else {
      // fica sempre depois da vitrine de extras (quando ela existe)
      var anc = $('cge-vitrine'); if (anc && !anc.hidden) depois(anc, sec);
    }
    sec.hidden = false;
    var atual = s.pacote || '';
    sec.querySelector('.cgp-sub').textContent = (atual ? 'Seu plano hoje: ' + atual + '. ' : '') + 'Pague só a diferença da implantação; a mensalidade nova vale a partir do próximo vencimento.';
    var ass = JSON.stringify([planos, atual]);
    if (ass !== assinatura) {
      assinatura = ass;
      var g = sec.querySelector('.cgp-grade'); g.innerHTML = '';
      planos.forEach(function (u, k) { g.appendChild(cartao(sec, u, atual, k)); });
      if (escolhido && !planos.some(function (u) { return u.pacote === escolhido; })) { escolhido = ''; sec.querySelector('.cgp-confirma').hidden = true; }
      marcar();
    }
    var ab = sec.querySelector('.cgp-aberto'), c = s.compraUpgrade;
    ab.hidden = !c;
    if (c) { ab.textContent = 'Pagamento em aberto: upgrade para o plano ' + c.pacote + ' (' + brl(c.valor) + '). O Pix e o cartão estão no quadro de pagamento desta página.'; ab.onclick = function () { var px = $('pix'); if (px && !px.hidden) px.scrollIntoView({ behavior: 'smooth' }); }; }
    var meus = sec.querySelector('.cgp-meus'); meus.innerHTML = '';
    (s.upgrades || []).slice(-3).forEach(function (x) { meus.appendChild(el('span', 'cgp-chip', '✓ Plano ' + x.para + (x.em ? ' desde ' + data(x.em) : ''))); });
    meus.hidden = !meus.children.length;
  }
  window.CGSalaPlanos = { desenhar: desenhar };
})();
