let faqs = [];

async function loadFAQs() {
  try {
    const res = await fetch("faqs.json");
    const data = await res.json();
    faqs = data.faqs.flatMap(c => c.questions);
  } catch (error) {
    console.error("Error loading FAQs:", error);
    appendMessage("⚠️ Sorry, I couldn’t load the FAQs. Please refresh or check your connection.", "bot");
  }
}

function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  input.value = "";

  setTimeout(() => {
    const answer = getAnswer(message);
    appendMessage(answer, "bot");
  }, 500);
}

function appendMessage(text, sender) {
  const chatBox = document.getElementById("chatBox");
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ✅ Improved logic – avoids repeating wrong answers
function getAnswer(userQuestion) {
  userQuestion = userQuestion.toLowerCase();

  let bestMatch = null;
  let highestScore = 0;

  faqs.forEach(faq => {
    const question = faq.question.toLowerCase();
    let score = similarityScore(userQuestion, question);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    }
  });

  if (highestScore > 0.4 && bestMatch) {
    return bestMatch.answer;
  }

  return "🤔 I’m not sure I understand that. Could you rephrase or ask something else about our careers?";
}

// ✅ Basic similarity calculation
function similarityScore(a, b) {
  const wordsA = a.split(" ");
  const wordsB = b.split(" ");
  const matches = wordsA.filter(word => wordsB.includes(word));
  return matches.length / Math.max(wordsA.length, wordsB.length);
}

// ✅ Load FAQs when chatbot starts
loadFAQs();
