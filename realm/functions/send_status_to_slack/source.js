exports = async function (isError, message) {
  
  // If the status is an error, alert the Slack channel with @channel
  if(isError){
    message = `<!channel> *ERROR 🚨*\n ${message}`;
  }

  // Send a status message to the notifications Slack channel
  const response = await context.http.post({
    url: context.values.get("SLACK_CHANNEL_NOTIFICATIONS"),
    body: { text: message },
    encodeBodyAsJSON: true
  });
  
  if (response.body.text() !== "ok"){
    throw new Error(`An error occurred while trying to send a message to the notifications Slack channel: ${response.body.text()}`);
  }
  
  return true;

};
