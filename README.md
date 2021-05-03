# MongoDB DREAM Project

Developer Relation Engagement &amp; Activity Metrics

## Goals

- Collect metrics from the different platforms the Developer Relations team is using to produce content for reporting &amp; analysis purposes.

## YouTube Analytics

The code currently pulls analytics about videos in the MongoDB YouTube channel.  For more information on the metrics we pull, see the [YouTube API Docs](https://developers.google.com/youtube/analytics/metrics#views).

The stats are displayed in a MongoDB Charts dashboard.

A daily trigger makes a call to the [get_all_youtube_videos](realm/functions/get_all_youtube_videos/source.js) function.  The function retrieves information about all videos that have been uploaded to the MongoDB YouTube channel.

A daily trigger makes a call to the [get_yesterday_youtube_video_stats](realm/functions/get_yesterday_youtube_video_stats/source.js) function.  The function retrieves stats from three days prior. (YouTube only provides stats when all metrics that you request are available. Some of our metrics appear to be on a three-day delay.)  

To retrieve older stats, use the [get_previous_youtube_video_stats](realm/functions/get_previous_youtube_video_stats/source.js) function.  You can call the function by opening it in the Realm web UI and typing something like the following into the console: `exports(2021, 1, 1, 15)`.  Optionally, you can use [generate-historical-youtube-data.js](scripts/generate-historical-youtube-data.js), which will call the function repeatedly for you.  

While you're gathering stats, you may want to easily delete stats for a given month.  You can use [delete.js](scripts/delete.js) to do so.

If you want to sanity check that the stats you've pulled make sense, you can use [test-views.js](scripts/test-views.js). This script checks that the sum of the daily views stored in the ``youtube_stats`` collection aligns with the total views stat that YouTube provides (which we store in the ``youtube_videos`` collection in ``statistics.viewCount``).  Keep in mind that these stats may not be a perfect match because:
1. We collect stats on a three-day delay and YouTube's total views stat is current
2. Any views prior to when you started collecting stats will not be included in the calculated sum

The script reports how many videos were published in the given time period for each of the following categories:
1. 0 views
1. Calculated sum of views **exactly matches** what YouTube is reporting
1. Calculated sum of views **is close** to what YouTube is reporting
1. Calculated sum of views **is not close** to what YouTube is reporting

For videos with views that are not close to what YouTube is reporting, the script displays output you can you manually review to determine if the stats are close enough or if there is an error in the view count.

## Tips & Tricks

This section contains random tips and tricks we don't want to forget.

### Moving Data

To move data from Dev to Staging:

`mongodump --uri mongodb+srv://username:password@uri-for-dev/dream`

`mongorestore --uri mongodb+srv://username:password@uri-for-staging --drop`

### First Deployment

The steps to configure authentication on first deployment are a little fiddly.
They are as follows:

* `realm-cli import --project-id YOUR-PROJECT-ID`
    * This will fail. That's expected!
    * Go to the GCP Credentials dashboard https://console.cloud.google.com/apis/credentials
        * Create a new OAuth client ID; Web application. Add the URL for the 'google_oauth > oauth' webhook as an Authorized Redirect URL
        * Add the credentials as Realm secrets: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
    * Configure Slack notifications
        * Create a new application in the [Slack API dashboard](https://api.slack.com/apps) and configure a new Incoming Webhook. The webhook should be connected to a channel where you want the Slack notifications to be posted.
        * Copy the Webhook URL.
        * In the Realm UI, create a new secret named `SLACK_CHANNEL_NOTIFICATIONS` that has the value of the Webhook URL you copied in the previous step.
* `realm-cli import` - this should now succeed.
* Now, in the browser, go to the URL for the `google_oauth > oauth` webhook.
    * Authorize the app to access the MongoDB account. You may have to click through some scary dialogs.
    * When you see a json response saying `{ 'message': 'ok' }` then you've successfully authorized the app.
    * This should create a document in the `auth.auth_tokens` collection, containing both an `access_token` and a `refresh_token`.
      If not, something's gone wrong.
* Go to the "OAuth Consent Screen" in the YouTube dashboard, and ensure the app is configured as "External",
  under "Testing" and that your MongoDB email account is added to the test users list.      
* *You're done!*

### Clearing Your OAuth Token

If you need to clear your OAuth token, see the instructions in [this pull request](https://github.com/mongodb-developer/dream/pull/2).

## Questions?

Ask in the [MongoDB Developer Community](https://community.mongodb.com).
 
