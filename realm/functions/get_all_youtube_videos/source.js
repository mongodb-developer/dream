exports = async function () {
  
  // Setting nextPageToken to true initially to get us inside the "while" loop.
  // nextPageToken will be set to the nextPage token that the YouTube API provides
  // after we get initial results
  let nextPageToken = true;
  
  while(nextPageToken){
    
    // Get a token (it'll be refreshed if necessary):
    try {
      const accessToken = await context.functions.execute("get_token");
    } catch (error){
      context.functions.execute("send_status_to_slack", true, `An error occurred while running \`get_all_youtube_videos\`. \n${error}`);
      throw new Error(error);
    }

    // The first time we enter this while loop, we won't have a nextPageToken from YouTube
    let nextPageTokenParam = "";
    if (nextPageToken !== true) {
      nextPageTokenParam = `&pageToken=${nextPageToken}`;
    }
    
    const videoResults = await context.http.get({
      // Hard coding the MongoDB uploads playlist ID for now
      // This id can be generated using the YouTube API when we want to make this generic
      // See https://developers.google.com/youtube/v3/docs/playlistItems/list for API documentation
      url: `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=UUK_m2976Yvbx-TyDLw7n1WA${nextPageTokenParam}`,
      headers: {
        'Authorization': [`Bearer ${accessToken}`],
        'Accept': ['application/json'],
      },
    });
    
    const ejson_videoResults = EJSON.parse(videoResults.body.text());    
    nextPageToken = ejson_videoResults.nextPageToken;

    if (!ejson_videoResults.items) {
      const errorMessage = `No videos returned from the YouTube playlistItems API. ${ejson_videoResults.error.code}: ${ejson_videoResults.error.message}`;
      context.functions.execute("send_status_to_slack", true, `An error occurred while running \`get_all_youtube_videos\`. \n${errorMessage}`);
      throw new Error(errorMessage);
    }
    
    // Create a list of all of the video ids from the results of the API call above
    let idsList = "";
    ejson_videoResults.items.forEach( function(video)  {
      idsList += video.snippet.resourceId.videoId + "%2C"; // adding a URL encoded comma to the end of each ID
    });
    // Remove the final %2C (comma)
    idsList = idsList.substring(0, idsList.length - 3);
    
    const videoDetailResults = await context.http.get({
      // See https://developers.google.com/youtube/v3/docs/videos/list for API documentation
      url: `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics%2CfileDetails%2CliveStreamingDetails%2Clocalizations%2Cplayer%2CprocessingDetails%2CrecordingDetails%2Cstatus%2Csuggestions%2CtopicDetails&id=${idsList}`,
      headers: {
        'Authorization': [`Bearer ${accessToken}`],
        'Accept': ['application/json'],
      },
    });
    
    const ejson_videoDetailResults = EJSON.parse(videoDetailResults.body.text());    

    if (!ejson_videoDetailResults.items) {
      const errorMessage = `No videos returned from the YouTube videos API. ${ejson_videoDetailResults.error.code}: ${ejson_videoDetailResults.error.message}`;
      context.functions.execute("send_status_to_slack", true, `An error occurred while running \`get_all_youtube_videos\`. \n${errorMessage}`);
      throw new Error(errorMessage);
    }
    
    ejson_videoDetailResults.items.forEach( function(video)  {
      // Clean the data
      video._id = video.id;
      
      video.snippet.publishedAt = new Date(video.snippet.publishedAt);
      
      video.statistics.viewCount = parseInt (video.statistics.viewCount);
      video.statistics.likeCount = parseInt (video.statistics.likeCount);
      video.statistics.dislikeCount = parseInt (video.statistics.dislikeCount);
      video.statistics.favoriteCount = parseInt (video.statistics.favoriteCount);
      video.statistics.commentCount = parseInt (video.statistics.commentCount);
        
      if (video.liveStreamingDetails?.actualStartTime) {
        video.liveStreamingDetails.actualStartTime = new Date(video.liveStreamingDetails.actualStartTime);
      }
      if (video.liveStreamingDetails?.actualEndTime) {
        video.liveStreamingDetails.actualEndTime = new Date(video.liveStreamingDetails.actualEndTime);
      }
      if (video.liveStreamingDetails?.scheduledStartTime) {
        video.liveStreamingDetails.scheduledStartTime = new Date(video.liveStreamingDetails.scheduledStartTime);
      }
      if (video.liveStreamingDetails?.scheduledEndTime) {
        video.liveStreamingDetails.scheduledEndTime = new Date(video.liveStreamingDetails.scheduledEndTime);
      }
      
      if (video.recordingDetails?.recordingDate) {
        video.recordingDetails.recordingDate = new Date(video.recordingDetails.recordingDate);
      }
      
      // Can Charts handle the format of the duration? I'm guessing not so I'm converting it here
      // This assumes videos are less than one day in length. I'm hard coding this the dumb way 
      // and there is probably a more elegant solution
      let durationInS;
      // Special case for future live streams
      if (video.contentDetails.duration === "P0D") {
        durationInS = 0;
      } else {
        const regExp = /PT(([0-9]*)H)?(([0-9]*)M)?(([0-9]*)S)?/;
        const tokens = regExp.exec(video.contentDetails.duration);
        
        if (!tokens) {
          const errorMessage = `Unable to parse duration for video ${video.id} with duration ${video.contentDetails.duration}`;
          context.functions.execute("send_status_to_slack", true, `An error occurred while running \`get_all_youtube_videos\`. \n${errorMessage}`);
          throw new Error(errorMessage);
        }
        
        let seconds = 0;
        let minutes = 0;
        let hours = 0;
        
        if(tokens[6])	seconds = parseInt(tokens[6]);
        if(tokens[4]) minutes = parseInt(tokens[4]);
        if(tokens[2]) hours = parseInt(tokens[2]);
        
        durationInS = seconds + (minutes * 60 ) + (hours * 60 * 60);
      }
      video.contentDetails.durationInS = durationInS;
    
      // Upsert the data
      context.services.get("mongodb-atlas").db("dream").collection("youtube_videos").updateOne({ "_id": `${video._id}` }, { $set: video }, { "upsert": true });
    });
  }
  
  context.functions.execute("send_status_to_slack", false, `\`get_all_youtube_videos\` ran successfully`);
  return true;
};
