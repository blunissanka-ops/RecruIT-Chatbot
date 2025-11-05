const chatBox = document.querySelector('.chat-box');
const userInput = document.querySelector('#user-input');
const sendBtn = document.querySelector('#send-btn');

let faqsData = [];

// Load FAQs from JSON
fetch('faqs.json')
  .then(response => response.json())
  .then(data => {
    // Flatten all questions into a single array
    faqsData = data.faqs.flatMap(cat => cat.questions);
  })
  .catch(error => console.error('Error loading FAQs:', error));

// Append message to chat
function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.innerHTML = `<p>${text}</p>`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Handle sending message
sendBtn.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleUserInput();
});

function handleUserInput() {
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  userInput.value = '';

  const reply = findAnswer(userMessage);
  setTimeout(() => appendMessage('bot', reply), 400);
}

// Function to clean text for comparison
function cleanText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gi, '') // remove punctuation
    .trim();
}

// Find best matching answer
function findAnswer(userMessage) {
  const cleanedMessage = cleanText(userMessage);

  // Use a scoring system to find the best match
  let bestMatch = null;
  let highestScore = 0;

  faqsData.forEach(faq => {
    const cleanedQuestion = cleanText(faq.question);
    const words = cleanedMessage.split(' ');

    // Count how many words match
    let score = 0;
    words.forEach(word => {
      if (cleanedQuestion.includes(word)) score++;
    });

    // Update best match if score is higher
    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    }
  });

  // If a good match is found, return the answer
  if (bestMatch && highestScore > 0) {
    return bestMatch.answer;
  }

  // Fallback response
  return "Hello there! 👋 How can I assist you with NextGen Systems’ careers or HR policies today?";
}
