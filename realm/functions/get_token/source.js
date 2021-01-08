exports = async function () {
  const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

  const CLIENT_ID = context.values.get("GOOGLE_CLIENT_ID");
  const CLIENT_SECRET = context.values.get("GOOGLE_CLIENT_SECRET");

  const tokens_collection = context.services.get("mongodb-atlas").db("auth").collection("auth_tokens");

  // Look up tokens:
  let tokens = await tokens_collection.findOne({ _id: "youtube" });
  if (new Date() >= tokens.expires_at) {
    // access_token has expired. Get a new one.
    let res = await context.http.post({
      url: GOOGLE_TOKEN_ENDPOINT,
      body: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: tokens.refresh_token,
      },
      encodeBodyAsJSON: true,
    });

    tokens = JSON.parse(res.body.text());

    // TODO: Need to handle error responses here!

    tokens.updated = new Date();
    tokens.expires_at = new Date();
    tokens.expires_at.setTime(Date.now() + (tokens.expires_in * 1000));

    await tokens_collection.updateOne(
      {
        _id: "youtube"
      },
      {
        $set: {
          access_token: tokens.access_token,
          expires_at: tokens.expires_at,
          expires_in: tokens.expires_in,
          updated: tokens.updated,
        },
      },
    );
  }

  return tokens.access_token
};
