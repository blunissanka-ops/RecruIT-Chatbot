const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const typingIndicator = document.getElementById("typing-indicator");

let faqs = {};
let greetings = [];

// Load FAQ data from JSON
fetch("faqs.json")
  .then(res => res.json())
  .then(data => {
    faqs = data.faqs;
    greetings = data.greetings;
    showGreeting();
    loadChatHistory();
  });

// Display greeting message randomly
function showGreeting() {
  const greet = greetings[Math.floor(Math.random() * greetings.length)];
  appendMessage("bot", greet);
}

// Append message to chat
function appendMessage(sender, text) {
  const message = document.createElement("div");
  message.classList.add("message", sender === "user" ? "user-message" : "bot-message");
  message.textContent = text;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
  saveChatHistory();
}

// Save chat history
function saveChatHistory() {
  localStorage.setItem("recruitChat", chatBox.innerHTML);
}

// Load chat history
function loadChatHistory() {
  const saved = localStorage.getItem("recruitChat");
  if (saved) chatBox.innerHTML = saved;
}

// Typing indicator
function showTyping() {
  typingIndicator.classList.remove("hidden");
  setTimeout(() => typingIndicator.classList.add("hidden"), 1000);
}

// Send button click
sendBtn.addEventListener("click", () => {
  const text = userInput.value.trim();
  if (text === "") return;
  appendMessage("user", text);
  userInput.value = "";
  showTyping();
  setTimeout(() => botReply(text), 1000);
});

// Handle Enter key
userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendBtn.click();
});

// Bot reply logic
function botReply(input) {
  const lowerInput = input.toLowerCase();
  let response = "Sorry, I’m not sure about that. Please visit our Careers Page for more details.";

  for (const key in faqs) {
    if (lowerInput.includes(key)) {
      response = faqs[key];
      break;
    }
  }

  appendMessage("bot", response);
}
