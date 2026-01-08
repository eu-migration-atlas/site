const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const DEFAULT_API_URL = "https://atlas-ai-worker.luuk-de-vries.workers.dev/chat";
const queryApiParam = new URLSearchParams(window.location.search).get("api");
const queryApiUrl = queryApiParam ? decodeURIComponent(queryApiParam) : "";
const chatContainer = document.querySelector(".assistant-frame[data-api-url], .chat-card[data-api-url]");
const dataApiUrl = chatContainer ? chatContainer.dataset.apiUrl : "";
const apiUrl = queryApiUrl || dataApiUrl || DEFAULT_API_URL;
console.info("Atlas AI endpoint:", apiUrl);

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderAssistantContent = (markdownText) => {
  const safeText = markdownText || "";
  if (typeof marked !== "undefined" && typeof DOMPurify !== "undefined") {
    const html = marked.parse(safeText, { mangle: false, headerIds: false });
    return DOMPurify.sanitize(html);
  }
  return `<p>${escapeHtml(safeText)}</p>`;
};

const updateAssistantLinks = (container) => {
  const links = container.querySelectorAll("a");
  links.forEach((link) => {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });
};

const appendMessage = (role, text, sources = [], options = {}) => {
  const message = document.createElement("div");
  message.className = `message ${role}`;
  const content = document.createElement("div");
  content.className = "message-content";
  if (options.allowHtml) {
    content.innerHTML = text;
    if (role === "assistant") {
      updateAssistantLinks(content);
    }
  } else {
    content.textContent = text;
  }
  message.appendChild(content);

  if (sources.length > 0) {
    const sourcesBlock = document.createElement("div");
    sourcesBlock.className = "sources";
    sourcesBlock.textContent = `Sources (Atlas): ${sources.join(", ")}`;
    message.appendChild(sourcesBlock);
  }

  chatLog.appendChild(message);
  chatLog.scrollTop = chatLog.scrollHeight;
  return message;
};

const setMessageContent = (message, text, sources = []) => {
  const content = message.querySelector(".message-content");
  if (content) {
    content.innerHTML = renderAssistantContent(text);
    updateAssistantLinks(content);
  }
  const existingSources = message.querySelector(".sources");
  if (existingSources) {
    existingSources.remove();
  }
  if (sources.length > 0) {
    const sourcesBlock = document.createElement("div");
    sourcesBlock.className = "sources";
    sourcesBlock.textContent = `Sources (Atlas): ${sources.join(", ")}`;
    message.appendChild(sourcesBlock);
  }
  chatLog.scrollTop = chatLog.scrollHeight;
};

const createTypingMessage = () => {
  return appendMessage(
    "assistant",
    '<span class="typing-dots" aria-label="Assistant is typing"><span></span><span></span><span></span></span>',
    [],
    { allowHtml: true }
  );
};

const setLoading = (isLoading) => {
  chatInput.disabled = isLoading;
  chatForm.querySelector("button").disabled = isLoading;
};

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) {
    return;
  }
  if (!apiUrl) {
    appendMessage(
      "assistant",
      "The assistant endpoint is not configured. Set data-api-url on the page to your Worker /chat URL or pass ?api=https://your-worker/chat in the URL."
    );
    return;
  }
  appendMessage("user", message);
  chatInput.value = "";
  setLoading(true);
  const typingMessage = createTypingMessage();

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      console.warn(`Atlas AI request failed with status ${response.status}`);
    }

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Atlas AI response parsing failed:", parseError);
      setMessageContent(typingMessage, "No response received. Try again.");
      return;
    }

    if (!response.ok) {
      setMessageContent(
        typingMessage,
        "No response received. Try again."
      );
      return;
    }

    const reply = data.reply || data.response || data.message;
    setMessageContent(typingMessage, reply || "No response received. Try again.", data.used_sources || []);
  } catch (error) {
    console.error("Atlas AI request failed:", error);
    setMessageContent(typingMessage, "No response received. Try again.");
  } finally {
    setLoading(false);
  }
});

appendMessage(
  "assistant",
  renderAssistantContent(
    "Hello! Ask me about EU migration policy, national approaches, or EU frameworks like the CEAS or the Pact on Migration and Asylum."
  ),
  [],
  { allowHtml: true }
);
