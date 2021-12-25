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

```
VITE_NETLIFY_APP_URL = "<APP_URL_HERE>"
GOOGLE_CLIENT_ID = "<GOOGLE_CLIENT_ID_HERE>"
GOOGLE_CLIENT_SECRET = "<GOOGLE_CLIENT_SECRET_HERE>"
```

## Netlify Deploy

To test the app on Netlify Site, run:

```bash
netlfy deploy
```

