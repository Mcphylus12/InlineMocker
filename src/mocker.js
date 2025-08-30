import mockerFrameContent from './mocker.html?raw';

function createIframe() {
  const iframe = document.createElement('iframe');
  iframe.id = "mocker-iframe-id";
  iframe.srcdoc = mockerFrameContent;
  iframe.style = `
    position: fixed;
    inset: 16px;
    display: none;
    width: calc(100vw - 32px);
    height: calc(100vh - 32px);
    overflow: auto;
    z-index: 100000;
    background: white;
    border: 1px solid black;
    box-shadow: darkslategrey 0 0 50px 25px;
  `;
  document.body.appendChild(iframe);

  return iframe;
}

function createToggleButton(iframe) {
  const button = document.createElement('button');
  button.textContent = 'Toggle request mocker';
  button.style = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 100001;
    background-color: #222;
    border-radius: 4px;
    border-style: none;
    color: #fff;
    cursor: pointer;
    font-family: "Farfetch Basis","Helvetica Neue",Arial,sans-serif;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.5;
    padding: 9px 20px 8px;
    text-align: center;
  `;
  button.onclick = () => {
    iframe.style.display = iframe.style.display === 'none' ? 'block' : 'none';
  };
  document.body.appendChild(button);
}

class IframeFetchProxy {
  static MESSAGE_TIMEOUT = 3000;
  #iframe = null;
  #originalFetch = null;
  #requestCounter = 0;
  #pendingRequests = new Map();

  constructor(iframe) {
    this.#iframe = iframe;
    this.#originalFetch = window.fetch.bind(window);
    window.fetch = this.fetch.bind(this);
    window.addEventListener('message', this.#handleMessage.bind(this));
  }

  #handleMessage(event) {
    const { data } = event;
    if (!data || !this.#pendingRequests.has(data.id)) return;

    const { resolve, reject, originalRequest } = this.#pendingRequests.get(data.id);
    this.#pendingRequests.delete(data.id);

    if (data.error === 'no mock') {
      // Fallback to original fetch
      this.#originalFetch(originalRequest.input, originalRequest.init)
        .then(resolve)
        .catch(reject);
    } else if (data.error) {
      reject(new Error(data.error));
    } else {
      resolve(new Response(data.body, {
        status: data.status,
        statusText: data.statusText,
        headers: new Headers(data.headers)
      }));
    }
  }

  fetch(input, init = {}) {
    if (!this.#iframe) {
      return this.#originalFetch(input, init);
    }

    return new Promise((resolve, reject) => {
      const id = `req-${++this.#requestCounter}`;
      const url = (typeof input === 'string') ? input : input.url;
      const method = (init.method || input.method || 'GET').toUpperCase();
      const headers = Object.fromEntries(new Headers(init.headers || input.headers || {}));
      const body = init.body || (input.body || null);

      const message = { id, url, method, headers, body };

      this.#pendingRequests.set(id, { resolve, reject, originalRequest: { input, init } });

      iframe.contentWindow.postMessage(message, '*');

      setTimeout(() => {
        if (this.#pendingRequests.has(id)) {
          this.#pendingRequests.delete(id);
          this.#originalFetch(input, init).then(resolve).catch(reject);
        }
      }, IframeFetchProxy.MESSAGE_TIMEOUT);
    });
  }
}

const iframe = createIframe();
createToggleButton(iframe);
new IframeFetchProxy(iframe);
