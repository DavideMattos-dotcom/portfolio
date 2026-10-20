const enc = new TextEncoder();
const cookieName = '__Host-portfolio_admin';
export const json = (value, status = 200, headers = {}) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers } });
export async function readBody(request, max = 16000) {
    if (!request.headers.get('content-type')?.startsWith('application/json'))
        throw new Error('JSON_REQUIRED');
    if (!request.body)
        throw new Error('INVALID_JSON');
    const reader = request.body.getReader();
    const chunks = [];
    let length = 0;
    while (true) {
        const { done, value } = await reader.read();
        if (done)
            break;
        length += value.byteLength;
        if (length > max) {
            await reader.cancel();
            throw new Error('TOO_LARGE');
        }
        chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const c of chunks) {
        bytes.set(c, offset);
        offset += c.byteLength;
    }
    return JSON.parse(new TextDecoder().decode(bytes));
}
function enabled(env) { return typeof env.PORTFOLIO_ADMIN_PASSWORD === 'string' && env.PORTFOLIO_ADMIN_PASSWORD.length >= 24; }
async function signingKey(env) { return crypto.subtle.importKey('raw', enc.encode(env.PORTFOLIO_ADMIN_PASSWORD), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']); }
const hex = (bytes) => Array.from(new Uint8Array(bytes), n => n.toString(16).padStart(2, '0')).join('');
export async function isAdmin(request, env) {
    if (!enabled(env))
        return false;
    const raw = request.headers.get('cookie')?.split(';').map(v => v.trim()).find(v => v.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
    if (!raw || raw.length > 300)
        return false;
    const [expiry, nonce, signature, ...extra] = raw.split('.');
    if (extra.length || !/^\d+$/.test(expiry) || !/^[a-f0-9]{32}$/.test(nonce || '') || !/^[a-f0-9]{64}$/.test(signature || ''))
        return false;
    const expires = Number(expiry), now = Math.floor(Date.now() / 1000);
    if (expires <= now || expires > now + 28800)
        return false;
    return crypto.subtle.verify('HMAC', await signingKey(env), Uint8Array.from(signature.match(/../g), v => parseInt(v, 16)), enc.encode(expiry + '.' + nonce));
}
export async function auth(request, env, path) {
    if (request.method !== 'POST')
        return json({ error: 'Método não permitido.' }, 405);
    if (request.headers.get('origin') !== new URL(request.url).origin)
        return json({ error: 'Origem não permitida.' }, 403);
    if (path === '/api/logout')
        return json({ ok: true }, 200, { 'Set-Cookie': `${cookieName}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0` });
    if (!enabled(env))
        return json({ error: 'O lojista ainda não configurou a senha administrativa.' }, 503);
    try {
        const body = await readBody(request, 2048);
        const now = Math.floor(Date.now() / 1000), window = Math.floor(now / 900);
        const ip = request.headers.get('cf-connecting-ip') || 'local';
        const client = hex(await crypto.subtle.sign('HMAC', await signingKey(env), enc.encode('rate:' + ip)));
        const row = await env.DB.prepare('INSERT INTO portfolio_login_attempts (client,window,attempts) VALUES (?,?,1) ON CONFLICT(client) DO UPDATE SET window=excluded.window, attempts=CASE WHEN portfolio_login_attempts.window=excluded.window THEN portfolio_login_attempts.attempts+1 ELSE 1 END RETURNING attempts').bind(client, window).first();
        if (!row || row.attempts > 5)
            return json({ error: 'Muitas tentativas. Aguarde até 15 minutos.' }, 429, { 'Retry-After': String(900 - now % 900) });
        if (typeof body.password !== 'string' || body.password.length > 256)
            return json({ error: 'Senha incorreta.' }, 401);
        const supplied = await crypto.subtle.sign('HMAC', await signingKey(env), enc.encode('password:' + body.password));
        const valid = await crypto.subtle.verify('HMAC', await signingKey(env), supplied, enc.encode('password:' + env.PORTFOLIO_ADMIN_PASSWORD));
        if (!valid)
            return json({ error: 'Senha incorreta.' }, 401);
        const expiry = now + 28800;
        const nonce = hex(crypto.getRandomValues(new Uint8Array(16)).buffer);
        const payload = expiry + '.' + nonce;
        const signature = hex(await crypto.subtle.sign('HMAC', await signingKey(env), enc.encode(payload)));
        await env.DB.prepare('DELETE FROM portfolio_login_attempts WHERE window < ?').bind(window - 1).run();
        return json({ ok: true }, 200, { 'Set-Cookie': `${cookieName}=${payload}.${signature}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800` });
    }
    catch {
        return json({ error: 'Não foi possível entrar. Verifique os dados e tente novamente.' }, 400);
    }
}
