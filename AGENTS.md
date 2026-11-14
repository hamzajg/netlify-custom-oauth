# AGENTS.md — netlify-custom-oauth

Guidance for AI agents (and humans) working in this repository.

## Project

A SvelteKit authentication demo for Netlify: email/password accounts via
**Netlify Identity** (gotrue-js) plus a **custom Google OAuth flow**
implemented as Netlify Functions — the functions do the authorization
redirect, code-for-token exchange and session token themselves, because
Netlify Identity's built-in Google provider wasn't enough.
Stack: SvelteKit (Svelte + TS), Netlify Functions (Node), `simple-oauth2`,
`jsonwebtoken`, `uuid`, `cors`. Deployed on Netlify.

## Commands

Verified 2026-11-13 against CI (`.github/workflows/ci.yml`) and
`package.json`.

| Task | Command |
|---|---|
| Install | `yarn install --frozen-lockfile` |
| Build (CI) | `yarn build` (`svelte-kit build`) |
| Dev | `yarn dev` (`svelte-kit dev`) |
| Preview | `yarn preview` |

Netlify CLI (`netlify dev`) runs functions + site locally; functions live
in `netlify/functions/` and need env vars (see Landmines).

## Architecture

```
src/
  routes/
    __layout.svelte   root layout
    index.svelte      landing
    login.svelte      login (email + Google button)
    signup.svelte     signup
    home.svelte       signed-in placeholder area
  lib/                shared components/utils
  utils/              helpers
netlify/functions/
  google-oauth/google-oauth.js   302 → Google authorize URL
  oauth-callback/oauth-callback.js  code → token exchange, session
  utils/oauth.js                 shared OAuth helpers
netlify.toml        deploy config
svelte.config.js    SvelteKit config (uses @sveltejs/adapter-netlify)
mdsvex.config.js    markdown support
build/              build output (gitignored normally)
```

### Auth flows

- **Email/password:** Netlify Identity (gotrue-js) — login/signup/recovery
  dialog in `src/`.
- **Google (custom):** `AuthDialog` "Continue with Google" →
  `/.netlify/functions/google-oauth` → Google consent →
  `/.netlify/functions/oauth-callback` → exchanges code, issues session.

## Conventions

- SvelteKit file-based routes in `src/routes/`; shared code in `src/lib/`.
- Functions are plain Node modules in `netlify/functions/` — keep them
  dependency-light and side-effect free at import time.
- OAuth secrets live in Netlify env vars — never hard-code or commit.
- KISS: this is a reference/demo implementation — no need for an auth
  abstraction layer beyond what exists.

## Landmines

- **Default branch is `main`, not `master`.**
- Package manager is **yarn** (`yarn.lock`, CI uses `--frozen-lockfile`).
- Functions require env vars (Google client id/secret, Netlify Identity
  URL/key) — local `netlify dev` needs them set or the Google flow 500s.
- `build/` and `.svelte-kit/` are generated — don't commit.
- `node_modules/` exists locally — `yarn install --frozen-lockfile` is
  the clean path.
- OAuth callback URLs are env/site-URL dependent — Google console
  redirect URIs must match the deploy domain.

## Agent rules

- Branch from `main`; name branches `feat/*`, `fix/*`, `chore/*`, `docs/*`.
- Docs-only changes still go through a PR; never commit to `main` directly.
- Verify before claiming: `yarn install --frozen-lockfile && yarn build`
  and report the real result.
- Any change to `netlify/functions/` must document required env vars in
  AGENTS.md.
- Keep changes minimal and consistent with surrounding code. No drive-by
  refactors.
- Update AGENTS.md / docs/ARCHITECTURE.md when routes, functions, or env
  vars change.
