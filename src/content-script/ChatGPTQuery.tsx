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
        {answer.links &&
          answer.links.map((link) => (
            <div style={{textOverflow: "ellipsis"}} className="mt-2 hover:underline hover:pointer cursor-pointer flex flex-wrap" onClick={() => openInNewTab(link.url)}>
              <div className="overflow-hidden max-w-xs">
                <span className="text-sm" style={{textOverflow: "ellipsis"}}>
                    <a href={'javascript:void(0)'}>[{link.index}] {link.name}</a>
                  </span>
              </div>
              <div className="overflow-hidden max-w-xs">
                <span className="text-xs text-gray-500" style={{textOverflow: "ellipsis"}} > {link.url}</span>
              </div>
            </div>
          ))}
      </div>
    );
  }


  if (error === 'UNAUTHORIZED' || error === 'CLOUDFLARE' || error === 'FORBIDDEN' || error.includes('403')) {
    return (
      <p className="gpt-inner">
        Please pass {' '}
        <a href="https://you.com/api/streamingSearch?q=hi%20go&domain=youchat" target="_blank" rel="noreferrer">
        Cloudflare
        </a> first. You may close that tab after passing the check.

        <span className="italic block mt-2 text-xs">
          Still not working? Try to <a href="https://you.com/api/auth/login">login</a> to you.com as well.
            You may also try <a href="https://github.com/fedebotu/youchat-google-extension#troubleshooting">these troubleshooting steps </a>. 
            Otherwise, please report any issues <a href="https://github.com/fedebotu/youchat-google-extension/issues"> here </a>.
        </span>

        {/* {' '}
        <a href="https://you.com/api/auth/login" target="_blank" rel="noreferrer">
          here
        </a> */}
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
        <br />
        <span className="italic block mt-2 text-xs">
            Remember to <a href="https://you.com/api/auth/login">login</a> to You.com before using YouChat.
            You may also try <a href="https://github.com/fedebotu/youchat-google-extension#troubleshooting">these troubleshooting steps </a>. 
            Otherwise, please report any issues <a href="https://github.com/fedebotu/youchat-google-extension/issues"> here </a>.
        </span>
      </p>
    )
  }

  return (
    <p className="gpt-loading gpt-inner">Waiting for YouChat response...</p>
  );
}

export default memo(ChatGPTQuery);
