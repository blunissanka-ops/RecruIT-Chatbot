const faqData = [
    // Structure: {keywords: "key, words, separated, by, comma", response: "The answer..."}
    { keywords: "apply, job, how", response: "You can apply directly through our **Careers Page** by selecting the role you’re interested in and clicking 'Apply Now'. Once you submit your CV and details, our team will review it." },
    { keywords: "more, multiple, position", response: "Absolutely! If you feel you’re suitable for multiple roles, you’re welcome to apply for **more than one**. Just make sure each application matches your skills and experience." },
    { keywords: "documents, submit, upload", response: "You will need to upload your **updated CV**. We also encourage you to include a cover letter and links to your portfolio or LinkedIn." },
    // ... (Add all your FAQ data here following the structure above) ...
    { keywords: "status, current, what is the current status", response: "You can check your application status by logging into your **candidate profile on our careers portal**. Select 'My Applications' to view its status." },
    { keywords: "hello, hi, hey", response: "Hello! I'm **RecruIT**, your AI recruitment assistant at NextGen Systems. How can I help you with your job application or qualifications?" },
    { keywords: "age, limit, experience", response: "No, there isn’t an exact **age requirement**. Some positions do require a certain period of experience (e.g., 3-5 years for senior roles)." }
];

function getBotResponse(userMessage) {
    const cleanedMsg = userMessage.toLowerCase().trim();

    // Check for keyword matches
    for (const qa of faqData) {
        const keywords = qa.keywords.split(',').map(k => k.trim());
        for (const keyword of keywords) {
            if (cleanedMsg.includes(keyword) && keyword.length > 2) {
                return qa.response;
            }
        }
    }

    // Default response if no match is found
    return "I'm sorry, I can only answer questions related to **job applications, qualifications, or interview status** at NextGen Systems. Please try rephrasing your question or check the Careers Page for more details.";
}

// --- (UI Logic for chat interface below - see the full response for this section) ---
const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

function displayMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.innerHTML = message; // Use innerHTML to render bold tags (**)
    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight; // Scroll to bottom
}

function sendMessage() {
    const userText = userInput.value.trim();
    if (userText === "") return;

    displayMessage(userText, 'user');
    userInput.value = '';

    // Get and display bot response after a short delay
    setTimeout(() => {
        const botResponse = getBotResponse(userText);
        displayMessage(botResponse, 'bot');
    }, 500);
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Initial welcome message
window.onload = () => {
    displayMessage("Hello! I'm **RecruIT**, your AI recruitment assistant at NextGen Systems. How can I help you?", 'bot');
};
