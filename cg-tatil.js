/* ClickGo: movimento da camada tátil (24/10/2026). Leve: só mexe em classes, na propriedade `rotate` e em variáveis que
   viram transform (nada de layout, nada de filtro). Com "reduzir movimento" no aparelho, não faz nada.
   1. Marca do topo "clique e go": o robô leva o clique ao abrir a página e de novo ao passar o mouse/tocar.
   2. Robô do formulário vira a cabeça em 3D atrás do mouse (só com mouse; no celular ele balança sozinho pelo CSS).
   3. Cartões grandes da página inicial inclinam em 3D sob o mouse (.ficha-bloco). */
(function () {
  'use strict';
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduz) return;
  var fino = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // 1. clique e go
  function clicar(mk) { mk.classList.remove('cg-mk-vai'); void mk.offsetWidth; mk.classList.add('cg-mk-vai'); }
  var marcas = document.querySelectorAll('.cg-mk');
  Array.prototype.forEach.call(marcas, function (mk) {
    setTimeout(function () { clicar(mk); }, 350);
    mk.addEventListener('mouseenter', function () { clicar(mk); });
    mk.addEventListener('touchstart', function () { clicar(mk); }, { passive: true });
  });

  if (!fino) return;

  // 2. robô que olha para o mouse (o do passo visível)
  var quadro = 0, ultimo = null;
  function olhar() {
    quadro = 0; if (!ultimo) return;
    var robos = document.querySelectorAll('.ps:not([hidden]) .fala > .robo, .cont:not([hidden]) > .robo');
    Array.prototype.forEach.call(robos, function (r) {
      var b = r.getBoundingClientRect(); if (!b.width) return;
      var dx = (ultimo.x - (b.left + b.width / 2)) / 260, dy = (ultimo.y - (b.top + b.height / 2)) / 260;
      dx = Math.max(-1, Math.min(1, dx)); dy = Math.max(-1, Math.min(1, dy));
      var ang = Math.min(28, Math.sqrt(dx * dx + dy * dy) * 28);
      r.classList.add('segue');
      r.style.rotate = ang < .5 ? '0deg' : ((-dy).toFixed(3) + ' ' + dx.toFixed(3) + ' 0 ' + ang.toFixed(1) + 'deg');
    });
  }
  document.addEventListener('pointermove', function (e) { ultimo = { x: e.clientX, y: e.clientY }; if (!quadro) quadro = requestAnimationFrame(olhar); }, { passive: true });

  // 3. cartões que inclinam
  var cartoes = document.querySelectorAll('.ficha-bloco');
  Array.prototype.forEach.call(cartoes, function (c) {
    c.classList.add('t3d');
    c.addEventListener('pointermove', function (e) {
      var b = c.getBoundingClientRect();
      var x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
      c.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg'); c.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg');
    });
    c.addEventListener('pointerleave', function () { c.style.setProperty('--ry', '0deg'); c.style.setProperty('--rx', '0deg'); });
  });
})();
