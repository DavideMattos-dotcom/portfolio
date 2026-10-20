import {defaultContent} from '../public/content.js';
import {normalizeContent,validateContentLinks} from '../public/model.js';
import {auth,isAdmin} from './auth.js';
// API pública de leitura e gravação protegida por sessão do proprietário.
const API_HEADERS = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const MAX_BODY_BYTES = 256000;

function json(value, status = 200, headers = {}) {
  return Response.json(value, { status, headers: { ...API_HEADERS, ...headers } });
}
function apiError(message, status) { return Object.assign(new Error(message), { status }); }
async function readJson(request) {
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) throw apiError('Envie o conteúdo em JSON.', 415);
  if (Number(request.headers.get('Content-Length')) > MAX_BODY_BYTES) throw apiError('O conteúdo ultrapassa o limite de 256 KB.', 413);
  if (!request.body) throw apiError('O conteúdo está vazio.', 400);
  const reader = request.body.getReader();
  const chunks = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > MAX_BODY_BYTES) { await reader.cancel(); throw apiError('O conteúdo ultrapassa o limite de 256 KB.', 413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); } catch { throw apiError('O conteúdo não é um JSON válido.', 400); }
}
async function contentApi(request, env) {
  if (!['GET', 'PUT'].includes(request.method)) return json({ error: 'Método não permitido.' }, 405, { Allow: 'GET, PUT' });
  if (request.method === 'PUT') {
    if (!await isAdmin(request, env)) return json({ error: 'Somente o proprietário pode salvar alterações.' }, 403);
    if (request.headers.get('Origin') !== new URL(request.url).origin) return json({ error: 'Origem da solicitação não permitida.' }, 403);
  }
  if (!env.DB) return json({ error: 'O armazenamento está indisponível. Tente novamente em instantes.' }, 503);
  try {
    if (request.method === 'GET') {
      const row = await env.DB.prepare('SELECT content_json, revision, updated_at FROM portfolio_content WHERE id = 1').first();
      return json(row ? { content: normalizeContent(JSON.parse(row.content_json)), revision: row.revision, updatedAt: row.updated_at } : { content: normalizeContent(defaultContent), revision: 0, updatedAt: null });
    }
    const body = await readJson(request);
    if (!Number.isSafeInteger(body?.revision) || body.revision < 0) return json({ error: 'Recarregue o portfólio antes de salvar.' }, 400);
    let normalized;
    try { normalized = normalizeContent(body.content); validateContentLinks(body.content); }
    catch { return json({ error: 'Verifique os campos e os links do portfólio antes de salvar.' }, 400); }
    const updatedAt = new Date().toISOString();
    const serialized = JSON.stringify(normalized);
    const row = body.revision === 0
      ? await env.DB.prepare('INSERT INTO portfolio_content (id, content_json, revision, updated_at) VALUES (1, ?, 1, ?) ON CONFLICT(id) DO NOTHING RETURNING revision, updated_at').bind(serialized, updatedAt).first()
      : await env.DB.prepare('UPDATE portfolio_content SET content_json = ?, revision = revision + 1, updated_at = ? WHERE id = 1 AND revision = ? RETURNING revision, updated_at').bind(serialized, updatedAt, body.revision).first();
    if (!row) return json({ error: 'Uma versão mais recente foi salva em outro aparelho. Exporte seu rascunho para guardá-lo e reabra o editor para carregar a versão atual.' }, 409);
    return json({ content: normalized, revision: row.revision, updatedAt: row.updated_at });
  } catch (error) {
    if (error.status) return json({ error: error.message }, error.status);
    return json({ error: 'Não foi possível acessar o armazenamento. Suas alterações não foram salvas; tente novamente.' }, 503);
  }
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === '/api/login' || path === '/api/logout') return auth(request,env,path);
    if (path === '/api/editor-access') return json({ canEdit: await isAdmin(request, env) }, 200, { Vary: 'Cookie' });
    if (path === '/api/content') return contentApi(request, env);
    if (path.startsWith('/api/')) return json({error:'Rota não encontrada.'},404);
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
    return env.ASSETS.fetch(request);
  }
};
