# Caixa Bolo Surpresa: Landing Page

## Como publicar no GitHub Pages

1. No GitHub, crie um repositório **público** (ex.: `caixa-bolo-surpresa`).
2. Clique em **Add file → Upload files** e arraste **o conteúdo** desta pasta: `index.html`, a pasta `assets` e este `README.md`. Depois clique em **Commit changes**.
3. Vá em **Settings → Pages**. Em *Branch*, escolha `main` e a pasta `/ (root)`, e clique em **Save**.
4. Em 1 a 2 minutos, a página fica no ar em `https://SEU-USUARIO.github.io/caixa-bolo-surpresa/`.

## O que editar (em `index.html`, no bloco `window.OFERTA`, perto do fim do arquivo)

- `checkout.promocional`: link da Hotmart da oferta de **R$ 19,90** (o botão da roleta). **Está vazio:** sem ele, o botão mostra "Esta oferta estará disponível em breve".
- `checkout.basico`: link da oferta de **R$ 10,00**. Também está vazio.
- `checkout.premium`: link do Premium de R$ 29,90 (já preenchido).
- `roleta`:
  - `ativa`: liga ou desliga a roleta.
  - `esperaMinimaSegundos`: tempo antes da primeira abertura automática.
  - `intervaloSegundos`: pausa depois que o cliente fecha a roleta.
  - `botaoVoltar`: faz a roleta abrir no botão Voltar do celular.

Os preços exibidos ficam em `precos`. Eles não alteram o valor cobrado na Hotmart.

## Prévia no WhatsApp/Facebook (opcional)

A tag `og:image` aponta para `assets/mockup-kit-completo.webp`. Para a imagem aparecer quando o link for compartilhado, troque pelo endereço completo depois de publicar, por exemplo: `https://SEU-USUARIO.github.io/caixa-bolo-surpresa/assets/mockup-kit-completo.webp`.
