import Browser from "webextension-polyfill";
import { Answer } from "../messaging.js";
import { sendMessageFeedback, setConversationProperty } from "./chatgpt.js";
import { fetchSSE } from "./fetch-sse.js";

async function generateAnswers(port: Browser.Runtime.Port, question: string) {
  let conversationId: string | undefined;
  const deleteConversation = () => {
    if (conversationId) {
      setConversationProperty(conversationId, { is_visible: false });
    }
  };

  const controller = new AbortController();
  port.onDisconnect.addListener(() => {
    controller.abort();
    deleteConversation();
  });

  let messages = [];

  await fetchSSE(
    "https://you.com/api/youchatStreaming?question=" + question + "&chat=[]",
    {
      method: "GET",
      signal: controller.signal,

      // NOTE: possibly this boy is not the best, better look for "done" or "end" or something
      onMessage(message: string) {
        console.debug("sse message", message);
        if (message === "I'm Mr. Meeseeks. Look at me.") {
          port.postMessage({ event: "DONE" });
          deleteConversation();
          return;
        }
        messages.push(message);

        let text = String("");

        for (const message of messages) {
          const obj = JSON.parse(message);
          const token = obj.token;

          //if undefined, remove
          if (token === undefined) {
            continue;
          }
          text += token;
        }

        if (text) {
          port.postMessage({
            text,
          } as Answer);
        }
      },
    }
  );
}

Browser.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (msg) => {
    console.debug("received msg", msg);
    try {
      await generateAnswers(port, msg.question);
    } catch (err: any) {
      console.error(err);
      port.postMessage({ error: err.message });
    }
  });
});

Browser.runtime.onMessage.addListener(async (message) => {
  if (message.type === "FEEDBACK") {
    // const token = await getAccessToken()
    await sendMessageFeedback(message.data);
  } else if (message.type === "OPEN_OPTIONS_PAGE") {
    Browser.runtime.openOptionsPage();
  }
});

if (Browser.action) {
  Browser.action.onClicked.addListener(() => {
    Browser.runtime.openOptionsPage();
  });
} else {
  Browser.browserAction.onClicked.addListener(() => {
    Browser.runtime.openOptionsPage();
  });
}
