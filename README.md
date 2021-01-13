# MongoDB DREAM Project

Developer Relation Engagement &amp; Activity Metrics

## Goals

- Collect metrics from the different platforms the Developer Relations team is using to produce content for reporting &amp; analysis purposes.

## Copying Data

To move data from Dev to Staging:

`mongodump --uri mongodb+srv://username:password@uri-for-dev/dream`

`mongorestore --uri mongodb+srv://username:password@uri-for-staging --drop`
