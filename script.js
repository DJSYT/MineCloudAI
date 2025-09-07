// MineCloud AI - Frontend JavaScript
class MineCloudAI {
    constructor() {
        this.chatArea = document.getElementById('chatArea');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.menuBtn = document.getElementById('menuBtn');
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.closeSidebar = document.getElementById('closeSidebar');
        this.backToTop = document.getElementById('backToTop');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.charCount = document.getElementById('charCount');
        
        this.isLoading = false;
        this.messageCount = 0;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createParticles();
        this.animateTitle();
        this.checkScrollButton();
        
        // Welcome animation
        gsap.from('.welcome-card', {
            duration: 1,
            opacity: 0,
            y: 50,
            ease: 'power3.out',
            delay: 0.5
        });
    }

    setupEventListeners() {
        // Send message events
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Character count
        this.messageInput.addEventListener('input', () => {
            const length = this.messageInput.value.length;
            this.charCount.textContent = `${length}/500`;
            
            if (length > 450) {
                this.charCount.style.color = '#ff6b6b';
            } else {
                this.charCount.style.color = 'rgba(255, 255, 255, 0.5)';
            }
        });

        // Sidebar events
        this.menuBtn.addEventListener('click', () => this.openSidebar());
        this.closeSidebar.addEventListener('click', () => this.closeSidebarHandler());
        this.sidebarOverlay.addEventListener('click', () => this.closeSidebarHandler());

        // Back to top
        this.backToTop.addEventListener('click', () => this.scrollToTop());
        window.addEventListener('scroll', () => this.checkScrollButton());
        this.chatArea.addEventListener('scroll', () => this.checkScrollButton());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSidebarHandler();
            }
        });

        // Input focus effects
        this.messageInput.addEventListener('focus', () => {
            gsap.to('.input-wrapper', {
                duration: 0.3,
                scale: 1.02,
                ease: 'power2.out'
            });
        });

        this.messageInput.addEventListener('blur', () => {
            gsap.to('.input-wrapper', {
                duration: 0.3,
                scale: 1,
                ease: 'power2.out'
            });
        });
    }

    createParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random positioning and sizing
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (15 + Math.random() * 10) + 's';
            
            const size = 2 + Math.random() * 3;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            particlesContainer.appendChild(particle);
        }
    }

    animateTitle() {
        const title = document.getElementById('mainTitle');
        
        gsap.fromTo(title, 
            {
                opacity: 0,
                y: -50,
                scale: 0.8
            },
            {
                duration: 1.2,
                opacity: 1,
                y: 0,
                scale: 1,
                ease: 'power3.out'
            }
        );

        // Continuous glow animation
        gsap.to(title, {
            duration: 2,
            textShadow: '0 0 40px rgba(0, 212, 255, 0.6)',
            repeat: -1,
            yoyo: true,
            ease: 'power2.inOut'
        });
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message || this.isLoading) return;

        this.isLoading = true;
        this.toggleSendButton(false);
        this.showLoading(true);

        // Clear input
        this.messageInput.value = '';
        this.charCount.textContent = '0/500';
        this.charCount.style.color = 'rgba(255, 255, 255, 0.5)';

        // Remove welcome message if it's the first message
        if (this.messageCount === 0) {
            this.removeWelcomeMessage();
        }

        // Add user message
        this.addMessage(message, 'user');
        this.messageCount++;

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            // Add AI response with slight delay for better UX
            setTimeout(() => {
                this.addMessage(data.response, 'ai', data.timestamp);
                this.showLoading(false);
                this.isLoading = false;
                this.toggleSendButton(true);
                this.messageInput.focus();
            }, 800);

        } catch (error) {
            console.error('Error sending message:', error);
            setTimeout(() => {
                this.addMessage('Sorry, I encountered an error. Please try again.', 'ai');
                this.showLoading(false);
                this.isLoading = false;
                this.toggleSendButton(true);
                this.messageInput.focus();
            }, 500);
        }
    }

    removeWelcomeMessage() {
        const welcomeMessage = this.chatArea.querySelector('.welcome-message');
        if (welcomeMessage) {
            gsap.to(welcomeMessage, {
                duration: 0.5,
                opacity: 0,
                y: -30,
                ease: 'power2.in',
                onComplete: () => {
                    welcomeMessage.remove();
                }
            });
        }
    }

    addMessage(content, sender, timestamp = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const currentTime = timestamp || new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageDiv.innerHTML = `
            <div class="message-bubble">
                <div class="message-content">${this.escapeHtml(content)}</div>
                <div class="message-time">${currentTime}</div>
            </div>
        `;

        this.chatArea.appendChild(messageDiv);

        // Animate message appearance
        gsap.fromTo(messageDiv, 
            {
                opacity: 0,
                y: 30,
                scale: 0.9
            },
            {
                duration: 0.5,
                opacity: 1,
                y: 0,
                scale: 1,
                ease: 'power3.out'
            }
        );

        // Add hover effect
        messageDiv.addEventListener('mouseenter', () => {
            gsap.to(messageDiv.querySelector('.message-bubble'), {
                duration: 0.3,
                y: -2,
                boxShadow: '0 8px 25px rgba(0, 212, 255, 0.2)',
                ease: 'power2.out'
            });
        });

        messageDiv.addEventListener('mouseleave', () => {
            gsap.to(messageDiv.querySelector('.message-bubble'), {
                duration: 0.3,
                y: 0,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                ease: 'power2.out'
            });
        });

        this.scrollToBottom();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatArea.scrollTo({
                top: this.chatArea.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    }

    toggleSendButton(enabled) {
        this.sendBtn.disabled = !enabled;
        
        if (enabled) {
            gsap.to(this.sendBtn, {
                duration: 0.3,
                opacity: 1,
                scale: 1,
                ease: 'power2.out'
            });
        } else {
            gsap.to(this.sendBtn, {
                duration: 0.3,
                opacity: 0.5,
                scale: 0.9,
                ease: 'power2.out'
            });
        }
    }

    showLoading(show) {
        if (show) {
            this.loadingIndicator.classList.add('active');
        } else {
            this.loadingIndicator.classList.remove('active');
        }
    }

    openSidebar() {
        this.sidebar.classList.add('open');
        this.sidebarOverlay.classList.add('active');
        
        // Animate sidebar
        gsap.fromTo(this.sidebar, 
            { x: -350 },
            { 
                duration: 0.3,
                x: 0,
                ease: 'power3.out'
            }
        );

        // Animate sidebar content
        gsap.fromTo('.sidebar-content > *', 
            { opacity: 0, x: -30 },
            { 
                duration: 0.4,
                opacity: 1,
                x: 0,
                stagger: 0.1,
                ease: 'power2.out',
                delay: 0.1
            }
        );
    }

    closeSidebarHandler() {
        gsap.to(this.sidebar, {
            duration: 0.3,
            x: -350,
            ease: 'power3.in',
            onComplete: () => {
                this.sidebar.classList.remove('open');
                this.sidebarOverlay.classList.remove('active');
            }
        });
    }

    scrollToTop() {
        this.chatArea.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // Button animation
        gsap.to(this.backToTop, {
            duration: 0.2,
            scale: 0.9,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1
        });
    }

    checkScrollButton() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const chatScrollTop = this.chatArea.scrollTop;
        
        if (scrollTop > 300 || chatScrollTop > 200) {
            this.backToTop.classList.add('visible');
        } else {
            this.backToTop.classList.remove('visible');
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MineCloudAI();
});

// Additional animations and effects
document.addEventListener('DOMContentLoaded', () => {
    // Header animation
    gsap.from('.header', {
        duration: 1,
        y: -50,
        opacity: 0,
        ease: 'power3.out'
    });

    // Chat container animation
    gsap.from('.chat-container', {
        duration: 1,
        y: 30,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.3
    });

    // Footer animation
    gsap.from('.footer', {
        duration: 1,
        y: 30,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.5
    });

    // Button hover effects
    document.querySelectorAll('.send-btn, .back-to-top, .menu-btn').forEach(button => {
        button.addEventListener('mouseenter', () => {
            gsap.to(button, {
                duration: 0.3,
                scale: 1.1,
                ease: 'power2.out'
            });
        });

        button.addEventListener('mouseleave', () => {
            gsap.to(button, {
                duration: 0.3,
                scale: 1,
                ease: 'power2.out'
            });
        });
    });
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize
window.addEventListener('resize', debounce(() => {
    // Adjust particle positions if needed
    const particles = document.querySelectorAll('.particle');
    particles.forEach(particle => {
        particle.style.left = Math.random() * 100 + '%';
    });
}, 250));

// Service worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker would be implemented here for offline capabilities
        console.log('MineCloud AI is ready!');
    });
}
