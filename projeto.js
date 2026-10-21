// SALA DO PROJETO (sistema sob medida, 20/10/2026): o formulário marcou "Sistema sob medida" e a página de acompanhamento vira a
// sala do projeto: andamento do briefing (as perguntas vêm pela conversa), documentos de exemplo em PDF (tipo "arquivo") e
// "Gerar protótipo" (tipo "prototipo", até 3 rodadas). O protótipo aparece na própria prévia da página.
// ORÇAMENTO (21/10/2026): depois que a equipe aprova, o app manda projeto.orcamento (valor, inclui, prazo, sinal/restante) e o
// cartão mostra "Pagar sinal" (link do Mercado Pago, Pix ou cartão) ou, sem o link, a chave Pix + "Mandar o comprovante".
// CONSTRUÇÃO e SALA DO SISTEMA (21/10/2026): projeto.sistema traz só as etapas que a equipe aprovou (texto) e, depois do sistema
// entregue e pago, os ajustes do mês (pedidos pela conversa). Seção #sis.
// acompanhar.js chama window.CGProjeto.desenhar(estado, { mandar, toast, abrirConversa }) a cada atualização.
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var api = null, ligado = false, enviando = false;
  function kb(b) { b = Number(b) || 0; return b >= 1048576 ? (b / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }
  function el(tag, txt) { var e = document.createElement(tag); if (txt != null) e.textContent = txt; return e; }

  function lerPdf(arquivo, max) {
    return new Promise(function (ok, falha) {
      if (!arquivo) return falha(new Error('Escolha um arquivo.'));
      if (!/\.pdf$/i.test(arquivo.name || '') && arquivo.type !== 'application/pdf') return falha(new Error('Só PDF, por favor.'));
      if (arquivo.size > max) return falha(new Error('Esse PDF passa de ' + kb(max) + '. Mande um trecho ou um exemplo menor.'));
      var r = new FileReader();
      r.onerror = function () { falha(new Error('Não consegui ler o arquivo.')); };
      r.onload = function () { var u = String(r.result || '').replace(/^data:[^;,]*;base64,/, 'data:application/pdf;base64,'); ok(u); };
      r.readAsDataURL(arquivo);
    });
  }

  function ligar() {
    if (ligado) return; ligado = true;
    $('proj-pdf').addEventListener('change', function () {
      var f = (this.files || [])[0]; this.value = '';
      if (!f || enviando) return;
      var max = (window.__cgProjMax || 1572864);
      lerPdf(f, max).then(function (data) {
        enviando = true; $('proj-enviar').classList.add('carregando');
        api.toast('Enviando "' + f.name + '"…');
        return api.mandar('', { tipo: 'arquivo', arquivo: { nome: f.name, data: data } }).then(function () { api.toast('PDF enviado! Ele fica só com a ClickGo.'); });
      }).catch(function (e) { api.toast(e.message); }).finally(function () { enviando = false; $('proj-enviar').classList.remove('carregando'); });
    });
    $('proj-gerar').onclick = function () {
      var b = this; b.disabled = true; b.textContent = 'Pedindo o protótipo…';
      api.mandar('', { tipo: 'prototipo' }).then(function () { api.toast('Pedido! O protótipo aparece aqui em alguns minutos.'); })
        .catch(function () { b.disabled = false; b.textContent = 'Gerar protótipo'; });
    };
  }

  function brl(n) { n = Number(n) || 0; return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); }
  var orcLigado = false;
  function desenharOrc(o) {
    $('orc').hidden = !o;
    if (!o) return;
    if (!orcLigado) {
      orcLigado = true;
      $('orc-copiar').onclick = function () { var b = this, t = $('orc-chave').textContent; var ok = function () { b.textContent = 'Chave copiada!'; api.toast('Chave Pix copiada. É só colar no app do seu banco.'); setTimeout(function () { b.textContent = 'Copiar chave Pix'; }, 2500); };
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(ok, function () { api.toast('Segure o dedo sobre a chave para copiar.'); }); else api.toast('Segure o dedo sobre a chave para copiar.'); };
      $('orc-comprovante').onclick = function () { api.abrirConversa(); api.toast('Escolha o print ou a foto do comprovante e toque em enviar.'); setTimeout(function () { var x = document.getElementById('anexo-input'); if (x) x.click(); }, 250); };
    }
    $('orc-valor').textContent = brl(o.valor);
    $('orc-mensal').hidden = !o.mensal; $('orc-mensal').textContent = o.mensal ? '+ ' + brl(o.mensal) + '/mês de hospedagem e suporte.' : '';
    $('orc-prazo').hidden = !o.prazoDias; $('orc-prazo').textContent = o.prazoDias ? 'Prazo: cerca de ' + o.prazoDias + ' dias úteis depois do sinal.' : '';
    var ul = $('orc-inclui'); ul.innerHTML = ''; (o.inclui || []).forEach(function (x) { ul.appendChild(el('li', x)); });
    var rest = o.fase === 'restante', aberto = !!o.fase;
    $('orc-titulo').textContent = rest ? 'Seu sistema está pronto: falta o restante' : o.entregue ? 'Sistema pago: obrigado!' : o.emProducao ? 'Sinal recebido: seu sistema está em produção' : 'Orçamento do seu sistema';
    $('orc-pagar').hidden = !aberto;
    var sit = $('orc-situacao'); sit.hidden = aberto; sit.textContent = o.entregue ? 'Recebemos o pagamento completo. A equipe ClickGo combina a entrega pela conversa.' : o.emProducao ? 'O restante (' + brl(o.restante) + ') só na entrega. A equipe te dá notícias pela conversa.' : '';
    if (!aberto) return;
    $('orc-rotulo').textContent = rest ? 'Restante (50%)' : 'Sinal (50%)';
    $('orc-pag-valor').textContent = brl(rest ? o.restante : o.sinal);
    var mp = /^https:\/\/(www\.|sandbox\.)?mercadopago\.com(\.br)?\//.test(String(o.cartaoUrl || ''));
    $('orc-link').hidden = !mp; $('orc-mp-nota').hidden = !mp; if (mp) { $('orc-link').href = o.cartaoUrl; $('orc-link').firstChild.textContent = rest ? 'Pagar restante ' : 'Pagar sinal '; }
    $('orc-chave-box').hidden = mp || !o.pixChave; $('orc-chave').textContent = o.pixChave || '';
    $('orc-sem').hidden = mp || !!o.pixChave;
  }

  var ESTADO_AJ = { fazendo: 'em andamento', feito: 'feito', orcamento: 'orçamento à parte', limite: 'fica para o próximo mês', equipe: 'com a equipe' };
  function desenharSis(s) {
    var box = $('sis'); if (!box) return;
    box.hidden = !s;
    if (!s) return;
    $('sis-titulo').textContent = s.sala ? 'Sala do seu sistema' : s.concluida ? 'Seu sistema está pronto' : 'Construção do seu sistema';
    $('sis-sub').textContent = s.sala ? 'Seu sistema foi entregue. Aqui ficam as etapas entregues e os ajustes do mês.' : s.construindo ? 'A equipe ClickGo constrói o seu sistema em etapas. Cada etapa pronta aparece aqui.' : '';
    var ul = $('sis-entregas'); ul.innerHTML = '';
    (s.entregas || []).forEach(function (x) { var li = el('li'); li.appendChild(el('b', 'Etapa ' + x.n + ': ')); li.appendChild(document.createTextNode(x.texto)); ul.appendChild(li); });
    if (!(s.entregas || []).length) ul.appendChild(el('li', 'A primeira etapa aparece aqui assim que ficar pronta.'));
    $('sis-sala').hidden = !s.sala;
    if (!s.sala) return;
    $('sis-conta').textContent = '(' + s.sala.usadas + ' de ' + s.sala.total + ' · renova em ' + s.sala.renovaEm + ')';
    var pd = $('sis-pedidos'); pd.innerHTML = '';
    (s.sala.pedidos || []).forEach(function (x) { pd.appendChild(el('li', x.texto + ' · ' + (ESTADO_AJ[x.estado] || 'com a equipe'))); });
    if (!(s.sala.pedidos || []).length) pd.appendChild(el('li', 'Nenhum pedido ainda.'));
  }

  function desenhar(r, a) {
    var i = (r && r.info) || {}, v = (r && r.projeto) || null;
    $('projeto').hidden = !i.projeto;
    if (!i.projeto) { $('orc').hidden = true; desenharSis(null); return; }
    desenharSis(v && v.sistema || null);
    api = a; ligar();
    v = v || { etapa: 0, etapas: 5, arquivos: [], resumo: [], rodada: 0, rodadasTotal: 3, maxArquivos: 6, maxBytes: 1572864 };
    window.__cgProjMax = v.maxBytes || 1572864;
    desenharOrc(v.orcamento || null);
    var etapas = v.etapas || 5, feitas = Math.min(etapas, v.etapa || 0);
    $('proj-barra').style.width = Math.round(100 * (feitas / etapas)) + '%';
    $('proj-etapa').textContent = feitas < etapas ? 'Conversa inicial: pergunta ' + (feitas + 1) + ' de ' + etapas + ' (responda na conversa).' : 'Conversa inicial completa.';
    var res = $('proj-resumo'); res.innerHTML = '';
    (v.resumo || []).forEach(function (x) { var li = el('li'); var b = el('b', x.t + ': '); li.appendChild(b); li.appendChild(document.createTextNode(x.v)); res.appendChild(li); });
    var arqs = $('proj-arqs'); arqs.innerHTML = '';
    (v.arquivos || []).forEach(function (x) { arqs.appendChild(el('li', '📄 ' + x.nome + ' · ' + kb(x.bytes))); });
    if (!(v.arquivos || []).length) arqs.appendChild(el('li', 'Nenhum documento ainda (opcional).'));
    var max = v.maxArquivos || 6, n = (v.arquivos || []).length;
    $('proj-arq-cont').textContent = '(' + n + ' de ' + max + ')';
    $('proj-enviar').hidden = n >= max;
    var g = $('proj-gerar');
    if (v.gerando) { g.disabled = true; g.textContent = v.posicao > 1 ? 'Na fila para montar…' : 'Montando o protótipo…'; }
    else { g.disabled = !v.podeGerar; g.textContent = v.rodada ? 'Gerar de novo (com o que você pediu)' : 'Gerar protótipo'; }
    var tot = v.rodadasTotal || 3;
    $('proj-rodadas').textContent = v.aviso ? v.aviso : v.rodada >= tot ? 'As ' + tot + ' rodadas de protótipo foram usadas. A equipe continua com você pela conversa.'
      : feitas < etapas ? 'Libera quando a conversa inicial terminar. Até ' + tot + ' rodadas, sem custo.'
      : 'Rodada ' + Math.min(tot, (v.rodada || 0) + 1) + ' de ' + tot + ', sem custo. O link do protótipo fica no ar por 7 dias.';
  }

  window.CGProjeto = { desenhar: desenhar };
})();
