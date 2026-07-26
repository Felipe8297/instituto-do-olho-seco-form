import crypto from "node:crypto";

/**
 * Cliente da API Sivoe (server-only).
 *
 * Autenticação HMAC-SHA256 com janela anti-replay de ±300s. Cada requisição leva:
 *   X-API-Key   → a API KEY pública (svp_live_...)
 *   X-Timestamp → epoch em segundos (UTC)
 *   X-Signature → HMAC-SHA256 hex minúsculo do payload canônico
 *
 * payload   = `${timestamp}.${METHOD} ${path+query}\n${body}`
 * signature = HMAC_SHA256(payload, API_SECRET)  // hex lowercase
 *
 * O body assinado tem que ser byte-a-byte igual ao que vai na rede — por isso
 * serializamos o JSON uma única vez e assinamos essa mesma string.
 *
 * ⚠️ Segredo (SIVOE_API_SECRET) fica só no servidor. Nunca usar NEXT_PUBLIC_.
 */

const BASE = process.env.SIVOE_API_BASE ?? "https://api.sivoe.med.br";

function requireCreds() {
  const apiKey = process.env.SIVOE_API_KEY;
  const apiSecret = process.env.SIVOE_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error("SIVOE_API_KEY / SIVOE_API_SECRET não configuradas no servidor.");
  }
  return { apiKey, apiSecret };
}

/** Só dígitos — normaliza CPF/telefone mascarados antes de enviar à API. */
export function onlyDigits(v?: string): string {
  return (v ?? "").replace(/\D/g, "");
}

function signHeaders(method: string, pathWithQuery: string, body: string) {
  const { apiKey, apiSecret } = requireCreds();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const payload = `${timestamp}.${method.toUpperCase()} ${pathWithQuery}\n${body}`;
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(payload, "utf8")
    .digest("hex");
  return {
    "X-API-Key": apiKey,
    "X-Timestamp": timestamp,
    "X-Signature": signature,
  } as Record<string, string>;
}

/** Faz a chamada assinada. Lança em respostas não-2xx (com status + corpo). */
async function sivoeFetch<T = unknown>(
  method: string,
  pathWithQuery: string,
  bodyObj?: unknown
): Promise<T> {
  const body = bodyObj === undefined ? "" : JSON.stringify(bodyObj);
  const headers = signHeaders(method, pathWithQuery, body);
  if (body) headers["Content-Type"] = "application/json";
  // Idempotency-Key nas escritas (evita duplicidade em retries).
  if (method.toUpperCase() !== "GET") headers["Idempotency-Key"] = crypto.randomUUID();

  const res = await fetch(BASE + pathWithQuery, {
    method,
    headers,
    body: body || undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Sivoe ${method} ${pathWithQuery} → ${res.status}: ${text}`);
  }
  return (text ? JSON.parse(text) : null) as T;
}

interface Paciente {
  id: number;
  nome: string;
  cpf: string | null;
}

/** Busca paciente por CPF (match exato). Retorna o id ou null. */
export async function findPacienteByCpf(cpf: string): Promise<number | null> {
  const digits = onlyDigits(cpf);
  if (digits.length !== 11) return null;
  const json = await sivoeFetch<{ data: Paciente[] }>(
    "GET",
    `/v1/pacientes?cpf=${digits}`
  );
  return json.data?.[0]?.id ?? null;
}

export interface NovoPaciente {
  nome: string;
  cpf: string;
  dataNascimento: string; // YYYY-MM-DD
  celular?: string;
}

/** Cria um paciente e retorna o id. */
export async function createPaciente(p: NovoPaciente): Promise<number> {
  const json = await sivoeFetch<{ data: Paciente }>("POST", "/v1/pacientes", {
    nome: p.nome,
    cpf: onlyDigits(p.cpf),
    data_nascimento: p.dataNascimento,
    ...(p.celular ? { celular: onlyDigits(p.celular) } : {}),
  });
  const id = json.data?.id;
  if (!id) throw new Error(`Sivoe: paciente criado sem id (${JSON.stringify(json)})`);
  return id;
}

export interface AnexoProntuario {
  nome: string;
  base64: string;
  mime_type: string;
}

/** Cria uma entrada de prontuário (mensagem HTML + anexos opcionais). */
export async function createProntuario(
  pacienteId: number,
  data: { mensagem: string; anexos?: AnexoProntuario[] }
): Promise<{ prontuario_id: number }> {
  const json = await sivoeFetch<{ data: { prontuario_id: number } }>(
    "POST",
    `/v1/pacientes/${pacienteId}/prontuarios`,
    {
      mensagem: data.mensagem,
      ...(data.anexos?.length ? { anexos: data.anexos } : {}),
    }
  );
  return json.data;
}
