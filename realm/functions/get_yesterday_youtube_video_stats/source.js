exports = async function () {

  let date = new Date();
  // Set the date to two days prior (yesterday's stats are not available)
  date.setDate(date.getDate() - 2);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
    
  await context.functions.execute("get_youtube_video_stats", year, month, day);

  return `YouTube video stats imported for ${year}-${month}-${day}`;
};


