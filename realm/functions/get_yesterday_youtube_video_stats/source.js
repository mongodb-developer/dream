exports = async function () {

  let date = new Date();
  // Set the date to three days prior (stats will only be returned when YouTube has stats for all metrics)
  date.setDate(date.getDate() - 3);
  const year = date.getFullYear();
  // JavaScript sets January to month 0
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  try {
    await context.functions.execute("get_youtube_video_stats", year, month, day);
    context.functions.execute("send_status_to_slack", false, `\`get_yesterday_youtube_video_stats\` ran successfully. YouTube video stats imported for ${year}-${month}-${day}`);
    return {
      date: `${year}-${month}-${day}`,
      message: `YouTube video stats imported for ${year}-${month}-${day}`
    };
  } catch (error) {
    const errorMessage = `Unable to import stats for ${year}-${month}-${day}: ${error}`;
    context.functions.execute("send_status_to_slack", true, `An error occurred while running \`get_yesterday_youtube_video_stats\`. \n${errorMessage}`);
    throw new Error(errorMessage);
  }
  
};
