
exports = async function (payload, response) {
  const querystring = require('querystring');

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
    //"https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.readonly",
    //"https://www.googleapis.com/auth/youtubepartner",
    "https://www.googleapis.com/auth/yt-analytics-monetary.readonly",
    "https://www.googleapis.com/auth/yt-analytics.readonly",
    "https://www.googleapis.com/auth/youtube.force-ssl",
    "https://www.googleapis.com/auth/youtube.readonly",
  ];


  const error = payload.query.error;
  if (typeof error !== 'undefined') {
    // Google says there's a problem:
    console.error("Error code returned from Google:", error);
    response.setHeader('Content-Type', 'text/plain');
    response.setBody(error);
    return response;
  }

  const oauthCode = payload.query.code;
  if (typeof oauthCode === 'undefined') {
    // No code provided, so let's request one from Google:
    const oauthURL = new URL(GOOGLE_OAUTH_ENDPOINT);
    oauthURL.search = querystring.stringify({
      'client_id': CLIENT_ID,
      'redirect_uri': OAUTH2_CALLBACK,
      'response_type': 'code',
      'scope': SCOPES.join(' '),
      'access_type': "offline",
    });

    response.setStatusCode(302);
    response.setHeader('Location', oauthURL.href);
  } else {
    // We have a code, so we've redirected successfully from Google's consent page.
    // Let's post to Google, requesting an access:
    let res = await context.http.post({
      url: GOOGLE_TOKEN_ENDPOINT,
      body: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: oauthCode,
        grant_type: 'authorization_code',
        redirect_uri: OAUTH2_CALLBACK,
      },
      encodeBodyAsJSON: true,
    });

    let tokens = JSON.parse(res.body.text());

    if (typeof tokens.expires_in === "undefined") {
      throw new Error("Error response from Google: " + JSON.stringify(tokens))
    }


    if (typeof tokens.refresh_token === "undefined") {
      return {
        "message": `You appear to have already linked to Google. You may need to revoke your OAuth token (${tokens.access_token}) and delete your auth token document. https://developers.google.com/identity/protocols/oauth2/web-server#tokenrevoke`
      };
    }

    tokens._id = "youtube";
    tokens.updated = new Date();
    tokens.expires_at = new Date();
    tokens.expires_at.setTime(Date.now() + (tokens.expires_in * 1000));

    const tokens_collection = context.services.get("mongodb-atlas").db("auth").collection("auth_tokens");

    // Upserts don't appear to work in Realm, so here's a hack insted:
    if (await tokens_collection.findOne({ _id: "youtube" })) {
      await tokens_collection.updateOne(
        { _id: "youtube" },
        { '$set': tokens }
      );
    } else {
      await tokens_collection.insertOne(tokens);
    }

    return {
      "message": "ok",
    };
  }
};
