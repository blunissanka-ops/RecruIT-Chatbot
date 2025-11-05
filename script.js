async function loadFaqs() {
  try {
    const response = await fetch("faqs.json?nocache=" + new Date().getTime());
    if (!response.ok) throw new Error("Failed to load FAQs");
    const data = await response.json();
    faqs = data.faqs || {};
    console.log("✅ FAQs loaded:", faqs);
  } catch (error) {
    console.error("❌ Error loading FAQs:", error);
    appendMessage("bot", "Hello! I'm RecruIT 😊 — I couldn’t load FAQs right now, but I can still chat!");
  }
  showGreeting();
  loadChatHistory();
}
