exports = async function (year, month, firstDay, lastDay) {
  // NOTE: We recommend gathering up to 15 days of stats to prevent timeouts
    
  for (let day = firstDay; day <= lastDay; day++) {
    await context.functions.execute("get_youtube_video_stats", year, month, day);
    console.log(`YouTube video stats imported for ${year}-${month}-${day}`);    
  }  

  return "Data imported";
};

