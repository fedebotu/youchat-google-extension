import { useEffect, useState } from "preact/hooks";
import { GearIcon } from "@primer/octicons-react";
import { memo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import Browser from "webextension-polyfill";
import { Answer } from "../messaging";
import ChatGPTFeedback from "./ChatGPTFeedback";
import { isBraveBrowser, shouldShowTriggerModeTip } from "./utils.js";

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
            answerText={answer.text}
          />
        </div>
        <ReactMarkdown
          rehypePlugins={[[rehypeHighlight, { detect: true }]]}
        >
          {answer.text}
        </ReactMarkdown>
      </div>
    );
  }

  
  if (error === 'UNAUTHORIZED' || error === 'CLOUDFLARE' || error === 'FORBIDDEN' || error.trim() === '403') {
    return (
      <p className="gpt-inner">
        Please login and pass Cloudflare check at{' '}
        <a href="https://you.com/" target="_blank" rel="noreferrer">
          you.com
        </a>
        {retry > 0 &&
          (() => {
            if (isBraveBrowser()) {
              return (
                <span className="block mt-2">
                  Still not working? Follow{' '}
                  <a href="https://github.com/fedebotu/youchat-google-extension#troubleshooting">
                    Brave Troubleshooting
                  </a>
                </span>
              )
            } else {
              return (
                <span className="italic block mt-2 text-xs">
                  YouChat requires passing a security check every once in a while.
                </span>
              )
            }
          })()}
      </p>
    )
  }
  
  if (error) {
    return (
      <p className="gpt-inner">
        Failed to load response from YouChat:
        <br /> {error}
      </p>
    )
  }

  return (
    <p className="gpt-loading gpt-inner">Waiting for YouChat response...</p>
  );
}

export default memo(ChatGPTQuery);
