
let threadId = null;

const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const chat = document.getElementById("chat");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  appendMessage("user", message);
  input.value = "";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, threadId })
    });

    const data = await response.json();

    if (!response.ok) {
      appendMessage("bot", "Klaida: " + (data?.error || "Nepavyko gauti atsakymo."));
      return;
    }

    appendMessage("bot", data.reply || "Atsakymas tuščias.");
    if (data.threadId) threadId = data.threadId;
  } catch (err) {
    appendMessage("bot", "Nepavyko prisijungti prie asistento.");
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.innerHTML = text.replace(/\n/g, "<br>");
  chat?.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function resetChat() {
  chat.innerHTML = "";
  threadId = null;
}
