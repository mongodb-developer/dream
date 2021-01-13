exports = async function (year, month, firstDay, firstDay) {
    
  for (let day = firstDay; day <= firstDay; day++) {
    await context.functions.execute("get_youtube_video_stats", year, month, day);
    console.log(`YouTube video stats imported for ${year}-${month}-${day}`);    
  }  

  return "Data imported";
};


