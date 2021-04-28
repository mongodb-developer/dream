const { MongoClient } = require('mongodb');

/**
 * Use this script to test if the number of views YouTube reports each video has matches
 * the sum of the views that are pulled daily about each video
 */
async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/drivers/node/ for more details
     */
   const uri = "";
   
    /**
     * The Mongo Client you will use to interact with your database
     * See https://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html for more details
     */
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

       await checkStats(client);

    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
}

main().catch(console.error);

async function checkStats(client) {
   const collection = await client.db("dream").collection("youtube_videos");

   // Update the first $match stage for whatever time period you want to test
   const pipeline = [{
      $match: {
         "snippet.publishedAt": { $gte: new Date('2021-01-01'), $lt: new Date('2022-01-01') },
      }
   }, {
      $lookup: {
         from: 'youtube_stats',
         localField: '_id',
         foreignField: 'videoId',
         as: 'stats'
      }
   }, {
      $unwind: {
         path: "$stats",
         preserveNullAndEmptyArrays: false
      }
   }, {
      $addFields: {
         "calculatedMonthViews": { $sum: "$stats.stats.views" }
      }
   }, {
      $group: {
         _id: "$_id",
         calculatedTotalViews: {
            $sum: "$calculatedMonthViews"
         },
         youtubeTotalViews: {
            $first: "$statistics.viewCount"
         },
         publishedAt: {
            $first: "$snippet.publishedAt"
         }
      }
   }];
   
   const aggCursor = collection.aggregate(pipeline);
   
   let zeroViews = [];
   let equalViews = [];
   let closeViews = [];
   let notCloseViews = [];

   await aggCursor.forEach(video => {

      if (video.youtubeTotalViews === null && video.calculatedTotalViews === 0) {
         zeroViews.push(video);
      } else if (video.youtubeTotalViews === video.calculatedTotalViews) {
         equalViews.push(video);
      } else {
         const publicationDate = video.publishedAt;

         const numberOfDaysSincePublication = (new Date() - publicationDate) / (1000 * 60 * 60 * 24);

         // Going to assume an even distribution of views among the days (yes, this is flawed) 
         const numberOfViewsPerDay = video.youtubeTotalViews / numberOfDaysSincePublication;

         // Since our views are delayed by 3 days, add 3 days of views to our calculated number of views
         const adjustedNumberOfViews = video.calculatedTotalViews + 3 * numberOfViewsPerDay;

         const minAcceptableYoutubeViews = video.youtubeTotalViews * .9;
         const maxAcceptableYoutubeViews = video.youtubeTotalViews * 1.1

         // Check if the calculated views OR the adjusted views are close to the number YouTube is giving us
         if ( video.calculatedTotalViews >= minAcceptableYoutubeViews && video.calculatedTotalViews <= maxAcceptableYoutubeViews || 
            adjustedNumberOfViews >= minAcceptableYoutubeViews && adjustedNumberOfViews <= maxAcceptableYoutubeViews) {
            closeViews.push(video);
         
         } else {
            notCloseViews.push(video);

            console.log();
            console.log(video._id);
            console.log(publicationDate);
            console.log("video.youtubeTotalViews: " + video.youtubeTotalViews);
            console.log("video.calculatedTotalViews: " + video.calculatedTotalViews);
            console.log("numberOfViewsPerDay: " + numberOfViewsPerDay);
            console.log("adjustedNumberOfViews: " + adjustedNumberOfViews);
            console.log("min: " + minAcceptableYoutubeViews);
            console.log("max: " + maxAcceptableYoutubeViews)

         }
      }
   });
   
   console.log(`zeroViews: ${zeroViews.length}`);
   console.log(`equalViews: ${equalViews.length}`);
   console.log(`closeViews: ${closeViews.length}`);
   console.log(`notCloseViews: ${notCloseViews.length}`);
}

