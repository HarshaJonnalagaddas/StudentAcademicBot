// Chat functionality for AcademicBot
class ChatInterface {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.chatForm = document.getElementById('chatForm');
        this.sendButton = document.getElementById('sendButton');
        this.quickSuggestions = document.getElementById('quickSuggestions');
        
        this.isTyping = false;
        this.messageHistory = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showWelcomeMessage();
        this.checkForPrefilledMessage();
    }

    setupEventListeners() {
        this.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSendMessage();
        });

        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });

        this.messageInput.addEventListener('focus', () => {
            this.hideWelcomeMessage();
        });
        this.setupQuickSuggestions();

        this.messageInput.addEventListener('input', () => {
            this.adjustInputHeight();
        });
    }

    setupQuickSuggestions() {
        const suggestionButtons = document.querySelectorAll('.suggestion-btn');
        suggestionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const message = button.getAttribute('data-message');
                this.messageInput.value = message;
                this.handleSendMessage();
            });
        });
    }

    showWelcomeMessage() {
        const welcomeMsg = document.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.style.display = 'block';
        }
    }

    hideWelcomeMessage() {
        const welcomeMsg = document.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.style.display = 'none';
        }
    }

    adjustInputHeight() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 100) + 'px';
    }

    async handleSendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message || this.isTyping) {
            return;
        }

    
        this.addMessage(message, 'user');
        

        this.messageInput.value = '';
        this.adjustInputHeight();
        
 
        this.showTypingIndicator();
        
        try {
  
            const response = await this.sendMessageToBot(message);
            
            this.hideTypingIndicator();
            
            if (response.success) {
                this.addMessage(response.data.response, 'bot');
                this.updateAiStatusIndicator(response.data.source);
                if (response.data.suggestions && response.data.suggestions.length > 0) {
                    this.updateQuickSuggestions(response.data.suggestions);
                }
            } else {
                this.addMessage('I apologize, but I encountered an error processing your message. Please try again.', 'bot');
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.hideTypingIndicator();
            this.addMessage('I\'m experiencing technical difficulties. Please try again in a moment.', 'bot');
        }
        this.scrollToBottom();
    }

    async sendMessageToBot(message) {
        const timestamp = new Date().toISOString();
        
        return await AcademicBot.post('/api/chat', {
            message: message,
            timestamp: timestamp,
            history: this.messageHistory.slice(-5) // Send last 5 messages for context
        });
    }

    addMessage(content, sender, timestamp = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = this.formatMessageContent(content, sender);
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = timestamp || this.getCurrentTime();
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        
        // Hide welcome message when first real message is added
        this.hideWelcomeMessage();
        
        this.chatMessages.appendChild(messageDiv);
        
        
        this.messageHistory.push({
            content: content,
            sender: sender,
            timestamp: timestamp || new Date().toISOString()
        });
        

        this.scrollToBottom();
        
        messageDiv.classList.add('slide-up');
    }

    formatMessageContent(content, sender) {
        if (sender === 'bot') {
            content = `<i class="fas fa-robot me-2"></i>${content}`;
            
            content = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-primary">$1</a>');
            

            content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            

            content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            content = content.replace(/(\d+\.\s.*?)(?=\n\d+\.\s|\n\n|$)/g, '<li>$1</li>');
            if (content.includes('<li>')) {
                content = content.replace(/(<li>.*<\/li>)/g, '<ol>$1</ol>');
            }
            
            content = content.replace(/•\s(.*?)(?=\n•|\n\n|$)/g, '<li>$1</li>');
            if (content.includes('<li>') && !content.includes('<ol>')) {
                content = content.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
            }
            
            content = content.replace(/\n\n/g, '</p><p>');
            if (content.includes('</p><p>')) {
                content = '<p>' + content + '</p>';
            } else {
                content = content.replace(/\n/g, '<br>');
            }
        }
        
        return content;
    }

    showTypingIndicator() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        
        typingDiv.innerHTML = `
            <i class="fas fa-robot me-2"></i>
            <span class="me-2">AcademicBot is typing</span>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        this.hideWelcomeMessage();
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    
        this.sendButton.disabled = true;
        this.sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        this.isTyping = false;
        

        this.sendButton.disabled = false;
        this.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    updateQuickSuggestions(suggestions) {
        const suggestionContainer = this.quickSuggestions.querySelector('.d-flex');
        if (!suggestionContainer) return;
        
        suggestionContainer.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const button = document.createElement('button');
            button.className = 'btn btn-outline-primary btn-sm suggestion-btn';
            button.setAttribute('data-message', suggestion);
            button.innerHTML = `<i class="fas fa-lightbulb me-1"></i>${suggestion}`;
            
            button.addEventListener('click', () => {
                this.messageInput.value = suggestion;
                this.handleSendMessage();
            });
            
            suggestionContainer.appendChild(button);
        });
    }

    clearChat() {
        this.chatMessages.innerHTML = '';
        this.messageHistory = [];
        this.showWelcomeMessage();
    }

    addQuickReply(text, action = null) {
        const button = document.createElement('button');
        button.className = 'btn btn-outline-secondary btn-sm me-2 mb-2';
        button.textContent = text;
        
        if (action) {
            button.addEventListener('click', action);
        } else {
            button.addEventListener('click', () => {
                this.messageInput.value = text;
                this.handleSendMessage();
            });
        }
        
        const quickReplies = document.createElement('div');
        quickReplies.className = 'quick-replies mb-3';
        quickReplies.appendChild(button);
        
        this.chatMessages.appendChild(quickReplies);
        this.scrollToBottom();
    }

    updateAiStatusIndicator(source) {
        const statusElement = document.getElementById('aiStatus');
        if (statusElement) {
            if (source === 'gemini') {
                statusElement.innerHTML = '<i class="fas fa-check-circle text-success me-1"></i>Powered by Gemini AI • Press Enter to send';
            } else if (source === 'fallback') {
                statusElement.innerHTML = '<i class="fas fa-exclamation-triangle text-warning me-1"></i>Basic mode (API key needed) • Press Enter to send';
            } else {
                statusElement.innerHTML = 'Powered by AI • Press Enter to send';
            }
        }
    }

    checkForPrefilledMessage() {
        const hash = window.location.hash;
        if (hash.startsWith('#career-guidance:')) {
            const major = decodeURIComponent(hash.substring('#career-guidance:'.length));
            this.messageInput.value = `I'm interested in ${major}. Can you provide career guidance for this field?`;
            window.location.hash = '';
            setTimeout(() => {
                this.handleSendMessage();
            }, 1000);
        }
    }

    simulateTyping(duration = 2000) {
        this.showTypingIndicator();
        return new Promise(resolve => {
            setTimeout(() => {
                this.hideTypingIndicator();
                resolve();
            }, duration);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('chatMessages')) {
        window.chatInterface = new ChatInterface();
    }
});

window.ChatInterface = ChatInterface;
