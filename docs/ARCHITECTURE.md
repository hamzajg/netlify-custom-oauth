# Architecture — netlify-custom-oauth

Current-state map. Descriptive, not aspirational; see `docs/adr/` for why.

## Shape

```
netlify-custom-oauth/
├── src/                        SvelteKit frontend
│   ├── routes/                 pages: index, login, signup, home, __layout
│   ├── lib/                    shared Svelte components/utils
│   └── utils/                  helpers
├── netlify/functions/          serverless functions (Node)
│   ├── google-oauth/           302 redirect → Google authorize
│   ├── oauth-callback/         code exchange → session token
│   └── utils/oauth.js          shared OAuth helpers
├── netlify.toml                deploy config
├── svelte.config.js            @sveltejs/adapter-netlify
└── package.json                svelte-kit scripts; gotrue-js,
                                simple-oauth2, jsonwebtoken, uuid, cors
```

## Flows

- **Email/password:** browser → Netlify Identity (gotrue-js) → session.
- **Google OAuth (custom):**
  1. `AuthDialog` → `GET /.netlify/functions/google-oauth`
  2. function → `302` to Google `/o/oauth2/auth` (scopes, redirect_uri)
  3. Google → `/.netlify/functions/oauth-callback?code=…`
  4. function exchanges code via `simple-oauth2`, creates/links Netlify
     Identity user, issues session token → redirect to app.

## Frontend/backend contract

- Frontend ↔ Netlify Identity: gotrue-js client (site URL + anon key env).
- Frontend ↔ functions: `/.netlify/functions/google-oauth` and
  `oauth-callback` — same-origin paths; functions are the OAuth boundary.
- Env contract: Google OAuth client id/secret, Identity URL/keys — all
  Netlify env vars, none in repo.

## Deployment

Netlify: `yarn build` → SvelteKit adapter-netlify output + functions.
Preview deploys per branch/PR.
