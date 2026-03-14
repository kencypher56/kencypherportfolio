// Chatbot UI logic
const toggleBtn = document.getElementById('chatbot-toggle');
const panel = document.getElementById('chatbot-panel');
const messagesDiv = document.getElementById('chatbot-messages');
const input = document.getElementById('chatbot-input');

// Initial message
const initialMessage = "What do you want to know about Waleed Amjad?";
let isOpen = false;

// On hover, show button highlight (already visible by default, but we add effect)
toggleBtn.addEventListener('mouseenter', () => {
    toggleBtn.classList.add('ring-4', 'ring-blue-300');
});
toggleBtn.addEventListener('mouseleave', () => {
    toggleBtn.classList.remove('ring-4', 'ring-blue-300');
});

// Toggle panel on click
toggleBtn.addEventListener('click', () => {
    if (isOpen) {
        panel.classList.add('hidden');
        isOpen = false;
    } else {
        panel.classList.remove('hidden');
        isOpen = true;
        // Add initial message if no messages yet
        if (messagesDiv.children.length === 0) {
            addMessage(initialMessage, 'bot');
        }
    }
});

// Add message to chat
function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('mb-2', sender === 'bot' ? 'text-blue-400' : 'text-green-400');
    msgDiv.innerHTML = `<span class="font-semibold">${sender === 'bot' ? '🤖' : '👤'}:</span> ${text}`;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Handle input (Enter key)
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && input.value.trim() !== '') {
        const question = input.value.trim();
        addMessage(question, 'user');
        input.value = '';

        // Simple bot response (placeholder until RAG integration)
        setTimeout(() => {
            addMessage("Thanks for your question! The AI assistant will be integrated soon to provide detailed answers from Waleed's CV.", 'bot');
        }, 500);
    }
});

// Close panel when clicking outside (optional)
document.addEventListener('click', (e) => {
    if (!toggleBtn.contains(e.target) && !panel.contains(e.target) && isOpen) {
        panel.classList.add('hidden');
        isOpen = false;
    }
});
