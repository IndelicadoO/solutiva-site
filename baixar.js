/* ClickGo: download do .zip da compra do site (auditoria 23/10/2026).
   O arquivo no repositório público é CIFRADO (.cgz = "CGZ1" + iv 12 + tag 16 + dados, AES-256-GCM). O link que o cliente recebe é
   clickgo.dev.br/baixar/#<p|g|c-projeto>.<pasta>.<arquivo>.<chave>: o # nunca vai para servidor nenhum; a chave decifra aqui no aparelho. */
(function () {
  'use strict';
  var st = document.getElementById('baixar-status'), lk = document.getElementById('baixar-link');
  function msg(t) { st.textContent = t; }
  var partes = String(location.hash || '').replace(/^#/, '').split('.');
  // o nome do arquivo pode ter pontos (site.zip): host, pasta, chave nas pontas
  if (partes.length < 4) { msg('Link incompleto. Abra pelo link que você recebeu na conversa.'); return; }
  var host = partes[0], pasta = partes[1], chave = partes[partes.length - 1], arq = decodeURIComponent(partes.slice(2, -1).join('.'));
  if (!/^(p|g|c-clickgo-previas(-[a-z0-9]{1,12})?)$/.test(host) || !/^d-[0-9a-f]{24}$/.test(pasta) || !/^[\w.-]{1,90}$/.test(arq) || !/^[\w-]{43}$/.test(chave)) { msg('Link inválido. Abra pelo link que você recebeu na conversa.'); return; }
  if (!window.crypto || !crypto.subtle) { msg('Este navegador não consegue abrir o arquivo. Tente pelo Chrome, Safari ou Edge atualizado.'); return; }
  // p = previa.clickgo.dev.br; c-<projeto> = Cloudflare Pages (<projeto>.pages.dev) antes do domínio ligar; g = GitHub Pages (antigo)
  var base = host === 'p' ? 'https://previa.clickgo.dev.br/' : /^c-/.test(host) ? 'https://' + host.slice(2) + '.pages.dev/' : 'https://erinaldogomes.github.io/clickgo-previas/';
  function b64url(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  fetch(base + pasta + '/' + encodeURIComponent(arq) + '.cgz', { cache: 'no-store', referrerPolicy: 'no-referrer' }).then(function (r) {
    if (r.status === 404) throw new Error('venceu');
    if (!r.ok) throw new Error('rede');
    return r.arrayBuffer();
  }).then(function (buf) {
    var b = new Uint8Array(buf);
    if (b.length < 33 || String.fromCharCode(b[0], b[1], b[2], b[3]) !== 'CGZ1') throw new Error('formato');
    var iv = b.slice(4, 16), tag = b.slice(16, 32), dados = b.slice(32);
    var junto = new Uint8Array(dados.length + 16); junto.set(dados); junto.set(tag, dados.length); // WebCrypto: cifrado + tag no fim
    return crypto.subtle.importKey('raw', b64url(chave), 'AES-GCM', false, ['decrypt']).then(function (k) {
      return crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, k, junto);
    });
  }).then(function (zip) {
    var url = URL.createObjectURL(new Blob([zip], { type: 'application/zip' }));
    lk.href = url; lk.download = arq; lk.hidden = false;
    msg('Pronto! O download começou. Se não começou, toque no botão abaixo.');
    lk.click();
  }).catch(function (e) {
    msg(e && e.message === 'venceu' ? 'Este link já venceu. Peça um link novo na conversa da sua página do pedido.' : 'Não consegui abrir o arquivo agora. Confira se o link está completo ou tente de novo em instantes.');
  });
})();
