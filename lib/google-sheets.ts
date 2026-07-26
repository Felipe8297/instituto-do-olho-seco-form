import crypto from "crypto";

// ============================================================================
// Integração com Google Sheets (consolida todas as triagens numa planilha).
//
// Autenticação por CONTA DE SERVIÇO (server-to-server), sem dependências
// externas: assina um JWT RS256 com a chave privada e troca por um access
// token no endpoint OAuth do Google. Todas as credenciais ficam SÓ no servidor.
//
// Variáveis de ambiente necessárias (.env.local):
//   GOOGLE_SHEETS_ID                       -> ID da planilha (da URL)
//   GOOGLE_SERVICE_ACCOUNT_EMAIL           -> ...@...iam.gserviceaccount.com
//   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY     -> "-----BEGIN PRIVATE KEY-----\n..."
//   GOOGLE_SHEETS_TAB (opcional)           -> nome da aba (padrão: "Respostas")
// ============================================================================

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function getEnv() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // A chave vem do .env com "\n" literais; convertemos para quebras reais.
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const tab = process.env.GOOGLE_SHEETS_TAB || "Respostas";

  if (!spreadsheetId || !clientEmail || !privateKey) {
    throw new Error(
      "Google Sheets não configurado (GOOGLE_SHEETS_ID / GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)."
    );
  }
  return { spreadsheetId, clientEmail, privateKey, tab };
}

/** Gera um access token OAuth via JWT assinado (RS256) da conta de serviço. */
async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: clientEmail,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  );
  const signingInput = `${header}.${claim}`;
  const signature = base64url(
    crypto.createSign("RSA-SHA256").update(signingInput).sign(privateKey)
  );
  const assertion = `${signingInput}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    throw new Error(`Falha ao obter token do Google (${res.status}): ${await res.text()}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("Token do Google ausente na resposta.");
  return json.access_token;
}

async function sheetsFetch(
  token: string,
  spreadsheetId: string,
  path: string,
  init?: RequestInit
) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    throw new Error(`Google Sheets API ${res.status}: ${await res.text()}`);
  }
  return res;
}

/** Cria a aba (worksheet) se ela ainda não existir na planilha. */
async function ensureTab(token: string, spreadsheetId: string, tab: string) {
  const res = await sheetsFetch(token, spreadsheetId, `?fields=sheets.properties.title`);
  const json = (await res.json()) as { sheets?: { properties?: { title?: string } }[] };
  const existe = (json.sheets ?? []).some((sh) => sh.properties?.title === tab);
  if (existe) return;
  await sheetsFetch(token, spreadsheetId, `:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title: tab } } }] }),
  });
}

/** Se a aba estiver vazia, grava a linha de cabeçalho. */
async function ensureHeader(
  token: string,
  spreadsheetId: string,
  tab: string,
  header: string[]
) {
  const res = await sheetsFetch(
    token,
    spreadsheetId,
    `/values/${encodeURIComponent(tab)}!A1:A1`
  );
  const json = (await res.json()) as { values?: string[][] };
  const vazia = !json.values || json.values.length === 0;
  if (vazia) {
    await sheetsFetch(
      token,
      spreadsheetId,
      `/values/${encodeURIComponent(tab)}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      { method: "POST", body: JSON.stringify({ values: [header] }) }
    );
  }
}

/** Acrescenta uma linha na planilha. `header` é usado só na 1ª vez (aba vazia). */
export async function appendRow(row: (string | number)[], header: string[]): Promise<void> {
  const { spreadsheetId, clientEmail, privateKey, tab } = getEnv();
  const token = await getAccessToken(clientEmail, privateKey);
  await ensureTab(token, spreadsheetId, tab);
  await ensureHeader(token, spreadsheetId, tab, header);
  await sheetsFetch(
    token,
    spreadsheetId,
    `/values/${encodeURIComponent(tab)}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    { method: "POST", body: JSON.stringify({ values: [row] }) }
  );
}
