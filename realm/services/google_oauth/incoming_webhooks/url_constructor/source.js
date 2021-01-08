// This function is the webhook's request handler.
exports = function (payload, response) {
  let url = context.request.webhookUrl;
  if (context.request.rawQueryString !== undefined) {
    url += "?" + context.request.rawQueryString;
  }

  return url;
};
