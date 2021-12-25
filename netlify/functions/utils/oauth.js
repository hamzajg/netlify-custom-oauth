import { AuthorizationCode } from 'simple-oauth2';

/* process.env.URL from netlify BUILD environment variables */
const siteUrl = process.env.VITE_NETLIFY_APP_URL || 'http://localhost:3000/';

export const config = {
  /* values set in terminal session or in netlify environment variables */
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  /* redirect_uri is the callback url after successful signin */
  redirect_uri: `${siteUrl}.netlify/functions/oauth-callback`,
}

function authInstance(credentials) {
  if (!credentials.client.id) {
    throw new Error('MISSING REQUIRED ENV VARS. Please set GOOGLE_CLIENT_ID')
  }
  if (!credentials.client.secret) {
    throw new Error('MISSING REQUIRED ENV VARS. Please set GOOGLE_CLIENT_SECRET')
  }
  // return oauth instance
  return new AuthorizationCode(credentials)
}

/* Create oauth2 instance to use in our two functions */
export default authInstance({
  client: {
    id: config.clientId,
    secret: config.clientSecret
  },
  auth: {
    authorizeHost: 'https://accounts.google.com',
    authorizePath: '/o/oauth2/v2/auth',
  
    tokenHost: 'https://www.googleapis.com',
    tokenPath: '/oauth2/v4/token'
  }
})