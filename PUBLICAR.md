# Publicar a landing da ClickGo, ex-Solutiva (Render, Static Site)

(18/10/2026: a marca virou ClickGo; repo, serviço do Render e domínio seguem `solutiva-*` / solutiva.dev.br até o domínio novo clickgo.dev.br.)

Nada foi publicado ainda. Faça nesta ordem:

1. **Criar o repositório:** abra https://github.com/new, logado como IndelicadoO.
   Nome: `solutiva-site`. Marque Public ou Private. NÃO marque README, .gitignore nem licença.
2. **Enviar o código** (PowerShell ou Git Bash):
   ```
   cd C:\Users\Erinaldo\Desktop\solutiva-site
   git remote add origin https://github.com/IndelicadoO/solutiva-site.git
   git push -u origin main
   ```
3. **Render:** https://dashboard.render.com → **New** → **Static Site** → escolha `IndelicadoO/solutiva-site`.
   - Branch: `main`
   - Build Command: deixe vazio
   - Publish Directory: `.`
   - Create Static Site. O endereço sai como `https://solutiva-site.onrender.com`.
4. **Se o Render der outro endereço** (ex.: `solutiva-site-xxxx.onrender.com`), troque
   `https://solutiva-site.onrender.com` pelo novo em `index.html` (canonical, og:url, og:image, JSON-LD),
   `robots.txt` e `sitemap.xml`, faça commit e push. O Render publica sozinho a cada push.

## Trocar o contato para o WhatsApp

Em `script.js`, no topo, preencha `whatsapp: '5561XXXXXXXXX'` (55 + DDD + número, só dígitos).
Todos os botões principais (ciano) passam a abrir o WhatsApp com a mensagem pronta. Commit e push.

Obs.: os botões apontam para `https://ig.me/m/clickgo.dev` (Instagram @clickgo.dev).

## Domínio próprio

`solutiva.com.br` **já está registrado** (conferido no registro.br em 15/10/2026). Livres na mesma busca:
`solutiva.dev.br` (combina com o @solutiva.dev), `solutiva.tec.br`, `solutiva.ia.br`, `solutiva.net.br`, `solutiva.app.br`.

1. Registre em https://registro.br (precisa do CPF/CNPJ da ME e pagamento anual; quem compra é você).
2. No Render: site → **Settings → Custom Domains → Add** → digite o domínio (ex.: `solutiva.dev.br` e `www.solutiva.dev.br`).
3. No registro.br: domínio → **DNS → Editar zona** e crie os registros que o Render mostrar
   (em geral `A` do domínio raiz para o IP do Render e `CNAME` do `www` para `solutiva-site.onrender.com`).
4. Espere a verificação (minutos a algumas horas). O Render emite o HTTPS sozinho.
5. Troque a URL no `index.html`, `robots.txt` e `sitemap.xml` para o domínio novo e faça push.
