// SALA DO SEU SITE (pós-venda, 20/10/2026): com o site final no ar, a página de acompanhamento vira a sala do site.
// Mostra o site no ar, as mudanças restantes no mês, os pedidos recentes, o formulário "Pedir uma mudança" (tipo "mudanca")
// e "Usar meu domínio" (tipo "dominio", registros para copiar). Quem decide e aplica é o app da ClickGo (lib/salaDoSite.js).
// acompanhar.js chama window.CGSala.desenhar(estado, { mandar, toast }) a cada atualização.
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var ESTADO = { fila: 'na fila', fazendo: 'aplicando', publicar: 'publicando', feito: 'feito', erro: 'não aplicado', orcamento: 'orçamento', limite: 'limite do mês' };
  var DOM = { aguardando: 'Esperando o apontamento (DNS)', configurando: 'Configurando o seu domínio', ativo: 'Domínio ativo', parado: 'Verificação pausada' };
  var fotos = [], api = null, ligado = false;

  function data(iso) { try { return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); } catch (e) { return ''; } }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function copiar(txt, b) {
    var ok = function () { var t = b.textContent; b.textContent = 'copiado'; setTimeout(function () { b.textContent = t; }, 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(ok).catch(function () { api && api.toast('Não consegui copiar: selecione e copie à mão.'); });
    else api && api.toast('Selecione e copie à mão.');
  }

  function ligar() {
    if (ligado) return; ligado = true;
    $('sala-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var t = $('sala-texto').value.trim();
      if (!t) { api.toast('Escreva o que você quer mudar.'); return; }
      var b = $('sala-enviar'); b.disabled = true;
      api.mandar(t, { tipo: 'mudanca', fotos: fotos.slice() }).then(function () {
        $('sala-texto').value = ''; fotos = []; $('sala-fotos').innerHTML = '';
        api.toast('Pedido enviado! Acompanhe aqui e na conversa.');
      }).catch(function () {}).finally(function () { b.disabled = false; });
    });
    $('sala-foto').addEventListener('change', function () {
      var lista = Array.prototype.slice.call(this.files || [], 0, 3 - fotos.length); this.value = '';
      Promise.all(lista.map(function (f) { return CG.comprimir(f).catch(function () { return null; }); })).then(function (us) {
        us.forEach(function (u) { if (u) fotos.push(u); });
        $('sala-fotos').innerHTML = ''; fotos.forEach(function (u) { var im = document.createElement('img'); im.src = u; im.alt = ''; $('sala-fotos').appendChild(im); });
      });
    });
    $('dom-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var h = $('dom-host').value.trim();
      if (!h) { api.toast('Escreva o seu domínio (ex.: seunegocio.com.br).'); return; }
      var b = $('dom-enviar'); b.disabled = true;
      api.mandar(h, { tipo: 'dominio', fotos: [] }).then(function () { api.toast('Domínio anotado! As instruções aparecem aqui.'); }).catch(function () {}).finally(function () { b.disabled = false; });
    });
  }

  function desenhar(r, fns) {
    api = fns;
    var i = r.info || {}, s = r.sala;
    var na = !!(i.publicado || r.situacao === 'publicado') && !i.cancelado;
    $('sala').hidden = !na;
    document.body.classList.toggle('cg-na-sala', na);
    if (!na) return;
    ligar();
    $('titulo').textContent = 'Sala do site de ' + r.negocio;
    document.title = 'Sala do seu site | ClickGo';
    $('sub').textContent = '';
    $('sala-guarde').hidden = false;
    $('sala-off').hidden = !!r.appOnline;
    if (r.previaUrl) { $('sala-link').href = r.previaUrl; $('sala-link').textContent = r.previaUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''); }
    if (!s || s.ligada === false) { $('sala-cota').textContent = 'Pedidos de mudança: é só falar na conversa.'; $('sala-mudar').hidden = true; $('sala-dominio').hidden = true; return; }
    $('sala-mudar').hidden = false; $('sala-dominio').hidden = false;
    // mudanças do mês
    $('sala-cota').textContent = s.total ? (s.restam > 0 ? 'Restam ' + s.restam + ' de ' + s.total + ' mudanças este mês' : 'As ' + s.total + ' mudanças deste mês já foram usadas') + (s.renovaEm ? ' · renova em ' + s.renovaEm : '') : '';
    var cheio = s.total && s.restam <= 0;
    $('sala-texto').maxLength = s.limiteTexto || 600;
    $('sala-texto').disabled = !!(s.aplicando || cheio);
    $('sala-enviar').disabled = !!(s.aplicando || cheio);
    $('sala-dica').textContent = s.aplicando ? 'Estamos aplicando o seu pedido anterior. Quando terminar, você pode pedir o próximo.'
      : cheio ? 'Precisa de algo antes da renovação? Fale na conversa: vira um orçamento à parte.'
      : 'Um pedido por vez, até ' + (s.limiteTexto || 600) + ' caracteres. Coisas pequenas (texto, foto, cor, horário, telefone) entram no mês; novidades maiores viram orçamento.';
    var ul = $('sala-pedidos'); ul.innerHTML = '';
    (s.pedidos || []).slice(0, 6).forEach(function (p) {
      var li = el('li', 'cg-sala-ped ' + p.estado);
      li.appendChild(el('span', 'cg-sala-est', ESTADO[p.estado] || p.estado));
      li.appendChild(el('span', 'cg-sala-txt', p.texto));
      li.appendChild(el('small', '', data(p.em)));
      ul.appendChild(li);
    });
    $('sala-pedidos-t').hidden = !(s.pedidos || []).length;
    // domínio próprio
    var d = s.dominio;
    $('dom-form').hidden = !!(d && d.situacao === 'ativo');
    $('dom-status').hidden = !d;
    if (d) {
      $('dom-status').className = 'cg-dom-status ' + d.situacao;
      $('dom-status-t').textContent = (DOM[d.situacao] || d.situacao) + ': ' + d.host;
      $('dom-status-s').textContent = d.situacao === 'ativo' ? 'Seu site já abre em ' + (d.url || ('https://' + d.host + '/')) + '.'
        : d.situacao === 'configurando' ? 'O apontamento chegou. Estamos ligando o domínio ao seu site (o certificado de segurança pode levar algumas horas).'
        : d.aviso || 'Assim que o apontamento propagar (de minutos a 24 h), o domínio liga sozinho e avisamos aqui.';
    }
    var tb = $('dom-registros'); tb.innerHTML = '';
    var regs = d && d.situacao !== 'ativo' ? d.registros || [] : [];
    $('dom-passos').hidden = !regs.length;
    regs.forEach(function (g) {
      var tr = document.createElement('tr');
      [g.tipo, g.nome, g.valor].forEach(function (v) { tr.appendChild(el('td', '', v)); });
      var td = document.createElement('td'); var b = el('button', 'cg-btn-copiar', 'copiar'); b.type = 'button';
      b.onclick = function () { copiar(g.valor, b); }; td.appendChild(b); tr.appendChild(td); tb.appendChild(tr);
    });
  }

  window.CGSala = { desenhar: desenhar };
})();
