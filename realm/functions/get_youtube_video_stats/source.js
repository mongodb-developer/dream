exports = async function (year, month, day) {

  // If day is a single digit, ensure it begins with 0
  if (day < 10) {
    day = '0' + day;
  }

  // If month is a single digit, ensure it begins with 0
  if (month < 10) {
    month = '0' + month;
  }

  let date = `${year}-${month}-${day}`;
  
  let videos = '';
  const docs = await context.services.get("mongodb-atlas").db("dream").collection("youtube_videos").find({}).toArray();
  const docsLength = docs.length;
  
  let pageIncrement = 0;
  let numberOfDocsPerPage = 500;
  while (pageIncrement < docsLength) {
    console.log(`pageIncrement: ${pageIncrement}`);
    videos = "";
    
    for (i = pageIncrement; i < pageIncrement + numberOfDocsPerPage; i++){
      console.log(`i: ${i}, pageIncrement: ${pageIncrement}, numberOfDocsPerPage: ${numberOfDocsPerPage}`);
      if (i >= (docsLength - 1) ) break;
      videos += `${docs[i]._id},`;
      console.log(`${docs[i]._id},`);
    }
    console.log(videos.slice(-30));
    console.log(`number of Videos ${ (videos.length / 12)}`);

    //remove final trailing comma
    videos = videos.slice(0, -1);
    console.log(videos);
    console.log(docs.length);      
      
    // Get a token (it'll be refreshed if necessary):
    const accessToken = await context.functions.execute("get_token");
    
    // hard coding the MongoDB uploads playlist ID
    const url = `https://youtubeanalytics.googleapis.com/v2/reports?dimensions=video&endDate=${date}&ids=channel%3D%3DMINE&metrics=estimatedMinutesWatched%2Cviews%2Clikes%2CsubscribersGained&sort=-views&startDate=${date}&filters=video==${videos}`;
    
    let statsResults = await context.http.get({
      url: url,
      headers: {
        'Authorization': [`Bearer ${accessToken}`],
        'Accept': ['application/json'],
      },
    });
    
    const ejson_body = EJSON.parse(statsResults.body.text());
    
    if(ejson_body.rows) {        
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
              "estimatedMinutesWatched": video[1],
              "views": video[2],
              "likes": video[3],
              "subscribersGained": video[4]
            }
          }
        };
        //Todo: probably want to copy data like the name, isDA, and creator names here
        //note: could do some calculations here and store them in the docs
        const options = { "upsert": true };
        
        const doc =  context.services.get("mongodb-atlas").db("dream").collection("youtube_stats").updateOne({ "_id": `${videoId}_${year}_${month}` }, update, options);
      });
    }
    
    pageIncrement += numberOfDocsPerPage;
  }

  return "Data imported";
};


