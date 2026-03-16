type CookieOptions = {
  httpOnly?: boolean;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
  path?: string;
  maxAge?: number;
};

type OAuthTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  id_token?: string;
};

const DEFAULT_SCOPE = "profile userinfo";
const DEFAULT_RETURN_TO = "/app";

function getRequiredEnv(name: "OAUTH2_AUTH_URL" | "OAUTH2_CLIENT_ID"): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  };
}

function serializeCookie(name: string, value: string, options: CookieOptions): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  if (options.path) {
    parts.push(`Path=${options.path}`);
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite.charAt(0).toUpperCase()}${options.sameSite.slice(1)}`);
  }

  if (options.httpOnly) {
    parts.push("HttpOnly");
  }

  if (options.secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function appendSetCookie(headers: Headers, value: string): void {
  headers.append("Set-Cookie", value);
}

function sanitizeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_RETURN_TO;
  }

  return value;
}

function getRequestOrigin(request: Request): string {
  return new URL(request.url).origin;
}

function getRedirectUri(request: Request): string {
  return new URL("/auth/", getRequestOrigin(request)).toString();
}

function getScope(): string {
  return process.env.OAUTH2_SCOPE ?? DEFAULT_SCOPE;
}

function parseCookies(header: string | null): Record<string, string> {
  if (!header) {
    return {};
  }

  return header.split(";").reduce<Record<string, string>>((cookies, part) => {
    const [rawKey, ...rest] = part.trim().split("=");

    if (!rawKey) {
      return cookies;
    }

    cookies[rawKey] = decodeURIComponent(rest.join("="));
    return cookies;
  }, {});
}

function base64UrlEncode(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

function randomBase64Url(size: number): string {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

async function sha256Base64Url(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return base64UrlEncode(new Uint8Array(digest));
}

async function readCallbackParams(request: Request): Promise<URLSearchParams> {
  if (request.method.toUpperCase() === "POST") {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      return new URLSearchParams(await request.text());
    }
  }

  return new URL(request.url).searchParams;
}

function createRedirect(location: string, headers?: Headers): Response {
  const responseHeaders = headers ? new Headers(headers) : new Headers();
  responseHeaders.set("Location", location);
  return new Response(null, { status: 302, headers: responseHeaders });
}

function createNavigationPage(location: string, headers?: Headers): Response {
  const responseHeaders = headers ? new Headers(headers) : new Headers();
  responseHeaders.set("Content-Type", "text/html; charset=utf-8");

  return new Response(
    `<!doctype html><html lang="es"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Saliendo...</title></head><body><p>Saliendo...</p><script>window.location.assign(${JSON.stringify(location)});</script></body></html>`,
    { status: 200, headers: responseHeaders }
  );
}

export async function handleLogin(request: Request): Promise<Response> {
  const state = randomBase64Url(16);
  const codeVerifier = randomBase64Url(32);
  const codeChallenge = await sha256Base64Url(codeVerifier);
  const requestUrl = new URL(request.url);
  const headers = new Headers();
  const cookieOptions = { ...getCookieOptions(), maxAge: 600 };
  const authorizeUrl = new URL("/oauth2/authorize", getRequiredEnv("OAUTH2_AUTH_URL"));

  authorizeUrl.searchParams.set("client_id", getRequiredEnv("OAUTH2_CLIENT_ID"));
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", getScope());
  authorizeUrl.searchParams.set("redirect_uri", getRedirectUri(request));
  authorizeUrl.searchParams.set("code_challenge", codeChallenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");
  authorizeUrl.searchParams.set("state", state);

  appendSetCookie(headers, serializeCookie("oauth_state", state, cookieOptions));
  appendSetCookie(headers, serializeCookie("pkce_verifier", codeVerifier, cookieOptions));
  appendSetCookie(
    headers,
    serializeCookie("oauth_return_to", sanitizeReturnTo(requestUrl.searchParams.get("return_to")), cookieOptions)
  );

  return createRedirect(authorizeUrl.toString(), headers);
}

export async function handleCallback(request: Request): Promise<Response> {
  const params = await readCallbackParams(request);
  const cookies = parseCookies(request.headers.get("cookie"));
  const code = params.get("code");
  const state = params.get("state");
  const storedState = cookies.oauth_state;
  const codeVerifier = cookies.pkce_verifier;
  const returnTo = sanitizeReturnTo(cookies.oauth_return_to);

  if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
    return createRedirect(new URL("/?error=oauth_state", getRequestOrigin(request)).toString());
  }

  const tokenBody = new URLSearchParams();
  tokenBody.set("grant_type", "authorization_code");
  tokenBody.set("code", code);
  tokenBody.set("code_verifier", codeVerifier);
  tokenBody.set("redirect_uri", getRedirectUri(request));

  const clientSecret = process.env.OAUTH2_CLIENT_SECRET;
  if (!clientSecret) {
    tokenBody.set("client_id", getRequiredEnv("OAUTH2_CLIENT_ID"));
  }

  const tokenHeaders = new Headers({
    "Content-Type": "application/x-www-form-urlencoded"
  });

  if (clientSecret) {
    const credentials = Buffer.from(`${getRequiredEnv("OAUTH2_CLIENT_ID")}:${clientSecret}`).toString("base64");
    tokenHeaders.set("Authorization", `Basic ${credentials}`);
  }

  const tokenResponse = await fetch(new URL("/oauth2/token", getRequiredEnv("OAUTH2_AUTH_URL")), {
    method: "POST",
    headers: tokenHeaders,
    body: tokenBody
  });

  if (!tokenResponse.ok) {
    return createRedirect(new URL("/?error=oauth_token", getRequestOrigin(request)).toString());
  }

  const tokenData = (await tokenResponse.json()) as OAuthTokenResponse;
  if (!tokenData.access_token) {
    return createRedirect(new URL("/?error=missing_token", getRequestOrigin(request)).toString());
  }

  const responseHeaders = new Headers();
  const cookieOptions = getCookieOptions();

  appendSetCookie(
    responseHeaders,
    serializeCookie("access_token", tokenData.access_token, {
      ...cookieOptions,
      maxAge: tokenData.expires_in ?? 1800
    })
  );

  if (tokenData.refresh_token) {
    appendSetCookie(
      responseHeaders,
      serializeCookie("refresh_token", tokenData.refresh_token, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 30
      })
    );
  }

  if (tokenData.id_token) {
    appendSetCookie(
      responseHeaders,
      serializeCookie("id_token", tokenData.id_token, {
        ...cookieOptions,
        maxAge: tokenData.expires_in ?? 1800
      })
    );
  }

  appendSetCookie(responseHeaders, serializeCookie("oauth_state", "", { ...cookieOptions, maxAge: 0 }));
  appendSetCookie(responseHeaders, serializeCookie("pkce_verifier", "", { ...cookieOptions, maxAge: 0 }));
  appendSetCookie(responseHeaders, serializeCookie("oauth_return_to", "", { ...cookieOptions, maxAge: 0 }));

  return createRedirect(new URL(returnTo, getRequestOrigin(request)).toString(), responseHeaders);
}

export function handleSession(request: Request): Response {
  const cookies = parseCookies(request.headers.get("cookie"));

  return new Response(JSON.stringify({ authenticated: Boolean(cookies.access_token) }), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

export function handleLogout(): Response {
  const responseHeaders = new Headers();
  const cookieOptions = { ...getCookieOptions(), maxAge: 0 };

  ["access_token", "refresh_token", "id_token", "oauth_state", "pkce_verifier", "oauth_return_to"].forEach(
    (cookieName) => {
      appendSetCookie(responseHeaders, serializeCookie(cookieName, "", cookieOptions));
    }
  );

  const logoutUrl = new URL(
    `/logout?client_id=${encodeURIComponent(getRequiredEnv("OAUTH2_CLIENT_ID"))}`,
    getRequiredEnv("OAUTH2_AUTH_URL")
  );

  return createNavigationPage(logoutUrl.toString(), responseHeaders);
}
