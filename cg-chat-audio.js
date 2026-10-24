/* ClickGo: ÁUDIO na conversa da página do pedido (/acompanhar, dono 24/10/2026).
   Mesmas regras do áudio do formulário: o microfone só é pedido no toque; até 2 min ou ~580 KB (a nuvem aceita 600 KB e
   confere os bytes do formato webm/ogg/mp4; o nome do arquivo é gerado lá). Vai como data URL no campo "audio" da mensagem;
   a ClickGo transcreve no PC e o robô responde ao texto. Nada fica guardado no aparelho. */
(function () {
  var MAX_SEG = 120, MAX_BYTES = 580 * 1024, MIN_BYTES = 1024;
  function tipo() {
    var op = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm'];
    for (var i = 0; i < op.length; i++) { try { if (window.MediaRecorder && MediaRecorder.isTypeSupported(op[i])) return op[i]; } catch (e) { /* */ } }
    return '';
  }
  function fmt(s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

  window.CGChatAudio = {
    ligar: function (o) {
      var $ = function (id) { return document.getElementById(id); };
      var bt = $('chat-mic'), barra = $('chat-grav'), tempoEl = $('chat-grav-tempo'), form = $('envio');
      if (!bt || !barra || !form) return;
      var g = { rec: null, stream: null, pedacos: [], bytes: 0, tipo: '', desde: 0, tm: 0, cancelado: false };
      function soltar() {
        clearInterval(g.tm);
        if (g.stream) g.stream.getTracks().forEach(function (t) { t.stop(); });
        g.stream = null;
      }
      function modo(gravando) { form.classList.toggle('gravando', gravando); barra.hidden = !gravando; bt.setAttribute('aria-pressed', gravando ? 'true' : 'false'); }
      function seg() { return (performance.now() - g.desde) / 1000; }
      function parar(cancelar) {
        g.cancelado = !!cancelar;
        var r = g.rec; if (!r || r.state === 'inactive') { soltar(); modo(false); return; }
        g.seg = seg(); clearInterval(g.tm);
        try { r.stop(); } catch (e) { terminou(); }
      }
      function terminou() {
        soltar(); modo(false);
        if (g.cancelado) return;
        var base = String(g.tipo || (g.rec && g.rec.mimeType) || '').split(';')[0] || 'audio/webm';
        var blob = new Blob(g.pedacos, { type: base });
        if (blob.size < MIN_BYTES || g.seg < 1) { o.toast('Ficou curtinho demais. Segure e fale de novo.'); return; }
        if (blob.size > 600 * 1024) { o.toast('O áudio ficou grande demais. Grave um mais curto.'); return; }
        var leitor = new FileReader();
        leitor.onload = function () {
          var b64 = String(leitor.result || '').split(',')[1] || '';
          bt.disabled = true;
          o.mandar('', { audio: 'data:' + base + ';base64,' + b64 }).catch(function () { /* o toast já explicou */ }).then(function () { bt.disabled = false; });
        };
        leitor.onerror = function () { o.toast('Não deu para mandar o áudio. Tente de novo.'); };
        leitor.readAsDataURL(blob);
      }
      function iniciar() {
        if (!window.MediaRecorder || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !tipo()) { o.toast('Este navegador não grava áudio aqui. Pode escrever, tudo bem.'); return; }
        g = { rec: null, stream: null, pedacos: [], bytes: 0, tipo: tipo(), desde: 0, tm: 0, cancelado: false, seg: 0 };
        navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }).then(function (st) {
          g.stream = st;
          var r;
          try { r = new MediaRecorder(st, { mimeType: g.tipo, audioBitsPerSecond: 32000 }); } catch (e) { r = new MediaRecorder(st); g.tipo = r.mimeType || g.tipo; }
          g.rec = r;
          r.ondataavailable = function (ev) { if (!ev.data || !ev.data.size) return; g.pedacos.push(ev.data); g.bytes += ev.data.size; if (g.bytes >= MAX_BYTES && r.state !== 'inactive') parar(false); };
          r.onstop = terminou;
          r.start(1000);
          g.desde = performance.now(); tempoEl.textContent = '0:00'; modo(true);
          g.tm = setInterval(function () { var s = seg(); tempoEl.textContent = fmt(s); if (s >= MAX_SEG) parar(false); }, 250);
        }).catch(function (e) {
          soltar(); modo(false);
          o.toast(e && (e.name === 'NotAllowedError' || e.name === 'SecurityError') ? 'O microfone ficou bloqueado. Libere no navegador ou escreva.' : 'Não achei um microfone. Pode escrever.');
        });
      }
      bt.addEventListener('click', function () { if (g.rec && g.rec.state === 'recording') parar(false); else iniciar(); });
      $('chat-grav-cancelar').addEventListener('click', function () { parar(true); });
      $('chat-grav-enviar').addEventListener('click', function () { parar(false); });
    }
  };
})();
