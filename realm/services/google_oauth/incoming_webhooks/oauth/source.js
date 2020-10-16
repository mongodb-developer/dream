// This function is the webhook's request handler.
exports = async function (payload, response) {
  const https = require('https');
  const querystring = require('querystring');
  const url = require('url');

  // MongoDBofficial Channel ID:
  // (Obtained from: https://developers.google.com/youtube/v3/docs/channels/list?apix=true&apix_params=%7B%22part%22%3A%5B%22id%22%5D%2C%22forUsername%22%3A%22MongoDB%22%7D)
  const ACCOUNT_ID = context.values.get("GOOGLE_ACCOUNT_ID");

  // Following obtained from: https://console.developers.google.com/apis/credentials
  const CLIENT_ID = context.values.get("GOOGLE_CLIENT_ID");
  const CLIENT_SECRET = context.values.get("GOOGLE_CLIENT_SECRET");

  // TODO: Can probably generate the following programmatically:
  const OAUTH2_CALLBACK = context.request.webhookUrl;

  // This shouldn't change:
  // https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps#httprest
  const GOOGLE_OAUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
  const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

  const SCOPES = [
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtubepartner",
    "https://www.googleapis.com/auth/yt-analytics-monetary.readonly",
    "https://www.googleapis.com/auth/yt-analytics.readonly",
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.force-ssl",
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtubepartner",
    "https://www.googleapis.com/auth/yt-analytics-monetary.readonly",
    "https://www.googleapis.com/auth/yt-analytics.readonly"
  ];


  const error = payload.query.error;
  if (typeof error !== 'undefined') {
    // Google says there's a problem:
    console.error("Error code returned from Google:", error);
    response.setHeader('Content-Type', 'text/plain');
    response.setBody(error);
  } else {
    const oauthCode = payload.query.code;
    if (typeof oauthCode === 'undefined') {
      // No code provided, so let's request one from Google:
      const oauthURL = new URL(GOOGLE_OAUTH_ENDPOINT);
      oauthURL.search = querystring.stringify({
        'client_id': CLIENT_ID,
        'redirect_uri': OAUTH2_CALLBACK,
        'response_type': 'code',
        'scope': SCOPES.join(' '),
      });

      response.setStatusCode(302);
      response.setHeader('Location', oauthURL.href);
    } else {
      // We have a code, so we've redirected successfully from Google's consent page.
      // Let's post to Google, requesting an access:

      const poster = new Promise((resolve, reject) => {
        const bodyObject = {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: oauthCode,
          grant_type: 'authorization_code',
          redirect_uri: OAUTH2_CALLBACK,
        };

        const req = https.request(
          GOOGLE_TOKEN_ENDPOINT,
          {
            method: 'POST',
          },
          (res) => {
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
              try {
                const parsedData = JSON.parse(rawData);
                resolve(parsedData);
              } catch (e) {
                reject(e.message);
              }
            });
          }
        );
        req.on('error', () => {
          reject(e);
        });
        req.write(JSON.stringify(bodyObject));
        req.end();
      });

      let tokens = await poster;

      // Just for giggles, let's use the token to make a request:
      const requester = new Promise((resolve, reject) => {
        const req = https.get(
          'https://www.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&forUsername=MongoDB&prettyPrint=true',
          {
            headers: {
              'Authorization': `Bearer ${tokens.access_token}`,
              'Accept': 'application/json'
            }
          },
          (res) => {
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
              resolve(rawData);
            });
          });
        req.on('error', () => {
          reject(e);
        });
      });
      const data = await requester;
      response.setHeader('Content-Type', 'text/plain');
      response.setBody(data);
    }
  }

  // Querying a mongodb service:
  // const doc = context.services.get("mongodb-atlas").db("dbname").collection("coll_name").findOne();


};