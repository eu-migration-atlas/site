const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const apiUrl = document.body.dataset.apiUrl || "/chat";

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
    appendMessage("assistant", "Sorry, something went wrong while contacting the Atlas assistant.");
  } finally {
    setLoading(false);
  }
});

appendMessage(
  "assistant",
  "Hello! Ask me about EU migration policy, national approaches, or EU frameworks like the CEAS or the Pact on Migration and Asylum."
);
