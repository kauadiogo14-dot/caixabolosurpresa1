/* =========================================================================
   API de Conversões da Meta: ViewContent (Vercel Serverless Function)
   Rota: POST /api/meta-capi

   Variáveis de ambiente (Vercel → Settings → Environment Variables):
   - META_CAPI_ACCESS_TOKEN  (obrigatória) token da API de Conversões do Pixel
   - META_PIXEL_ID           (opcional)    padrão: 1699076581600295
   - META_TEST_EVENT_CODE    (opcional)    código de teste do Gerenciador de Eventos
   - META_GRAPH_VERSION      (opcional)    padrão: v26.0

   O navegador envia o mesmo event_id usado no fbq('track', 'ViewContent'),
   e a Meta junta os dois eventos (deduplicação).
   ========================================================================= */

const DEFAULT_PIXEL_ID = "1699076581600295";

function readCookie(header, name) {
  const match = String(header || "").match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

// Aceita só valores no formato dos cookies da Meta (fb.1.123.abc).
function cleanFbId(value) {
  const v = String(value || "").trim();
  return /^fb\.\d\.\d+\.[\w.-]{1,500}$/.test(v) ? v : "";
}

function firstHeader(value) {
  return String(Array.isArray(value) ? value[0] : value || "").split(",")[0].trim();
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"); } catch { return {}; }
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Use POST" });
  }

  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!token) {
    console.error("[meta-capi] Falta a variável de ambiente META_CAPI_ACCESS_TOKEN");
    return res.status(500).json({ ok: false, error: "Token não configurado" });
  }

  const body = await readBody(req);

  // Só aceita eventos da própria página (mesmo domínio que recebeu a requisição).
  const host = firstHeader(req.headers["x-forwarded-host"]) || firstHeader(req.headers.host);
  let sourceUrl;
  try {
    sourceUrl = new URL(String(body.event_source_url || ""));
  } catch {
    return res.status(400).json({ ok: false, error: "event_source_url inválido" });
  }
  if (!host || sourceUrl.host !== host) {
    return res.status(403).json({ ok: false, error: "Origem não permitida" });
  }

  const eventId = String(body.event_id || "");
  if (!/^[\w.-]{8,80}$/.test(eventId)) {
    return res.status(400).json({ ok: false, error: "event_id inválido" });
  }

  const cookies = req.headers.cookie || "";
  const fbp = cleanFbId(readCookie(cookies, "_fbp")) || cleanFbId(body.fbp);
  let fbc = cleanFbId(readCookie(cookies, "_fbc")) || cleanFbId(body.fbc);
  const fbclid = sourceUrl.searchParams.get("fbclid");
  if (!fbc && fbclid && /^[\w-]{10,500}$/.test(fbclid)) fbc = `fb.1.${Date.now()}.${fbclid}`;

  const ip = firstHeader(req.headers["x-forwarded-for"]) || firstHeader(req.headers["x-real-ip"]) || (req.socket && req.socket.remoteAddress) || "";
  const userAgent = String(req.headers["user-agent"] || "").slice(0, 500);

  const user_data = {};
  if (ip) user_data.client_ip_address = ip;
  if (userAgent) user_data.client_user_agent = userAgent;
  if (fbp) user_data.fbp = fbp;
  if (fbc) user_data.fbc = fbc;

  // Dados do produto: só campos conhecidos, com valor dentro de um limite razoável.
  const cd = body.custom_data && typeof body.custom_data === "object" ? body.custom_data : {};
  const value = Number(cd.value);
  const custom_data = {
    content_name: "Caixa Bolo Surpresa",
    content_type: "product",
    content_ids: ["caixa-bolo-surpresa-premium"],
    currency: "BRL",
  };
  if (Number.isFinite(value) && value > 0 && value <= 1000) custom_data.value = Math.round(value * 100) / 100;

  const payload = {
    data: [
      {
        event_name: "ViewContent",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: sourceUrl.href.slice(0, 1000),
        action_source: "website",
        user_data,
        custom_data,
      },
    ],
  };
  if (process.env.META_TEST_EVENT_CODE) payload.test_event_code = process.env.META_TEST_EVENT_CODE;

  const pixelId = process.env.META_PIXEL_ID || DEFAULT_PIXEL_ID;
  const version = process.env.META_GRAPH_VERSION || "v26.0";
  const url = `https://graph.facebook.com/${version}/${pixelId}/events?access_token=${encodeURIComponent(token)}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("[meta-capi] Erro da Meta", response.status, result && result.error ? result.error.message : "");
      return res.status(502).json({ ok: false, error: "A Meta recusou o evento" });
    }
    return res.status(200).json({ ok: true, events_received: result.events_received ?? null });
  } catch (error) {
    console.error("[meta-capi] Falha ao chamar a Meta", error && error.message);
    return res.status(502).json({ ok: false, error: "Falha ao enviar para a Meta" });
  }
};
