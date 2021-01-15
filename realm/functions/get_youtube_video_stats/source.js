exports = async function (year, month, day) {

  const database = "dream";
  const statsCollection = "youtube_stats";
  const videosCollection = "youtube_videos";

  // If day is a single digit, ensure it begins with 0
  if (day < 10) {
    day = '0' + day;
  }

  // If month is a single digit, ensure it begins with 0
  if (month < 10) {
    month = '0' + month;
  }

  let date = `${year}-${month}-${day}`;
  
  const allYouTubeVideos = await context.services.get("mongodb-atlas").db(database).collection(videosCollection).find({}).toArray();
  const totalNumberOfYouTubeVideos = allYouTubeVideos.length;
  
  // We will paginate the videos in groups of 500
  let pageIncrement = 0;
  let numberOfDocsPerPage = 500;
  
  while (pageIncrement < totalNumberOfYouTubeVideos) {

    // Generate a list of videos for this page
    let videos = "";
    for (i = pageIncrement; i < pageIncrement + numberOfDocsPerPage; i++){
      if (i >= (totalNumberOfYouTubeVideos - 1) ) break;
      videos += `${allYouTubeVideos[i]._id},`;
    }
    // Remove final trailing comma from the videos list
    videos = videos.slice(0, -1);   
      
    // Get a token (it'll be refreshed if necessary):
    const accessToken = await context.functions.execute("get_token");
    
    // See https://developers.google.com/youtube/analytics/reference/reports/query for details on this call
    // NOTE:  If you edit the metrics in this url, be sure to update the stats that are pulled from the results 
    // of this call. Order matters to the results.
    const url = `https://youtubeanalytics.googleapis.com/v2/reports?dimensions=video&endDate=${date}&ids=channel%3D%3DMINE&metrics=views%2Clikes%2Cdislikes%2Cshares%2Ccomments%2CestimatedMinutesWatched%2CaverageViewDuration%2CaverageViewPercentage%2CsubscribersGained%2CsubscribersLost%2CvideosAddedToPlaylists%2CvideosRemovedFromPlaylists&sort=-views&startDate=${date}&filters=video==${videos}`;
    
    let statsResults = await context.http.get({
      url: url,
      headers: {
        'Authorization': [`Bearer ${accessToken}`],
        'Accept': ['application/json'],
      },
    });
    
    let ejson_body;
    try {
      ejson_body = EJSON.parse(statsResults.body.text());
    } catch (error) {
      throw new Error(`Error occurred while parsing the following: ${statsResults.body.text()}`);
    }
    if (!ejson_body.rows) {
      throw new Error(`No stats returned. ${ejson_body.error.code}: ${ejson_body.error.message}`);
    }
      
    ejson_body.rows.forEach( function(video)  {
      const videoId = video[0];
      const update = {
        "$set": {
          videoId,
          year,
          month: parseInt(month)
        },
        "$addToSet": {
          "stats": {
            "date": new Date(date),
            "views": video[1],
            "likes": video[2],
            "dislikes": video[3],
            "shares": video[4],
            "comments": video[5],
            "estimatedMinutesWatched": video[6],
            "averageViewDuration": video[7],
            "averageViewPercentage": video[8],
            "subscribersGained": video[9],
            "subscribersLost": video[10],
            "videosAddedToPlaylists": video[11],
            "videosRemovedFromPlaylists": video[12]
          }
        }
      };

      const options = { "upsert": true };
      context.services.get("mongodb-atlas").db(database).collection(statsCollection).updateOne({ "_id": `${videoId}_${year}_${month}` }, update, options);
    });
    
    pageIncrement += numberOfDocsPerPage;
  }
};
