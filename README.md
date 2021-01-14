# MongoDB DREAM Project

Developer Relation Engagement &amp; Activity Metrics

## Goals

- Collect metrics from the different platforms the Developer Relations team is using to produce content for reporting &amp; analysis purposes.

## YouTube Analytics

The code currently pulls analytics about videos in the MongoDB YouTube channel.  For more information on the metrics we pull, see the [YouTube API](https://developers.google.com/youtube/analytics/metrics#views).

A daily trigger makes a call to the [get_all_youtube_videos](functions/get_all_youtube_videos/source.js) function.  The function retrieves information about all videos that have been uploaded to the MongoDB YouTube channel.

A daily trigger makes a call to the [get_yesterday_youtube_video_stats](functions/get_yesterday_youtube_video_stats/source.js) function.  The function retrieves stats from three days prior. (YouTube only provides stats when all metrics that you request are available. Some of our metrics appear to be on a three-day delay.)  

To retrieve older stats, use the [get_previous_youtube_video_stats](functions/get_previous_youtube_video_stats/source.js) function.  You can call the function by opening it in the Realm web UI and typing something like the following into the console: `exports(2021, 1, 1, 15)`.

The stats are displayed in a MongoDB Charts dashboard.

## Tips & Tricks

This section contains random tips and tricks we don't want to forget.

### Moving Data

To move data from Dev to Staging:

`mongodump --uri mongodb+srv://username:password@uri-for-dev/dream`

`mongorestore --uri mongodb+srv://username:password@uri-for-staging --drop`

### Clearing Your OAuth Token

If you need to clear your OAuth token, see the instructions in [this pull request](https://github.com/mongodb-developer/dream/pull/2).

## Questions?

Ask in the [MongoDB Developer Community](https://community.mongodb.com).
