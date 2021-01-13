exports = async function () {

  let date = new Date();
  // Set the date to yesterday
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
    
  await context.functions.execute("get_youtube_video_stats", year, month, day);

  return `YouTube video stats imported for ${year}-${month}-${day}`;
};


