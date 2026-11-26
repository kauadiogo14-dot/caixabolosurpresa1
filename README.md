# Caixa Bolo Surpresa: Landing Page (Vercel)

## O que está instalado

- **UTMify:** guarda as UTMs da campanha e repassa para o checkout. O script fica no `<head>` do `index.html`.
- **Meta Pixel `1699076581600295`:** dispara `PageView` e `ViewContent` no navegador.
- **API de Conversões da Meta:** o mesmo `ViewContent` é enviado pelo servidor, pela função `api/meta-capi.js`, com o mesmo `event_id`. A Meta junta os dois e conta uma vez só (deduplicação).

## Variável de ambiente na Vercel

Em **Project → Settings → Environment Variables**:

| Nome | Valor | Obrigatória |
|---|---|---|
| `META_CAPI_ACCESS_TOKEN` | Token da API de Conversões do Pixel | Sim |
| `META_TEST_EVENT_CODE` | Código de teste do Gerenciador de Eventos (ex.: `TEST12345`) | Só para testar |
| `META_PIXEL_ID` | Outro Pixel (padrão: 1699076581600295) | Não |
| `META_GRAPH_VERSION` | Versão da API (padrão: v26.0) | Não |

O token é gerado no **Gerenciador de Eventos → seu Pixel → Configurações → API de Conversões → Gerar token de acesso**.

Depois de criar ou alterar uma variável, faça um **Redeploy**: a variável só vale a partir do deploy seguinte.

## Publicar

1. Envie para um repositório no GitHub **o conteúdo desta pasta** (`index.html`, `assets/`, `api/`, `README.md`).
2. Na Vercel: **Add New → Project**, importe o repositório e mantenha o preset **Other**, sem build.
3. Cadastre a variável `META_CAPI_ACCESS_TOKEN` e faça o deploy.

A função da API de Conversões só funciona na Vercel. O GitHub Pages não roda a pasta `api/`.

## Como testar

1. Cadastre `META_TEST_EVENT_CODE` com o código da aba **Eventos de teste** do Gerenciador de Eventos e faça um redeploy.
2. Abra o site. Na aba de teste devem aparecer o `ViewContent` do **Navegador** e o do **Servidor**, marcados como deduplicados.
3. Depois do teste, **apague** `META_TEST_EVENT_CODE` e faça outro redeploy.
