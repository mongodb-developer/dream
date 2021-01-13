exports = async function () {
  // Get a token (it'll be refreshed if necessary):
  const accessToken = await context.functions.execute("get_token");
  
  let nextPageToken;
      
  // Duplicating code here so I can get the initial nextPageToken -- need to clean this up
  
  // Let's make an actual API request:
  let videoResults = await context.http.get({
    // hard coding the MongoDB uploads playlist ID
    url: 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=UUK_m2976Yvbx-TyDLw7n1WA',
    headers: {
      'Authorization': [`Bearer ${accessToken}`],
      'Accept': ['application/json'],
    },
  });
  
  const ejson_body = EJSON.parse(videoResults.body.text());
  
  nextPageToken = ejson_body.nextPageToken;
  console.log(nextPageToken);
  

  ejson_body.items.forEach( function(video)  {
    video._id = video.snippet.resourceId.videoId;
    video.snippet.publishedAt = new Date(video.snippet.publishedAt)
    const doc = context.services.get("mongodb-atlas").db("dream").collection("youtube_videos").updateOne({ "_id": `${video._id}` }, {$set: video}, { "upsert": true });
  });
  
  while(nextPageToken){
    
    // Let's make an actual API request:
    let videoResults = await context.http.get({
      // hard coding the MongoDB uploads playlist ID
      url: `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=UUK_m2976Yvbx-TyDLw7n1WA&pageToken=${nextPageToken}`,
      headers: {
        'Authorization': [`Bearer ${accessToken}`],
        'Accept': ['application/json'],
      },
    });
    
    const ejson_body = EJSON.parse(videoResults.body.text());
    
    nextPageToken = ejson_body.nextPageToken;
    console.log(nextPageToken);
    

    ejson_body.items.forEach( function(video)  {
      video._id = video.snippet.resourceId.videoId;
      video.snippet.publishedAt = new Date(video.snippet.publishedAt)
      const doc = context.services.get("mongodb-atlas").db("dream").collection("youtube_videos").updateOne({ "_id": `${video._id}` }, {$set: video}, { "upsert": true });
    });
  }

  return "Data imported";

};

