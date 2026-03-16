---
name: rekodi-nest-auth
description: Use when the user wants to install @rekodi/nest-auth from GitHub into a NestJS backend, especially in repos that consume shared internal packages directly from Git URLs.
---

# Install Rekodi Nest Auth

Use this skill when a user asks to install `@rekodi/nest-auth` from GitHub into a NestJS backend.

## Source of truth

Install from this Git URL:

`https://github.com/rekodi-chile/rekodi-nest-auth.git`

## Default install command

For npm:

```bash
npm install git+https://github.com/rekodi-chile/rekodi-nest-auth.git
```

If the target project uses a specific workspace, install it in that workspace instead of the repo root.

## What to verify before finishing

1. The consumer project is using NestJS 11.
2. The consumer has the required peer stack available:
   - `@nestjs/common`
   - `@nestjs/config`
   - `@nestjs/core`
   - `@nestjs/passport`
   - `passport`
   - `passport-jwt`
   - `jwks-rsa`
   - `reflect-metadata`
   - `rxjs`
3. The install succeeded without leaving the package unresolved in `package.json` or lockfiles.
4. The consumer can import from `@rekodi/nest-auth`.
5. The OAuth2/OpenID Connect provider metadata has been checked and the configured issuer matches the real published `issuer`.
6. The configured JWKS URL is reachable from the consumer runtime, even if it differs from the issuer host due to local port mappings, reverse proxies, or container DNS.

## Minimal integration check

After installation, verify that the consumer can import at least:

```ts
import { RekodiNestAuthModule, RequirePermission } from "@rekodi/nest-auth";
```

Before closing the task, verify the provider metadata from `/.well-known/openid-configuration` and confirm:

- `OAUTH2_ISSUER` exactly matches the metadata `issuer`
- `OAUTH2_JWKS_URL` points to a reachable JWKS endpoint for the consumer runtime
- if audience validation is needed, `OAUTH2_AUDIENCE` matches the token audience

Important: `OAUTH2_ISSUER` must match the JWT `iss` claim exactly. Do not assume it is the same as the local browser-facing base URL. A common local setup is:

- provider reachable from host as `http://localhost:8082`
- metadata publishes `issuer` as `http://oauth2:8080`

In that case:

- `OAUTH2_ISSUER` must be `http://oauth2:8080`
- `OAUTH2_JWKS_URL` may still be `http://localhost:8082/oauth2/jwks` if that is the reachable JWKS URL from the service

## Notes

- This package is backend-only. It expects JWT Bearer tokens on incoming NestJS requests.
- It does not implement frontend login flows, cookie sessions, or PKCE.
- If the consumer uses a BFF or gateway that stores tokens in cookies, that layer must still forward a Bearer token to the Nest backend protected by this package.
- If requests are returning `401` after Bearer forwarding is in place, verify the real metadata `issuer` first; issuer mismatch is a common integration failure even when the token and JWKS are otherwise correct.
