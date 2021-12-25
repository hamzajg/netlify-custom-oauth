import oauth2, { config } from '../utils/oauth';

/* Do initial auth redirect */
const handler = (event, context, callback) => {
  /* Generate authorizationURI */
  const authorizationURI = oauth2.authorizeURL({
    redirect_uri: config.redirect_uri,
    scope: 'email profile',
    state:'',
  })

  /* Redirect user to authorizationURI */
  const response = {
    statusCode: 302,
    headers: {
      Location: authorizationURI,
      'Cache-Control': 'no-cache' // Disable caching of this response
    },
    body: '' // return body for local dev
  }

  return callback(null, response)
}

module.exports = { handler }