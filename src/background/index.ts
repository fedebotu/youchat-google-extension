import { string } from "prop-types";
import Browser from "webextension-polyfill";
import { Answer, Link} from "../messaging.js";
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
    // "https://you.com/api/youchatStreaming?question=" + question + "&chat=[]",
    "https://you.com/api/streamingSearch?q=" + question + "&domain=youchat",

    {
      method: "GET",
      signal: controller.signal,

      // We parse the full event here.
      // NOTE: [Future work]  We could even parse the full internal search results!
      onMessage(message: any) {

        console.debug("sse message", message);
        messages.push(message);

        let text = String("");
        let serpResults = [];
        let urlCount = 1;
        let links = [];

        for (const message of messages) {
       
          const obj = JSON.parse(message.data);

          let new_text = String("");

          // add to text key youChatToken and its value if it exists
          if (obj.hasOwnProperty('youChatToken')) {
            new_text = obj.youChatToken;
          }

          // Internal results
          if (obj.hasOwnProperty('youChatSerpResults')) {
            serpResults = obj.youChatSerpResults;
          }

          // if serpResults is not empty, detect if the text contains a url. if so, get the urlCount index
          // and replace it with the name of the url
          // for example: [8][https//google.com] -> [1][https//google.com]
          if (serpResults.length > 0) {
            for (const result of serpResults) {
              if (new_text.includes(result.url)) {

                let linkIndex = 0;
                if (!links.some((link) => link.url === result.url)) {
                  links.push({index: urlCount, name: result.name, url: result.url} as Link);
                  linkIndex = urlCount;
                  urlCount++;
                }
                else {
                  linkIndex = links.find((link) => link.url === result.url).index;
                }               
                text = text.replace(result.url, `[[${linkIndex}]](${result.url})`);
                new_text = `[[${linkIndex}]](${result.url})`;
              }
            }
          }
          text += new_text;      
        }
        
        if (text) {
          port.postMessage({
            text,
            links: links,
            status: 'done',
            messageId: 'dummy',
            conversationId: 'dummy',
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
