async function request(method: string, path: string, data: unknown) {
  const dataParam = JSON.stringify(data); // TODO: encode to replace special character #
  const url = `https://you.com/api/streamingSearch?q=${dataParam}&domain=youchat`;
  return fetch(
    url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function sendMessageFeedback(data: unknown) {
  await request("POST", "/conversation/message_feedback", data);
}

export async function setConversationProperty(
  // token: string,
  conversationId: string,
  propertyObject: object
) {
  await request("PATCH", `/conversation/${conversationId}`, propertyObject);
}