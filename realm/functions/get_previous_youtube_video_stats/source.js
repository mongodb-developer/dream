exports = async function () {
    
  let year = 2020;
  let month = 11;
  for (let day = 1; day <= 15; day++) {
    context.functions.execute("get_youtube_video_stats", year, month, day);
    console.log(`YouTube video stats imported for ${year}-${month}-${day}`);    
  }  

  return "Data imported";
};


