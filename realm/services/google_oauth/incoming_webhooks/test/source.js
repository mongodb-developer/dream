exports = async function (payload, response) {
  // Get a token (it'll be refreshed if necessary):
  const accessToken = await context.functions.execute("get_token");

  // Make an authenticated call:
  const result = await context.http.get({
    url: 'https://www.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&forUsername=MongoDB&prettyPrint=true',
    headers: {
      'Authorization': [`Bearer ${accessToken}`],
      'Accept': ['application/json'],
    },
  });

  response.setHeader('Content-Type', 'text/plain');
  response.setBody(result.body.text());
};
