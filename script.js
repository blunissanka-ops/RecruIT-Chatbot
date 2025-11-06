/* NextGen HR Assistant - Final JS
   - Semantic matching with weighted vectors
   - Live suggestions (top 5)
   - Themes + custom color + dark mode
   - Minimize / maximize + launcher
   - Clear chat fully resets messages (but keeps theme/settings)
   - Chat persistence in localStorage
*/

/* ---------- DOM ---------- */
const launcherBtn = document.getElementById('chat-launcher');
const chatWrapper = document.getElementById('chat-wrapper');
const chatWidget = document.getElementById('chat-widget');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const clearBtn = document.getElementById('clear-btn');
const suggestionsEl = document.getElementById('suggestions');
const themeSelect = document.getElementById('theme-select');
const customColor = document.getElementById('custom-color');
const darkToggle = document.getElementById('dark-toggle');
const minimizeBtn = document.getElementById('minimize-btn');
const closeBtn = document.getElementById('close-btn');
const saveNote = document.getElementById('save-note');

let faqs = [];
let faqVectors = [];
let loaded = false;
let typingTimer = null;

/* ---------- Utilities ---------- */
const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const clean = txt => (txt || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const tokenize = txt => {
  const t = clean(txt);
  if (!t) return [];
  const words = t.split(' ').filter(Boolean);
  const bigrams = [];
  for (let i = 0; i < words.length - 1; i++) bigrams.push(words[i] + ' ' + words[i + 1]);
  return words.concat(bigrams);
};

/* Build FAQ vector (weights: question 0.6, keywords 0.9, answer 0.25) */
function buildFaqVector(faq) {
  const vec = {};
  const qTokens = tokenize(faq.question);
  const kTokens = (faq.keywords || []).map(k => clean(k)).flatMap(s => s.split(/\s+/));
  const aTokens = tokenize(faq.answer);

  qTokens.forEach(t => vec[t] = (vec[t] || 0) + 0.6);
  kTokens.forEach(t => vec[t] = (vec[t] || 0) + 0.9);
  aTokens.forEach(t => vec[t] = (vec[t] || 0) + 0.25);
  return vec;
}

/* Cosine similarity */
function cosineSim(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (const k in a) magA += a[k] * a[k];
  for (const k in b) magB += b[k] * b[k];
  for (const k in a) if (b[k]) dot += a[k] * b[k];
  magA = Math.sqrt(magA); magB = Math.sqrt(magB);
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

/* Prepare vectors for all FAQs */
function prepareFaqVectors() {
  faqVectors = faqs.map(f => ({ faq: f, vec: buildFaqVector(f) }));
}

/* Build query vector (tokens weight 1.0) */
function buildQueryVector(text) {
  const tokens = tokenize(text);
  const vec = {};
  tokens.forEach(t => vec[t] = (vec[t] || 0) + 1.0);
  return vec;
}

/* Find best match (returns best faq and score) */
function findBestMatch(text) {
  const qVec = buildQueryVector(text);
  let best = null, bestScore = 0;
  for (const item of faqVectors) {
    const score = cosineSim(qVec, item.vec);
    if (score > bestScore) { bestScore = score; best = item.faq; }
  }
  return { best, score: bestScore };
}

/* Top K suggestions while typing */
function getTopKSuggestions(text, k = 5) {
  if (!text || !text.trim()) return [];
  const qVec = buildQueryVector(text);
  const scored = faqVectors.map(item => ({ faq: item.faq, score: cosineSim(qVec, item.vec) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).filter(s => s.score > 0).map(s => ({ question: s.faq.question, score: s.score, faq: s.faq }));
}

/* ---------- UI Helpers ---------- */
function appendMessage(sender, text, meta = '') {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${sender}`;
  const p =
