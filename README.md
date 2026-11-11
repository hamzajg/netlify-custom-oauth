# Netlify Custom OAuth

## Building

Before creating a production version of your app, install Netlify CLI. Then:

```bash
netlify build
```

## Local

Once the project dependencies installed with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
netlfy dev
```
## Setup .env

Copy `.env.example` to `.env` and fill in the values:

```
VITE_NETLIFY_APP_URL = "<APP_URL_HERE>"
GOOGLE_CLIENT_ID = "<GOOGLE_CLIENT_ID_HERE>"
GOOGLE_CLIENT_SECRET = "<GOOGLE_CLIENT_SECRET_HERE>"
JWT_SECRET = "<RANDOM_SECRET_HERE>"
```

`JWT_SECRET` signs the session token the OAuth callback returns to the browser.
It has **no default** — the function refuses to run without it. Generate one
with `openssl rand -base64 32`, and set it in the Netlify dashboard for
deployments.

## Netlify Deploy

To test the app on Netlify Site, run:

```bash
netlfy deploy
```

