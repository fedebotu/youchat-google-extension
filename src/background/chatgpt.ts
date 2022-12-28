async function request(method: string, path: string, data: unknown) {
  return fetch(
    "https://you.com/api/youchatStreaming?question=" + data + "&chat=[]",
    {
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
