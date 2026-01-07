const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const DEFAULT_API_URL = "https://atlas-ai-worker.luuk-de-vries.workers.dev/chat";
const queryApiParam = new URLSearchParams(window.location.search).get("api");
const queryApiUrl = queryApiParam ? decodeURIComponent(queryApiParam) : "";
const chatContainer = document.querySelector(".assistant-frame");
const dataApiUrl = chatContainer ? chatContainer.dataset.apiUrl : "";
const apiUrl = queryApiUrl || dataApiUrl || DEFAULT_API_URL;

const appendMessage = (role, text, sources = []) => {
  const message = document.createElement("div");
  message.className = `message ${role}`;
  const content = document.createElement("div");
  content.textContent = text;
  message.appendChild(content);

  if (sources.length > 0) {
    const sourcesBlock = document.createElement("div");
    sourcesBlock.className = "sources";
    sourcesBlock.textContent = `Sources (Atlas): ${sources.join(", ")}`;
    message.appendChild(sourcesBlock);
  }

  chatLog.appendChild(message);
  chatLog.scrollTop = chatLog.scrollHeight;
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

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error("Unable to reach the assistant.");
    }

    const data = await response.json();
    appendMessage("assistant", data.answer || "No response received.", data.used_sources || []);
  } catch (error) {
    appendMessage(
      "assistant",
      "Sorry, something went wrong while contacting the Atlas assistant. Please confirm data-api-url points to your Worker /chat endpoint."
    );
  } finally {
    setLoading(false);
  }
});

appendMessage(
  "assistant",
  "Hello! Ask me about EU migration policy, national approaches, or EU frameworks like the CEAS or the Pact on Migration and Asylum."
);
