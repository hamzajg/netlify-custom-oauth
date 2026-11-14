# ADR 0001 — Initial architecture

Date: 2026-11-13 (baseline recorded retroactively)
Status: accepted (describes what is built)

## Context

Netlify Identity's built-in Google provider didn't meet the project's
needs, so Google sign-in was reimplemented as custom Netlify Functions
while email/password stayed on Identity.

## Decisions

1. **SvelteKit + adapter-netlify.** Frontend framework matches the
   Netlify target; file-based routes keep the demo small.
2. **Hybrid auth: Identity + custom functions.** Email/password via
   Netlify Identity (gotrue-js); Google via two functions
   (`google-oauth` redirect, `oauth-callback` exchange). Rationale:
   Identity covers the commodity flow; the custom flow exists only where
   Identity fell short — no reimplementation of what already works.
3. **Functions own the OAuth dance.** Authorization redirect, code
   exchange (`simple-oauth2`), and session token issuance all live in
   `netlify/functions/` — the browser never sees client secrets.
   Rationale: secrets must stay server-side; Netlify Functions are the
   serverless boundary.
4. **Session via `jsonwebtoken` + `uuid`.** Callback issues a signed
   session token. Rationale: simple stateless session for a demo;
   production would revisit storage/refresh.
5. **Yarn + frozen lockfile.** Reproducible installs in CI.
   Rationale: deterministic builds.

## Consequences / open questions

- Google OAuth correctness depends on env config (client id/secret,
  redirect URIs per deploy domain) — easy to misconfigure silently.
- Session token strategy is demo-grade; no refresh/revocation story.
- Two auth paths must stay consistent (same user identity across
  email + Google) — linking logic lives in `oauth-callback`/`utils`.
