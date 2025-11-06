let faqsData = [];
let darkMode = false, theme = "Blue Gradient";

const chatWrapper = document.querySelector(".chat-wrapper");
const chatWidget = document.querySelector(".chat-widget");
const chatLauncher = document.querySelector("#chat-launcher");
const chatMessages = document.querySelector(".chat-messages");
const sendBtn = document.querySelector("#send-btn");
const clearBtn = document.querySelector("#clear-btn");
const userInput = document.querySelector("#user-input");
const themeSelect = document.querySelector("#theme-select");
const colorPicker = document.querySelector("#custom-color");
const darkToggle = document.querySelector("#dark-toggle");
const menuBtn = document.querySelector("#menu-btn");
const menuDropdown = document.querySelector("#menu-dropdown");
const fullscreenBtn = document.querySelector("#fullscreen-btn");
const exitFullscreenBtn = document.querySelector("#exit-fullscreen-btn");
const suggestionsBox = document.querySelector(".suggestion-list");

/* ========== Load FAQ Data ========== */
fetch("faqs.json")
  .then(r => r.json())
  .then(d => faqsData = d)
  .catch(() => appendMessage("bot", "⚠️ Unable to load FAQs."));

/* ========== Messaging Core ========== */
function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  const t = new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
  msg.innerHTML = `<p>${text}</p><span class="meta">${t}</span>`;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function cleanText(s) { return s.toLowerCase().replace(/[^a-z0-9\s]/g, ""); }

function similarity(a, b) {
  const A = cleanText(a).split(/\s+/), B = cleanText(b).split(/\s+/);
  const inter = A.filter(x => B.includes(x));
  return inter.length / Math.max(A.length, B.length);
}

/* Intelligent matcher with greetings */
function findAnswer(msg) {
  const text = cleanText(msg);
  const greetings = ["hi","hello","hey","good morning","good evening","good afternoon"];
  if (greetings.some(g => text.includes(g)))
    return "👋 Hello there! How can I assist you today? You can ask about jobs, application status, or training.";

  let best = null, bestScore = 0;
  faqsData.forEach(f => {
    const score = similarity(text, f.question + " " + f.keywords.join(" "));
    if (score > bestScore) { best = f; bestScore = score; }
  });
  if (bestScore > 0.15) return best.answer;
  const fallback = faqsData.find(f => f.question.toLowerCase().includes(text.split(" ")[0]));
  if (fallback) return fallback.answer;
  return "🤔 I'm not sure about that. Try asking about jobs, qualifications, or training.";
}

/* Typing animation */
function showTyping() {
  const el = document.createElement("div");
  el.classList.add("message","bot","typing");
  el.textContent = "...";
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return el;
}

/* Handle user send */
function handleUserInput() {
  const msg = userInput.value.trim();
  if (!msg) return;
  appendMessage("user", msg);
  userInput.value = "";
  hideSuggestionDropdown();
  const typing = showTyping();
  setTimeout(() => {
    typing.remove();
    appendMessage("bot", findAnswer(msg));
  }, 700);
}

function clearChat() {
  chatMessages.innerHTML = "";
  appendMessage("bot", "🧹 Chat cleared. How can I help you again?");
}

/* ========== Live Suggestion Dropdown ========== */
let suggestionDropdown;
function createSuggestionDropdown() {
  suggestionDropdown = document.createElement("div");
  suggestionDropdown.className = "live-suggestions";
  document.querySelector(".chat-footer").appendChild(suggestionDropdown);
}
function showSuggestionDropdown(items) {
  if (!suggestionDropdown) createSuggestionDropdown();
  suggestionDropdown.innerHTML = "";
  items.forEach(item => {
    const b = document.createElement("div");
    b.className = "live-suggestion";
    b.textContent = item.question;
    b.onclick = () => { userInput.value = item.question; hideSuggestionDropdown(); handleUserInput(); };
    suggestionDropdown.appendChild(b);
  });
  suggestionDropdown.style.display = items.length ? "block" : "none";
}
function hideSuggestionDropdown() {
  if (suggestionDropdown) suggestionDropdown.style.display = "none";
}

/* Typing listener for both in-line and dropdown suggestions */
userInput.addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  suggestionsBox.innerHTML = "";
  if (!q) { hideSuggestionDropdown(); return; }

  const matches = faqsData
    .filter(f => f.question.toLowerCase().includes(q))
    .slice(0,5);

  // top bar chips
  matches.forEach(f => {
    const chip = document.createElement("button");
    chip.className = "suggestion";
    chip.textContent = f.question;
    chip.onclick = () => { userInput.value = f.question; suggestionsBox.innerHTML=""; handleUserInput(); };
    suggestionsBox.appendChild(chip);
  });

  // bottom dropdown
  showSuggestionDropdown(matches);
});

/* ========== Themes, dark mode, etc. ========== */
function applyTheme(){
  const tMap={
    "Blue Gradient":["#007BFF","#00C6FF"],
    "Purple Gradient":["#7b61ff","#c56fff"],
    "Mint Gradient":["#00C9A7","#92FE9D"],
    "Sunset Gradient":["#ff9966","#ff5e62"]
  };
  const [c1,c2]=tMap[theme]||tMap["Blue Gradient"];
  document.documentElement.style.setProperty("--primary-1",c1);
  document.documentElement.style.setProperty("--primary-2",c2);
}
themeSelect.addEventListener("change",e=>{theme=e.target.value;applyTheme();});
colorPicker.addEventListener("input",e=>{
  const c=e.target.value;
  document.documentElement.style.setProperty("--primary-1",c);
  document.documentElement.style.setProperty("--primary-2",c);
});
darkToggle.addEventListener("change",e=>{
  darkMode=e.target.checked;
  document.documentElement.classList.toggle("dark",darkMode);
});

/* Menu + fullscreen */
menuBtn.addEventListener("click",e=>{
  e.stopPropagation();
  menuDropdown.classList.toggle("hidden");
});
document.addEventListener("click",()=>menuDropdown.classList.add("hidden"));
fullscreenBtn.addEventListener("click",()=>{
  chatWidget.classList.add("fullscreen");
  fullscreenBtn.classList.add("hidden");
  exitFullscreenBtn.classList.remove("hidden");
});
exitFullscreenBtn.addEventListener("click",()=>{
  chatWidget.classList.remove("fullscreen");
  fullscreenBtn.classList.remove("hidden");
  exitFullscreenBtn.classList.add("hidden");
});

/* Toggle open/close */
chatLauncher.addEventListener("click",()=>chatWrapper.classList.toggle("minimized"));
sendBtn.addEventListener("click",handleUserInput);
clearBtn.addEventListener("click",clearChat);
userInput.addEventListener("keypress",e=>{if(e.key==="Enter")handleUserInput();});

/* Startup */
window.addEventListener("load",()=>{
  applyTheme();
  appendMessage("bot","👋 Hello! I am your NextGen HR Assistant. How can I help you today?");
});
