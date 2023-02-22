# YouChat for Google

<p align='center'>
  <a href="https://chrome.google.com/webstore/detail/youchat-ai-for-google/fadggkehmhkhahfcdeoghpepnpnhilhg">
    <img src='https://user-images.githubusercontent.com/776467/172134806-68c06ee3-a032-45bc-a9cf-0cd7ca7288d8.png' alt='Chrome Web Store Add-on' title="Link to the extension's page on the Chrome Web Store">
  </a>
  <a href="https://addons.mozilla.org/en-US/firefox/addon/youchat-ai-for-google/">
    <img src='https://user-images.githubusercontent.com/776467/172134802-013d3af2-00fa-45a4-94f7-a772ff29fab0.png' alt='Firefox Add-on' title="Link to the extension's page on the Firefox Add-ons website">
  </a>
</p>


A browser extension to display YouChat response - like ChatGPT, but with knowledge of recent events and source citation - alongside Google and other search engines results, supports Chrome/Edge/Firefox

## Supported Search Engines

Google, Baidu, Bing, DuckDuckGo, Brave, Yahoo, Naver, Yandex, Kagi, Searx

## Screenshot

![Screenshot](screenshots/extension.png?raw=true)

## Why YouChat?
[YouChat](https://you.com/search?q=what%20was%20the%20recent%20breakthrough%20in%20fusion%20research%3F) has some advantages over ChatGPT:
- Does not need login
- Knows about recent events 
- Cites sources
- Faster response time


![Screenshot](screenshots/youchat_chatgpt.png?raw=true)


However, YouChat does not provide answers as elaborate as ChatGPT. The best way may be to run it alongside the [ChatGPT extension](https://github.com/wong2/chat-gpt-google-extension) on which this project based, as shown above!
Note this is an unofficial implementation and YouChat is not affiliated with this project. 

## Installation

### Install to Chrome/Edge/Brave/Opera

_Notice: Brave/Opera users please follow [Troubleshooting](#troubleshooting) section after install_

#### Install from Chrome Web Store (Preferred)

<a href="https://chrome.google.com/webstore/detail/youchat-ai-for-google/fadggkehmhkhahfcdeoghpepnpnhilhg"><img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_128x128.png" width="24" /></a>
[Chrome Web Store Link](https://chrome.google.com/webstore/detail/youchat-ai-for-google/fadggkehmhkhahfcdeoghpepnpnhilhg)


#### Local Install

1. Download `chromium.zip` from [Releases](https://github.com/fedebotu/youchat-google-extension/releases).
2. Unzip the file.
3. In Chrome/Edge go to the extensions page (`chrome://extensions` or `edge://extensions`).
4. Enable Developer Mode.
5. Drag the unzipped folder anywhere on the page to import it (do not delete the folder afterwards).

### Install to Firefox

#### Install from Mozilla Add-on Store (Preferred)

 <a href="https://addons.mozilla.org/en-US/firefox/addon/youchat-ai-for-google/"><img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_128x128.png" width="24" /></a>
[Mozilla Add-ons Store Link](https://addons.mozilla.org/en-US/firefox/addon/youchat-ai-for-google/)

#### Local Install

1. Download `firefox.zip` from [Releases](https://github.com/fedebotu/youchat-google-extension/releases).
2. Unzip the file.
3. Go to `about:debugging`, click "This Firefox" on the sidebar.
4. Click "Load Temporary Add-on" button, then select any file in the unzipped folder.

## Build from source

1. Clone the repo
2. Install dependencies with `npm`
3. `npm run build`
4. Load `build/chromium/` or `build/firefox/` directory to your browser

## Troubleshooting

### Answer errors
You may try a few steps to fix the errors:
- Make sure to pass the Cloudflare challenge [here](https://you.com/api/streamingSearch?q=hi&domain=youchat).
- When passing the challenge, remember to reload the page.
- you.com may have implemented a login system; if this is the case you may login [here](https://you.com/api/auth/login).
- If nothing works: you.com sometimes changes their API, in this case you may try to fix the extension yourself (see below) or wait for an update (please report the issue [here](https://github.com/fedebotu/youchat-google-extension/issues)).

### API changes

An API change happens when the request URL or the response format changes. For instance, as of February 2023, an example request is as follows: https://you.com/api/streamingSearch?q=hi&domain=youchat . 
If you.com changes their API, you may try to fix the extension yourself by following these steps:
- Open you.com and go into the chat. You will need to login first.
- Open the developer tools (F12) and go to the Network tab. 
- Submit your query and look for a request to the API.
- Modify it and strip it down to the bare minimum until it works. At this point, you can modify [this line](https://github.com/fedebotu/youchat-google-extension/blob/c7b0cace23deacf613657f83a60d3a5c9ad9b7c2/src/background/chatgpt.ts#L3) to point to your modified request. 

### How to make it work in Brave

![Screenshot](screenshots/brave.png?raw=true)

Disable "Prevent sites from fingerprinting me based on my language preferences" in `brave://settings/shields`

### How to make it work in Opera

![Screenshot](screenshots/opera.png?raw=true)

Enable "Allow access to search page results" in the extension management page

## Credit

This project is heavily based on [wong2/chat-gpt-google-extension](https://github.com/wong2/chat-gpt-google-extension), give it a try - you can even use both YouChat and ChatGPT at the same time!
Also: [ZohaibAhmed/ChatGPT-Google](https://github.com/ZohaibAhmed/ChatGPT-Google)


## Contributing
Feel free to open an issue or pull request if you have any questions or suggestions!