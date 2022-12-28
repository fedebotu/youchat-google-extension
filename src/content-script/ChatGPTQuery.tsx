import { useEffect, useState } from "preact/hooks";
import { GearIcon } from "@primer/octicons-react";
import { memo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import Browser from "webextension-polyfill";
import { Answer } from "../messaging";
import ChatGPTFeedback from "./ChatGPTFeedback";
import { isBraveBrowser, shouldShowTriggerModeTip } from "./utils.js";
import remarkReferenceLinks from "remark-reference-links";

interface Props {
  question: string;
}

function ChatGPTQuery(props: Props) {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [done, setDone] = useState(false);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const port = Browser.runtime.connect();
    const listener = (msg: any) => {
      if (msg.text) {
        setAnswer(msg);
      } else if (msg.error) {
        setError(msg.error);
      } else if (msg.event === "DONE") {
        setDone(true);
      }
    };
    port.onMessage.addListener(listener);
    port.postMessage({ question: props.question });
    return () => {
      port.onMessage.removeListener(listener);
      port.disconnect();
    };
  }, [props.question, retry]);

  // retry error on focus
  useEffect(() => {
    const onFocus = () => {
      if (error && (error == "UNAUTHORIZED" || error === "CLOUDFLARE")) {
        setError("");
        setRetry((r) => r + 1);
      }
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [error]);

  useEffect(() => {
    shouldShowTriggerModeTip().then((show) => setShowTip(show));
  }, []);

  const openOptionsPage = useCallback(() => {
    Browser.runtime.sendMessage({ type: "OPEN_OPTIONS_PAGE" });
  }, []);

  const openInNewTab = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (answer) {
    return (
      <div id="answer" className="markdown-body gpt-inner" dir="auto">
        <div className="gpt-header">
          <span className="font-bold">YouChat</span>
          <span
            className="cursor-pointer leading-[0]"
            onClick={openOptionsPage}
          >
            <GearIcon size={14} />
          </span>
          <ChatGPTFeedback
            messageId={answer.messageId}
            conversationId={answer.conversationId}
          />
        </div>
        <ReactMarkdown
          remarkPlugins={[remarkReferenceLinks]}
          rehypePlugins={[[rehypeHighlight, { detect: true }]]}
        >
          {answer.text}
        </ReactMarkdown>
        {done && showTip && (
          <p className="italic mt-2">
            Tip: you can switch to manual trigger mode in{" "}
            <span
              className="underline cursor-pointer"
              onClick={openOptionsPage}
            >
              extension settings
            </span>
            . Note that this is an unofficial extension and not affiliated with{" "}
            <span
              className="underline cursor-pointer"
              onClick={() =>
                openInNewTab(
                  "https://you.com/search?q=what%20was%20the%20recent%20breakthrough%20in%20fusion%20research%3F"
                )
              }
            >
              YouChat
            </span>
            .
          </p>
        )}
      </div>
    );
  }

  if (error === "UNAUTHORIZED" || error === "CLOUDFLARE") {
    return (
      <p className="gpt-inner">
        To be fixed
        {isBraveBrowser() && retry > 0 && (
          <span>
            <br />
            Still not working? Follow{" "}
            <a href="https://github.com/wong2/chat-gpt-google-extension#troubleshooting">
              Brave Troubleshooting
            </a>
          </span>
        )}
      </p>
    );
  }
  if (error) {
    return (
      // print error to screen
      <p className="gpt-inner">
        Failed to load response from YouChat:
        <br /> {error}
        {/* <br /> {answer} */}
      </p>
    );
  }

  return (
    <p className="gpt-loading gpt-inner">Waiting for YouChat response...</p>
  );
}

export default memo(ChatGPTQuery);
