exports = async function (year, month, firstDay, lastDay) {
  // NOTE: We recommend gathering up to 15 days of stats to prevent timeouts
    
  for (let day = firstDay; day <= lastDay; day++) {
    try {
      await context.functions.execute("get_youtube_video_stats", year, month, day);
      console.log(`YouTube video stats imported for ${year}-${month}-${day}`);
    } catch (error) {
      throw new Error(`An error occurred while importing stats for ${year}-${month}-${day}: ${error}`);
    }   
  }  

  return {
    startDate: `${year}-${month}-${firstDay}`,
    endDate: `${year}-${month}-${lastDay}`,
    message: `YouTube video stats imported for the date range ${year}-${month}-${firstDay} - ${year}-${month}-${lastDay}`
  }
};


