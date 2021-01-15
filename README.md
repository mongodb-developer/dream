# MongoDB DREAM Project

Developer Relation Engagement &amp; Activity Metrics

## Goals

- Collect metrics from the different platforms the Developer Relations team is using to produce content for reporting &amp; analysis purposes.

## First Deployment

The steps to configure authentication on first deployment are a little fiddly.
They are as follows:

* `realm-cli import --project-id YOUR-PROJECT-ID
    * This will fail. That's expected!
    * Go to the GCP Credentials dashboard https://console.cloud.google.com/apis/credentials
        * Create a new OAuth client ID; Web application. Add the URL for the 'google_oauth > oauth' webhook as an Authorized Redirect URL
        * Add the credentials as Realm secrets: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
* `realm-cli import` - this should now succeed.
* Now, in the browser, go to the URL for the `google_oauth > oauth` webhook.
    * Authorize the app to access the MongoDB account. You may have to click through some scary dialogs.
    * When you see a json response saying `{ 'message': 'ok' }` then you've successfully authorized the app.
    * This should create a document in the `auth.auth_tokens` collection, containing both an `access_token` and a `refresh_token`.
      If not, something's gone wrong.
* Go to the "OAuth Consent Screen" in the YouTube dashboard, and ensure the app is configured as "External",
  under "Testing" and that your MongoDB email account is added to the test users list.      
* *You're done!*