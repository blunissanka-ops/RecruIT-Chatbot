const chatBox = document.querySelector('.chat-box');
const userInput = document.querySelector('#user-input');
const sendBtn = document.querySelector('#send-btn');
const clearBtn = document.querySelector('#clear-btn');
const typingIndicator = document.querySelector('#typing-indicator'); 

// Autocomplete elements
const autocompleteContainer = document.querySelector('.autocomplete-container');
const suggestionsList = document.querySelector('#suggestions-list');

// Menu elements
const menuBtn = document.querySelector('#menu-btn');
const optionsDropdown = document.querySelector('#options-dropdown');
const themeOptions = document.querySelectorAll('.theme-option');
const toggleSizeBtn = document.querySelector('#toggle-size-btn');
const chatContainer = document.querySelector('.chat-container');

let faqsData = [];
let isFaqsLoaded = false;
const SCORE_THRESHOLD = 3; 

// --- Utility Functions ---

function cleanText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.innerHTML = `<p>${text}</p>`;
  
  // Insert the new message BEFORE the typing indicator
  if (chatBox && typingIndicator) {
      chatBox.insertBefore(msg, typingIndicator); 
      chatBox.scrollTop = chatBox.scrollHeight;
  }
}

function showTypingIndicator(show) {
  if (typingIndicator && chatBox) {
    typingIndicator.style.display = show ? 'flex' : 'none';
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}


// --- Chatbot Core Logic & Initialization ---

appendMessage('bot', '🤖 Initializing HR Chatbot. Please wait, loading knowledge base...');
if (sendBtn) sendBtn.disabled = true;

// CRITICAL: Ensure faqs.json is in the same folder!
fetch('faqs.json')
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}. Check if faqs.json file exists and is named correctly.`);
    return res.json();
  })
  .then(data => {
    faqsData = data.faqs.flatMap(cat => cat.questions);
    isFaqsLoaded = true;
    if (sendBtn) sendBtn.disabled = false;

    // Remove loading message
    const initialMessage = chatBox.querySelector('.bot p');
    if (initialMessage && initialMessage.textContent.includes('Initializing HR Chatbot')) {
      initialMessage.closest('.message').remove();
    }

    applyTheme('default'); 
    appendMessage('bot', 'Hello! I am your NextGen HR Assistant. How can I help you today?');
  })
  .catch(err => {
    console.error('CRITICAL ERROR loading FAQs:', err);
    appendMessage('bot', `CRITICAL ERROR: Could not load FAQ data. Chat is disabled. (${err.message})`);
    if (sendBtn) sendBtn.disabled = true; 
  });

function findAnswer(userMessage) {
  if (!isFaqsLoaded) return 'I am still loading the knowledge base.';
  // ... (full findAnswer logic is here) ...
  const cleanedMessage = cleanText(userMessage);
  const userWords = cleanedMessage.split(/\s+/).filter(word => word.length > 2);
  const exactMatch = faqsData.find(faq => cleanText(faq.question) === cleanedMessage);
  if (exactMatch) return exactMatch.answer;
  let bestMatch = null;
  let highestScore = 0;
  faqsData.forEach(faq => {
    let score = 0;
    const faqKeywords = new Set(faq.keywords);
    userWords.forEach(word => {
      if (faqKeywords.has(word)) { score++; }
    });
    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    } else if (score === highestScore && score > 0) {
      if (bestMatch && faq.question.length < bestMatch.question.length) { bestMatch = faq; } else if (!bestMatch) { bestMatch = faq; }
    }
  });
  const isSingleWordQuery = userWords.length === 1;
  if (bestMatch && (isSingleWordQuery && highestScore >= 1 || highestScore >= SCORE_THRESHOLD)) {
    return bestMatch.answer;
  }
  return "I'm sorry, I couldn't find a direct answer to your question. Please try rephrasing or ask about common topics like 'jobs', 'application', 'benefits', or 'training'.";
}

function handleGreetings(userMessage) {
  const cleanedMessage = cleanText(userMessage);
  const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'greetings'];
  const goodbye = ['bye', 'goodbye', 'see ya', 'cya', 'later'];
  const acknowledgement = ['thank you', 'thanks', 'cheers'];
  if (greetings.some(g => cleanedMessage === g || cleanedMessage.includes(g))) { return 'Hello there! How can I assist you with HR matters today?'; }
  if (goodbye.some(g => cleanedMessage === g || cleanedMessage.includes(g))) { return 'Goodbye! Feel free to return if you have any other HR questions.'; }
  if (acknowledgement.some(a => cleanedMessage.includes(a))) { return 'You are very welcome! Is there anything else I can help you with?'; }
  if (cleanedMessage.includes('how are you')) { return "I'm a bot, but I'm operating perfectly! How can I help you with your HR query?"; }
  return null;
}


// --- Autocomplete Functions (FIXED) ---

function filterSuggestions(query) {
  if (!query || !isFaqsLoaded) return [];
  const cleanedQuery = cleanText(query);
  const matchedQuestions = faqsData.filter(faq => cleanText(faq.question).includes(cleanedQuery));
  matchedQuestions.sort((a, b) => cleanText(a.question).indexOf(cleanedQuery) - cleanText(b.question).indexOf(cleanedQuery));
  return matchedQuestions.slice(0, 5).map(faq => faq.question);
}

function renderSuggestions(suggestions) {
  if (!suggestionsList) return; 
  suggestionsList.innerHTML = '';
  if (suggestions.length === 0) {
    suggestionsList.style.display = 'none';
    return;
  }
  suggestions.forEach(question => {
    const item = document.createElement('div');
    item.classList.add('suggestion-item');
    item.textContent = question;
    item.addEventListener('click', () => {
      userInput.value = question;
      suggestionsList.style.display = 'none';
      userInput.focus();
      handleUserInput(); 
    });
    suggestionsList.appendChild(item);
  });
  suggestionsList.style.display = 'block';
}

function handleInputForSuggestions() {
  const query = userInput.value.trim();
  if (query.length === 0) { 
    if (suggestionsList) suggestionsList.style.display = 'none';
    return;
  }
  const suggestions = filterSuggestions(query);
  renderSuggestions(suggestions);
}


// --- Menu & Theme Logic (FIXED) ---

function applyTheme(newTheme) {
    if (!chatContainer) return;
    chatContainer.classList.remove('theme-default', 'theme-sunset', 'theme-emerald');
    chatContainer.classList.add(`theme-${newTheme}`);
    themeOptions.forEach(btn => {
        btn.classList.remove('active-theme');
        if (btn.dataset.theme === newTheme) {
            btn.classList.add('active-theme');
        }
    });
}

function toggleFullscreen() {
    if (!chatContainer || !toggleSizeBtn) return;
    chatContainer.classList.toggle('fullscreen');
    const isFullscreen = chatContainer.classList.contains('fullscreen');
    const icon = toggleSizeBtn.querySelector('i');
    const text = toggleSizeBtn.querySelector('span');
    if (isFullscreen) {
        icon.className = 'fas fa-compress-alt'; 
        text.textContent = 'Minimize Chat';
    } else {
        icon.className = 'fas fa-expand-alt'; 
        text.textContent = 'Toggle Fullscreen';
    }
}


// --- Event Listeners ---

// 3-dot Menu Toggle
if (menuBtn && optionsDropdown) {
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        optionsDropdown.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
        if (optionsDropdown.classList.contains('open') && !menuBtn.contains(e.target) && !optionsDropdown.contains(e.target)) {
            optionsDropdown.classList.remove('open');
        }
    });
}

// Theme Change Handlers
themeOptions.forEach(button => {
    button.addEventListener('click', (e) => {
        applyTheme(e.target.dataset.theme);
        if (optionsDropdown) optionsDropdown.classList.remove('open'); 
    });
});

// Fullscreen Toggle Handler
if (toggleSizeBtn) {
    toggleSizeBtn.addEventListener('click', () => {
        toggleFullscreen();
        if (optionsDropdown) optionsDropdown.classList.remove('open'); 
    });
}


// Chat Input Handlers
if (sendBtn) sendBtn.addEventListener('click', handleUserInput);
if (userInput) {
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleUserInput();
    });
    userInput.addEventListener('input', handleInputForSuggestions);
}

// Close suggestions on external click
document.addEventListener('click', (e) => {
    if (suggestionsList && autocompleteContainer && !autocompleteContainer.contains(e.target) && suggestionsList.style.display === 'block') {
        suggestionsList.style.display = 'none';
    }
});


// Clear Chat Handler (FIXED to not re-create the typing indicator element)
if (clearBtn) clearBtn.addEventListener('click', () => {
  // Remove all chat messages, but keep the typing indicator
  Array.from(chatBox.children).forEach(child => {
      if (child.id !== 'typing-indicator') { child.remove(); }
  });
  appendMessage('bot', 'Hello! I am your NextGen HR Assistant. How can I help you today?');
  if (suggestionsList) suggestionsList.style.display = 'none'; 
});


function handleUserInput() {
  const userMessage = userInput.value.trim();
  if (!userMessage || !isFaqsLoaded) return; 

  appendMessage('user', userMessage);
  userInput.value = '';
  if (suggestionsList) suggestionsList.style.display = 'none'; 

  let reply = handleGreetings(userMessage);
  if (reply === null) { reply = findAnswer(userMessage); }

  showTypingIndicator(true);
  if (sendBtn) sendBtn.disabled = true;

  setTimeout(() => {
    showTypingIndicator(false);
    if (sendBtn) sendBtn.disabled = false;
    appendMessage('bot', reply);
  }, 800); 
}
