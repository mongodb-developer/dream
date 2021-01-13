exports = async function (payload, response) {
  // Get a token (it'll be refreshed if necessary):
  const accessToken = await context.functions.execute("get_token");
  
  let videos = '';
  const docs = await context.services.get("mongodb-atlas").db("dream").collection("youtube_videos").find({}).toArray();
  const docsLength = docs.length;
  
  let pageIncrement = 0;
  let numberOfDocsPerPage = 500;
  while (pageIncrement < docsLength) {
    console.log(`pageIncrement: ${pageIncrement}`);
    videos = "";
    
    // let docIndex = 0 + pageIncrement;
    // while ( docIndex < 500 && docIndex < docsLength) {
    //   videos += `${docs[docIndex]._id},`
    //   console.log(`${docs[docIndex]._id},`);
    //   docIndex ++;
    // }
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
    
    let year = 2020;
    let month = 11;
    for (let day = 1; day <= 15; day++){
      
      // If day is a single digit, ensure it begins with 0
      if (day < 10) {
        day = '0' + day;
      }
    
      let date = `${year}-${month}-${day}`;
      
      // hard coding the MongoDB uploads playlist ID
      //const url = `https://youtubeanalytics.googleapis.com/v2/reports?dimensions=video&endDate=${date}&ids=channel%3D%3DMINE&maxResults=10&metrics=estimatedMinutesWatched%2Cviews%2Clikes%2CsubscribersGained&sort=-views&startDate=${date}&filters=video==${videos}`;
      // NOTE: removing the max results
      const url = `https://youtubeanalytics.googleapis.com/v2/reports?dimensions=video&endDate=${date}&ids=channel%3D%3DMINE&metrics=estimatedMinutesWatched%2Cviews%2Clikes%2CsubscribersGained&sort=-views&startDate=${date}&filters=video==${videos}`;
      
      console.log(url);
      // urlTokens = url.match(/.{1,200}/g);
      // urlTokens.forEach((token) => {
      //   console.log(token);
      // });
      
      // Let's make an actual API request:
      let statsResults = await context.http.get({
        
        url: url,
        headers: {
          'Authorization': [`Bearer ${accessToken}`],
          'Accept': ['application/json'],
        },
      });
      
      console.log(`body.text: ${statsResults.body.text()}`);
      const ejson_body = EJSON.parse(statsResults.body.text());
      //console.log(`ejson_body: ${ejson_body}`);
      
      if(ejson_body.rows) {
        
        // Need to prevent pushing a new item in the array if data for that day already exists
        
        ejson_body.rows.forEach( function(video)  {
          //console.log(`video: ${video}`);
          const videoId = video[0];
          // const updatedDoc = {
          //   "videoId": video[0],
          // }
          const update = {
            "$set": {
              videoId,
              year,
              month
            },
            "$push": {
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
      response.setHeader('Content-Type', 'text/plain');
      response.setBody(statsResults.body.text());
    }
    
    pageIncrement += numberOfDocsPerPage;
  }
};


