import oauth2, { config } from '../utils/oauth';
import {sign, decode} from 'jsonwebtoken'
import { v4 as uuid } from 'uuid';

/*
 * Secret used to sign the session token handed to the browser.
 *
 * It must come from the environment. A hard-coded value would let anyone who
 * can read this repository forge a token for any user.
 */
function jwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('MISSING REQUIRED ENV VAR. Please set JWT_SECRET')
  }
  return secret
}

/* Function to handle intercom auth callback */
exports.handler = (event, context, callback) => {
  const code = event.queryStringParameters?.code
  /* state helps mitigate CSRF attacks & Restore the previous state of your app */
  const state = event.queryStringParameters?.state

  if (!code) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing authorization code' })
    })
  }

  let secret
  try {
    secret = jwtSecret()
  } catch (error) {
    console.log(error.message)
    return callback(null, {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server misconfigured' })
    })
  }

  /* Take the grant code and exchange for an accessToken */
  oauth2.getToken({
    code: code,
    redirect_uri: config.redirect_uri,
    client_id: config.clientId,
    client_secret: config.clientSecret
  })
    .then((result) => {
      const token = result
      console.log('accessToken', token)
      return token
    })
    // .then(getUserData)
    // Do stuff with user data & token
    .then((result) => {
      console.log('auth token', result.token)
      const {email, name} = decode(result.token.id_token);
      const access_token = sign({exp: Math.floor(Date.now() / 1000) + (60 * 60), sub: uuid(), email, app_metadata: { provider: "google" },user_metadata: {
        full_name: name
      }}, secret);
      // Do stuff with user data
      console.log('user data', result.data)
      // Do other custom stuff
      console.log('state', state)
      // return results to browser
      return callback(null, {
        statusCode: 302,
        headers: {
          //"Location": `/#access_token=${result.token.id_token}&expires_in=${result.token.expires_in}&token_type=${result.token.token_type}`,
          "Location": `/#access_token=${access_token}&expires_in=${result.token.expires_in}&token_type=${result.token.token_type}`,
        },
    });
    })
    .catch((error) => {
      console.log('Access Token Error', error.message)
      console.log(error)
      return callback(null, {
        statusCode: error.statusCode || 500,
        body: JSON.stringify({
          error: error.message,
        })
      })
    })
}