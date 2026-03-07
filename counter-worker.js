const KV_KEY  = 'surveys-completed';
const SEED    = 25; // offset for pre-counter usage

export default {
  async fetch(request, env) {
    const url    = new URL(request.url);
    const path   = url.pathname;

    // CORS headers — allow your site (and any origin during dev)
    const cors = {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Content-Type':                 'application/json',
    };

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // Only GET allowed
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405, headers: cors,
      });
    }

    // Read current value from KV (defaults to "0" if key doesn't exist yet)
    const raw     = await env.COUNTER.get(KV_KEY);
    let   current = parseInt(raw || '0', 10);

    if (path === '/hit') {
      // Increment and persist
      current += 1;
      await env.COUNTER.put(KV_KEY, String(current));
    } else if (path !== '/get') {
      return new Response(JSON.stringify({ error: 'Not found. Use /get or /hit' }), {
        status: 404, headers: cors,
      });
    }

    return new Response(
      JSON.stringify({ value: current + SEED }),
      { status: 200, headers: cors }
    );
  },
};
