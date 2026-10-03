import { gerarDesenho } from "../../lib/desenho.js";

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "POST") {
    return new Response("Metodo nao permitido", { status: 405 });
  }
  let body;
  try {
    const text = await request.text();
    if (!text) return new Response("Corpo ausente", { status: 400 });
    body = JSON.parse(text);
  } catch {
    return new Response("JSON invalido", { status: 400 });
  }
  const numero = body.numero;
  if (numero === undefined || !Number.isInteger(numero) || numero < 1 || numero > 100) {
    return new Response("numero ausente ou invalido", { status: 400 });
  }
  const auth = request.headers.get("Authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/);
  if (!m) return new Response("Token ausente", { status: 401 });
  const id_token = m[1];
  const r = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`);
  if (!r.ok) return new Response("Token invalido", { status: 401 });
  const info = await r.json();
  if (info.aud !== env.GOOGLE_CLIENT_ID) return new Response("aud diferente", { status: 401 });
  if (info.email_verified !== "true") return new Response("email nao verificado", { status: 401 });
  const svg = gerarDesenho(numero, info.email);
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml; charset=utf-8" } });
}