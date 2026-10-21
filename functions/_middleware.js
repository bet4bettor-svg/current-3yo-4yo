// Password lock for a Cloudflare Pages site.
// Every page and file needs the username and password set in the
// project's Variables and Secrets (APP_USER and APP_PASSWORD).
// If those aren't set, the site stays locked rather than open.

export async function onRequest(context) {
  const { request, env, next } = context;
  const expectedUser = env.APP_USER;
  const expectedPass = env.APP_PASSWORD;

  if (!expectedUser || !expectedPass) {
    return new Response("Locked: password not set up yet.", { status: 503 });
  }

  const auth = request.headers.get("Authorization") || "";
  if (auth.startsWith("Basic ")) {
    try {
      const decoded = atob(auth.slice(6));
      const split = decoded.indexOf(":");
      const user = decoded.slice(0, split);
      const pass = decoded.slice(split + 1);
      if (split > -1 && user === expectedUser && pass === expectedPass) {
        const response = await next();
        const locked = new Response(response.body, response);
        locked.headers.set("Cache-Control", "private, no-store");
        return locked;
      }
    } catch (e) {
      // fall through to the login prompt
    }
  }

  return new Response("Login required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="StridePredictor models", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}