// SALA DO PROJETO (sistema sob medida, 20/10/2026): o formulário marcou "Sistema sob medida" e a página de acompanhamento vira a
// sala do projeto: andamento do briefing (as perguntas vêm pela conversa), documentos de exemplo em PDF (tipo "arquivo") e
// "Gerar protótipo" (tipo "prototipo", até 3 rodadas). O protótipo aparece na própria prévia da página. Sem preço aqui.
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

  function desenhar(r, a) {
    var i = (r && r.info) || {}, v = (r && r.projeto) || null;
    $('projeto').hidden = !i.projeto;
    if (!i.projeto) return;
    api = a; ligar();
    v = v || { etapa: 0, etapas: 5, arquivos: [], resumo: [], rodada: 0, rodadasTotal: 3, maxArquivos: 6, maxBytes: 1572864 };
    window.__cgProjMax = v.maxBytes || 1572864;
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
    $('proj-rodadas').textContent = v.rodada >= tot ? 'As ' + tot + ' rodadas de protótipo foram usadas. A equipe continua com você pela conversa.'
      : feitas < etapas ? 'Libera quando a conversa inicial terminar. Até ' + tot + ' rodadas, sem custo.'
      : 'Rodada ' + Math.min(tot, (v.rodada || 0) + 1) + ' de ' + tot + ', sem custo. O link do protótipo fica no ar por 7 dias.';
  }

  window.CGProjeto = { desenhar: desenhar };
})();
