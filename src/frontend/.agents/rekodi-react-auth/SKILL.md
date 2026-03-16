---
name: "rekodi-react-oauth"
description: "Install and integrate the rekodi-react-auth library into React projects that use Rekodi-style OAuth2 with httpOnly cookies. Use when a project needs login state, current user context, route protection, or shared auth primitives without reimplementing OAuth2 in the frontend."
---

# Integrate Rekodi OAuth2

## Overview

This skill explains how to integrate `@rekodi/react-auth` into a React application. The library is designed for backends or shell layers that keep OAuth2 tokens in `httpOnly` cookies and expose frontend-safe endpoints for login, logout, session validation, and current-user lookup.

## When To Use

Use this skill when:

- a React project needs shared OAuth2 session handling
- the app should know whether the current user is authenticated
- the app needs the current user profile in React context
- protected views should redirect to login automatically

Do not use this skill to build a new OAuth2 flow from scratch in the client.

## Required Rules

- Install the library from GitHub instead of copying code manually.
- Wrap the app with `AuthProvider`.
- For Next.js, use the library server handlers only after verifying that the installed version sends `redirect_uri` in both the authorization request and the token exchange. If it does not, implement thin server wrappers or patch the library before relying on it.
- Keep the browser client limited to `/api/auth/login`, `/api/auth/logout`, `/api/auth/session`, and `/api/ms-users/users/me` whenever possible.
- If a backend only accepts `Authorization: Bearer <jwt>` and the app uses `@rekodi/react-auth` with `httpOnly` cookies, do not call that backend directly from the browser. Route those requests through a server-side proxy or BFF endpoint in Next.js.
- In that server-side proxy, read the `access_token` cookie on the server and forward it to the backend as `Authorization: Bearer <access_token>`.
- Do not build `oauth2/authorize?...` URLs in React when the server handlers are available.
- Do not send the browser directly to the provider logout endpoint; send it to `/api/auth/logout` and let the server handler expire cookies first.
- Use `useAuth()` and `useCurrentUser()` instead of reimplementing auth state with local hooks.
- If a route or page must require login, use `RequireAuth`.
- Do not read, store, or expose bearer tokens in browser state.
- Do not add `Authorization: Bearer ...` from browser code when the token is stored in `httpOnly` cookies. If a backend requires Bearer, inject that header only from server-side code that can safely read the cookie.
- If endpoint paths differ, adapt them only through `createRekodiAuthClient()` config.
- Before closing any OAuth integration, verify the registered OAuth client values used by the provider: `redirect_uri`, `post_logout_redirect_uri`, `scope`, and whether PKCE is required.
- Treat `redirect_uri` as an exact-match value. Port, path, host, and trailing slash must match the registered client exactly.
- Treat `OAUTH2_SCOPE` as an exact-match value. Do not assume `openid` is valid unless the registered client and provider metadata explicitly allow it.
- If the provider returns `invalid_request`, inspect provider logs and compare the actual authorize URL against the registered client configuration before changing unrelated frontend code.

## Install

Example install command:

```bash
npm install git+https://github.com/rekodi-chile/rekodi-react-auth.git
```

Optional fixed tag:

```bash
npm install git+https://github.com/rekodi-chile/rekodi-react-auth.git#v0.1.0
```

## Integration Workflow

### 1. If the project is Next.js, wire the server handlers

Before wiring the handlers, validate the OAuth client registration:

- confirm the registered `redirect_uri`
- confirm the registered `post_logout_redirect_uri`
- confirm the registered `scope`
- confirm whether PKCE is required
- confirm that the runtime app origin really matches the registered callback origin and port

Do not skip this step. A common local failure mode is:

- frontend running on `http://localhost:3001`
- registered OAuth client callback set to `http://localhost:3000/auth/`

That mismatch will produce an OAuth `invalid_request` even if the rest of the app is correct.

```ts
import { createRekodiServerAuthConfig, handleRekodiAuthLogin } from "@rekodi/react-auth/server";

const config = createRekodiServerAuthConfig(process.env as Record<string, string | undefined>);

export async function GET(request: Request) {
  return handleRekodiAuthLogin(request, config);
}
```

Do the same pattern for:

- `/app/auth/route.ts` using `handleRekodiAuthCallback`
- `/app/api/auth/session/route.ts` using `handleRekodiAuthSession`
- `/app/api/auth/logout/route.ts` using `handleRekodiAuthLogout`

Use these server env vars when creating the config:

- `APP_BASE_URL`
- `OAUTH2_AUTH_URL`
- `OAUTH2_CLIENT_ID`
- `OAUTH2_CLIENT_SECRET`
- `OAUTH2_SCOPE`
- `OAUTH2_REDIRECT_URI` if your provider or registered client requires an explicit callback value, or a documented equivalent derivation from the incoming request origin
- `NODE_ENV`

Current server-side behavior derived from those vars:

- login uses `OAUTH2_AUTH_URL + "/oauth2/authorize"`
- token exchange uses `OAUTH2_AUTH_URL + "/oauth2/token"`
- logout uses `OAUTH2_AUTH_URL + "/logout?client_id=<OAUTH2_CLIENT_ID>"`
- `APP_BASE_URL` only defines the app origin used for local redirects and callback handling

Required validation of the installed library behavior:

- login must send `redirect_uri` when the provider requires it
- token exchange must send the same `redirect_uri` value used during authorize
- that `redirect_uri` must exactly match the registered OAuth client value
- `APP_BASE_URL` is not enough if the real runtime origin differs from the registered client

If the installed version does not satisfy those points, do not blindly keep the library handlers. Wrap or replace them server-side until the actual authorize URL and token request match the provider contract.

Logout behavior:

- `handleRekodiAuthLogout()` expires the auth cookies server-side
- after cookies are expired, it serves a page that navigates to `OAUTH2_AUTH_URL + "/logout?client_id=<OAUTH2_CLIENT_ID>"`
- the React client must navigate first to `/api/auth/logout`; it must not call the provider logout URL directly
- the client-side `logout()` implementation must not mark the user as unauthenticated before starting the navigation, because protected views can immediately trigger `requestLogin()` and abort the logout request
- if the provider logout endpoint redirects again to its login page, that is provider behavior and is still a valid successful logout as long as the browser actually reached the provider logout URL

### 2. Create the browser auth client

Create a file such as `src/auth/auth-client.ts`:

```ts
import { createRekodiAuthClient } from "@rekodi/react-auth";

export const authClient = createRekodiAuthClient({
  appBaseUrl: window.location.origin,
  loginUrl: "/api/auth/login",
  logoutUrl: "/api/auth/logout",
  sessionUrl: "/api/auth/session",
  currentUserUrl: "/api/ms-users/users/me",
  storage: "memory"
});
```

If the app already exposes OAuth env vars to the browser, `createRekodiAuthClientFromEnv(...)` is acceptable for shared config, but the React app should still route login and logout through `/api/auth/*` instead of constructing provider URLs manually.

Current browser env contract used by `createRekodiAuthClientFromEnv(...)`:

- `OAUTH2_AUTH_URL`
- `OAUTH2_CLIENT_ID`
- `OAUTH2_CLIENT_SECRET`
- `OAUTH2_SCOPE`

Current browser-side derivation:

- authorize URL is built as `OAUTH2_AUTH_URL + "/oauth2/authorize"`
- token URL is built as `OAUTH2_AUTH_URL + "/oauth2/token"`
- direct browser login currently does not rely on a dedicated `OAUTH2_REDIRECT_URI` env var

Important warning:

- if the library or helper path does not send `redirect_uri`, and your provider requires exact callback validation, the login flow will fail with OAuth `invalid_request`
- in that case, fix the server-side handler or wrapper first; do not try to work around it from React components

### 3. Wrap the app

```tsx
import { AuthProvider } from "@rekodi/react-auth";
import { authClient } from "./auth/auth-client";

<AuthProvider client={authClient}>
  <App />
</AuthProvider>
```

### 4. Use auth state

```tsx
import { useAuth, useCurrentUser } from "@rekodi/react-auth";

function Header(): JSX.Element {
  const { authenticated, requestLogin, logout } = useAuth();
  const user = useCurrentUser();

  return authenticated ? (
    <button type="button" onClick={() => logout()}>
      Cerrar sesion {user ? `(${user.username})` : ""}
    </button>
  ) : (
    <button type="button" onClick={() => requestLogin(window.location.pathname)}>
      Iniciar sesion
    </button>
  );
}
```

### 5. Protect pages

```tsx
import { RequireAuth } from "@rekodi/react-auth";

<RequireAuth fallback={<p>Redirigiendo...</p>}>
  <ProtectedPage />
</RequireAuth>
```

## Backend Expectations

The backend or shell must expose:

- `GET /api/auth/session`
- `GET /api/auth/login`
- `GET /api/auth/logout`
- `GET /api/ms-users/users/me`
- `GET /auth` or `POST /auth` callback route

The browser requests must work with:

- `credentials: "include"`
- cookies `httpOnly`

If the protected backend expects Bearer tokens instead of cookie authentication:

- expose frontend-owned API routes such as `/api/ms-users/...`
- keep the browser talking only to those frontend routes
- let those frontend routes translate `access_token` cookie -> `Authorization: Bearer <jwt>`
- avoid using `NEXT_PUBLIC_*` backend URLs for direct browser CRUD calls to that protected backend

The OAuth2 values expected by the client factory are:

- `OAUTH2_AUTH_URL`
- `OAUTH2_CLIENT_ID`
- `OAUTH2_CLIENT_SECRET`
- `OAUTH2_SCOPE`

The OAuth2 values that must be validated against the registered client are:

- `redirect_uri`
- `post_logout_redirect_uri`
- `scope`
- `require_pkce`
- runtime origin and port actually used by the app

## What Not To Do

- Do not create a second OAuth2 implementation in the React app.
- Do not keep duplicated `/api/auth/login` or `/auth` logic in the app when the library server handlers are available.
- Do not call `client.getConfig().oauth2AuthUrl` to build a custom login URL in app code.
- Do not call the provider logout URL directly from React if the app relies on `httpOnly` cookies managed by this library; always go through `/api/auth/logout`.
- Do not store access tokens in `localStorage`, `sessionStorage`, or React state.
- Do not add a custom token refresh strategy in the browser unless the backend contract explicitly requires it.
- Do not hardcode environment-specific URLs when config injection is available.
- Do not point browser CRUD helpers directly at a protected Nest microservice when the app relies on `httpOnly` cookies for auth; use a server-side proxy route instead.

## Completion Checklist

- dependency installed from GitHub
- auth client created
- app wrapped with `AuthProvider`
- login and logout connected through `useAuth`
- current user consumed through `useCurrentUser`
- protected screens wrapped with `RequireAuth`
- actual authorize request verified against provider logs or browser URL when debugging first-time setup
- authorize request includes `redirect_uri` if the provider requires it
- token exchange sends the same `redirect_uri`
- runtime origin matches the registered OAuth client callback origin and port
- `OAUTH2_SCOPE` matches the registered client scope exactly
- `/api/auth/logout` expires cookies and then loads `${OAUTH2_AUTH_URL}/logout?client_id=...`
- no bearer token handling added in frontend code
- if the backend expects Bearer, frontend server routes proxy requests and inject `Authorization: Bearer <access_token>` from the server-side cookie
