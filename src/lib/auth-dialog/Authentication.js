import GoTrue from 'gotrue-js';
import { user } from '../../stores';

const Authentication = {
  externalLogin,
  externalLoginListener,
  completeExternalLogin,
  login,
  logout,
  signup,
  forgotpassword,
  updatepassword
}

const localHosts = {
  localhost: true,
  "127.0.0.1": true,
  "0.0.0.0": true
};

const appURL = () => localHosts[document.location.hostname] ? import.meta.env.VITE_NETLIFY_APP_URL : "/";

async function externalLogin(provider) {
  const auth = new GoTrue({
    APIUrl: appURL() + '.netlify/identity',
    audience: '',
    setCookie: false,
  });
  
  if(provider === "Google") {
    window.location.href = appURL() + "./.netlify/functions/google-oauth";
  } else {
    const url = auth.loginExternalUrl(provider);
    window.location.href = url;
  }
}

const verifyToken = (type, token) => {
  const auth = new GoTrue({
    APIUrl: appURL() + '.netlify/identity',
    audience: '',
    setCookie: false,
  });

  switch (type) {
    case "confirmation":
      auth
        .confirm(token, true)
        .then(handleResponse)
        .catch(handleError);
        break;
    case "recovery":
      localStorage.setItem("recovery_token", token)
      auth
        .recover(token, true)
        .catch(handleError);
        break;
    default:
      new Error("Unkown token type");
  }
};
function externalLoginListener() {
  const routes = /(confirmation|invite|recovery|email_change)_token=([^&]+)/;
  const errorRoute = /error=access_denied&error_description=403/;
  const accessTokenRoute = /access_token=/;

  const hash = (document.location.hash || "").replace(/^#\/?/, "");
  if (!hash) {
    return;
  }

  const m = hash.match(routes);
  if (m) {
    verifyToken(m[1], m[2]);
    document.location.hash = "";
  }
  
  const am = hash.match(accessTokenRoute);
  if (am) {
    const params = {};
    hash.split("&").forEach((pair) => {
      const [key, value] = pair.split("=");
      params[key] = value;
    });
    if (!!document && params["access_token"]) {
      document.cookie = `nf_jwt=${params["access_token"]}`;
    }
    if (params["state"]) {
      try {
        // skip initialization for implicit auth
        const state = decodeURIComponent(params["state"]);
        const { auth_type } = JSON.parse(state);
        if (auth_type === "implicit") {
          return;
        }
        // eslint-disable-next-line no-empty
      } catch (e) {}
    }
    document.location.hash = "";
    completeExternalLogin(params);
  }
}

function completeExternalLogin(params) {
  const auth = new GoTrue({
    APIUrl: appURL() + '.netlify/identity',
    audience: '',
    setCookie: false,
  });
  
  console.log(appURL() + '.netlify/identity')
  console.log(params)
  auth.createUser(params, true)
    .then(handleResponse)
    .catch(handleError);
}

async function login(logInData) {
  const auth = new GoTrue({
    APIUrl: appURL() + '.netlify/identity',
    audience: '',
    setCookie: false,
  });
  return await auth.login(logInData.email, logInData.password)
    .then(handleResponse)
    .catch(handleError);
}
async function logout() {  
  
}
async function signup(signUpData) {
  const auth = new GoTrue({
    APIUrl: appURL() + '.netlify/identity',
    audience: '',
    setCookie: false,
  });
  return await auth.signup(signUpData.email, signUpData.password, {full_name: signUpData.fullName, company_name: signUpData.companyName})
  .then(response => {})
  .catch(handleError);
}

async function forgotpassword(email) {
  const auth = new GoTrue({
    APIUrl: appURL() + '.netlify/identity',
    audience: '',
    setCookie: false,
  });
  return await auth.requestPasswordRecovery(email)
  .catch(handleError);
}
async function updatepassword(password) {
  const auth = new GoTrue({
    APIUrl: appURL() + '.netlify/identity',
    audience: '',
    setCookie: false,
  });
  return await auth.recover(localStorage.getItem("recovery_token"))
    .then(user => {
      user.update({password}).then(response => localStorage.removeItem("recovery_token"))
      })
    .catch(handleError);
}

function handleResponse(response) {
  localStorage.setItem('gotrue.user', JSON.stringify(response));
  user.login(response)
}

function handleError(error) {
  return ("" + error).substr(("" + error).lastIndexOf(":") + 1);
}
export default Authentication;