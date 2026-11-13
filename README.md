# Netlify Custom OAuth

A SvelteKit authentication demo for Netlify: email/password accounts through
Netlify Identity, plus a **custom Google OAuth flow** implemented as Netlify
Functions. The Google flow exists because Netlify Identity's built-in Google
provider was not enough for this project — the functions do the authorization
redirect, the code-for-token exchange and the session token themselves.

The UI is a small login/signup/recovery dialog. The signed-in area is a
placeholder.

## How the Google flow works

1. **Continue with Google** (`AuthDialog.svelte`) sends the browser to
   `/.netlify/functions/google-oauth`.
2. `google-oauth.js` answers with a `302` to Google's authorization endpoint,
   asking for the `email profile` scopes. The `redirect_uri` is
   `${VITE_NETLIFY_APP_URL}.netlify/functions/oauth-callback`.
3. Google redirects back to `oauth-callback` with a `code`.
4. `oauth-callback.js` exchanges the code for tokens with `simple-oauth2`,
   reads `email` and `name` from the Google `id_token`, and signs a one-hour
   JWT with `JWT_SECRET` (`jsonwebtoken`).
5. It redirects to `/#access_token=<jwt>&expires_in=...&token_type=...`.
6. `__layout.svelte` calls `Authentication.externalLoginListener()` on mount.
   That listener parses the hash, sets the `nf_jwt` cookie and calls
   `GoTrue.createUser` against `/.netlify/identity` so the session is also a
   Netlify Identity session. The user is then kept in `localStorage`
   (`gotrue.user`) and in the Svelte `user` store.

The GitHub button is different: it uses Netlify Identity's built-in external
provider (`GoTrue.loginExternalUrl('GitHub')`), so it only needs the provider
enabled in the Netlify dashboard, not a function.

## Requirements

- Node.js 20 (CI uses 20)
- Yarn — the repository has a `yarn.lock` and CI installs with
  `yarn install --frozen-lockfile`
- the [Netlify CLI](https://docs.netlify.com/cli/get-started/) for local
  development and deployment
- a Netlify site with Identity enabled
- a Google Cloud OAuth 2.0 client

## Configure

Copy `.env.example` to `.env` and fill it in:

| Variable | Used by | Meaning |
|---|---|---|
| `VITE_NETLIFY_APP_URL` | functions, browser | public URL of the site; **must end with `/`** |
| `GOOGLE_CLIENT_ID` | `netlify/functions/utils/oauth.js` | Google OAuth client id |
| `GOOGLE_CLIENT_SECRET` | `netlify/functions/utils/oauth.js` | Google OAuth client secret |
| `JWT_SECRET` | `oauth-callback.js` | signs the session JWT; the function returns `500` without it |

`VITE_NETLIFY_APP_URL` is concatenated with `.netlify/functions/...` and
`.netlify/identity`, so the trailing slash matters. For local development use
`http://localhost:3000/`; for a deployment use `https://<site>.netlify.app/`.

In the Google Cloud console, add both callback URLs to the OAuth client:

```
http://localhost:3000/.netlify/functions/oauth-callback
https://<site>.netlify.app/.netlify/functions/oauth-callback
```

Generate `JWT_SECRET` with `openssl rand -base64 32`, and set the same values
in **Site settings → Build & deploy → Environment** for deployments. Do not
commit `.env`.

## Run locally

```bash
yarn install
netlify dev
```

`netlify dev` serves the SvelteKit app and the functions together on
<http://localhost:3000>. `yarn dev` runs SvelteKit alone, without the
functions or the Identity endpoint, so the Google flow cannot work there.

## Build and deploy

```bash
yarn build      # SvelteKit build into build/
netlify build   # runs the same command through netlify.toml
netlify deploy
```

`netlify.toml` sets the build command (`yarn build`), the publish directory
(`build/`) and the functions directory (`netlify/functions`, bundled with
esbuild). CI runs `yarn install --frozen-lockfile` and `yarn build` on every
push and pull request.

## Routes

| Route | What it is |
|---|---|
| `/` | empty index page; the layout shows the login/signup buttons |
| `/login` | login form |
| `/signup` | signup form, then a confirmation email |
| `/home` | placeholder "Welcome Home Page"; redirects to `/` when there is no user |

The layout also handles the `confirmation`, `invite`, `recovery` and
`email_change` token links that Netlify Identity puts in the URL hash.

## Layout

```
netlify.toml                        build, publish and functions configuration
netlify/functions/
  google-oauth/google-oauth.js      redirect to Google
  oauth-callback/oauth-callback.js  code exchange, JWT signing, redirect back
  utils/oauth.js                    shared OAuth client and redirect URI
src/
  routes/__layout.svelte            header buttons, external-login listener
  routes/{index,login,signup,home}.svelte
  lib/auth-dialog/AuthDialog.svelte the forms and the Google/GitHub buttons
  lib/auth-dialog/Authentication.js GoTrue wrapper, hash listener, session
  stores.ts                         Svelte user store backed by localStorage
  utils/portal.js                   portal action used by the layout
```

## Known limitations

- `src/routes/index.svelte` and `/home` are empty placeholders.
- The Google flow sends an empty `state`, so the callback has no CSRF token to
  verify.
- `Authentication.logout()` is empty; the logout action in `AuthDialog.svelte`
  clears the local user instead.
- The project pins SvelteKit `1.0.0-next.184` and Tailwind 2, so it is a
  snapshot of the 2021 toolchain.

## License

MIT — see [LICENSE](LICENSE).
