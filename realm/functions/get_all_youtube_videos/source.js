exports = async function () {
  
  // Setting nextPageToken to true initially to get us inside the "while" loop.
  // nextPageToken will be set to the nextPage token that the YouTube API provides
  // after we get initial results
  let nextPageToken = true;
  
  while(nextPageToken){
    
    // Get a token (it'll be refreshed if necessary):
    const accessToken = await context.functions.execute("get_token");

    // The first time we enter this while loop, we won't have a nextPageToken from YouTube
    let nextPageTokenParam = "";
    if (nextPageToken !== true) {
      nextPageTokenParam = `&pageToken=${nextPageToken}`;
    }
    
    let videoResults = await context.http.get({
      // hard coding the MongoDB uploads playlist ID for now
      // This id can be generated using the YouTube API when we want to make this generic
      url: `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=UUK_m2976Yvbx-TyDLw7n1WA${nextPageTokenParam}`,
      headers: {
        'Authorization': [`Bearer ${accessToken}`],
        'Accept': ['application/json'],
      },
    });
    
    const ejson_body = EJSON.parse(videoResults.body.text());    
    nextPageToken = ejson_body.nextPageToken;

    if (!ejson_body.items) {
      throw `No videos returned. ${ejson_body.error.code}: ${ejson_body.error.message}`;;
    }
    ejson_body.items.forEach( function(video)  {
      video._id = video.snippet.resourceId.videoId;
      video.snippet.publishedAt = new Date(video.snippet.publishedAt)
      context.services.get("mongodb-atlas").db("dream").collection("youtube_videos").updateOne({ "_id": `${video._id}` }, { $set: video }, { "upsert": true });
    });
  }
};
