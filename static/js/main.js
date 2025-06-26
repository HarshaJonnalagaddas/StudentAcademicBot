// Main JavaScript file for AcademicBot
// Global utilities and common functionality

class AcademicBot {
    constructor() {
        this.init();
    }

    init() {
        this.setupGlobalEventListeners();
        this.setupAnimations();
        this.setupUtilities();
    }

    setupGlobalEventListeners() {
        // Handle navigation active states
        this.updateActiveNavigation();
        
        // Handle responsive behavior
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Handle form validations globally
        this.setupFormValidations();
    }

    updateActiveNavigation() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath === '/' && href === '/')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    handleResize() {
        // Handle responsive chat interface
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            this.adjustChatHeight();
        }
    }

    adjustChatHeight() {
        const chatMessages = document.getElementById('chatMessages');
        const viewport = window.innerHeight;
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const footerHeight = document.querySelector('footer').offsetHeight;
        const maxHeight = viewport - navHeight - footerHeight - 200; // Account for other elements
        
        if (window.innerWidth <= 768) {
            chatMessages.style.height = Math.min(400, maxHeight) + 'px';
        }
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe elements that should animate on scroll
        document.querySelectorAll('.feature-card, .college-item, .card').forEach(el => {
            observer.observe(el);
        });
    }

    setupFormValidations() {
        // Add Bootstrap validation classes
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (event) => {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            });
        });
    }

    setupUtilities() {
        // Setup tooltips if Bootstrap tooltips are needed
        this.initializeTooltips();
        
        // Setup smooth scrolling
        this.setupSmoothScrolling();
    }

    initializeTooltips() {
        // Initialize Bootstrap tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    setupSmoothScrolling() {
        // Handle smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Utility functions
    static showLoading(element, text = 'Loading...') {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        
        if (element) {
            element.innerHTML = `
                <div class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3 text-muted">${text}</p>
                </div>
            `;
        }
    }

    static hideLoading(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        
        if (element) {
            element.style.display = 'none';
        }
    }

    static showError(message, container = null) {
        const alertHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        if (container) {
            if (typeof container === 'string') {
                container = document.getElementById(container);
            }
            container.insertAdjacentHTML('afterbegin', alertHTML);
        } else {
            // Show in a toast or modal if no container specified
            this.showToast(message, 'error');
        }
    }

    static showSuccess(message, container = null) {
        const alertHTML = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="fas fa-check-circle me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        if (container) {
            if (typeof container === 'string') {
                container = document.getElementById(container);
            }
            container.insertAdjacentHTML('afterbegin', alertHTML);
        } else {
            this.showToast(message, 'success');
        }
    }

    static showToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }

        const toastId = 'toast-' + Date.now();
        const iconClass = type === 'error' ? 'fa-exclamation-circle text-danger' : 
                         type === 'success' ? 'fa-check-circle text-success' : 
                         'fa-info-circle text-primary';

        const toastHTML = `
            <div id="${toastId}" class="toast" role="alert">
                <div class="toast-header">
                    <i class="fas ${iconClass} me-2"></i>
                    <strong class="me-auto">AcademicBot</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;

        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 5000
        });
        
        toast.show();
        
        // Remove toast element after it's hidden
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    static formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    static debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // API helper methods
    static async apiRequest(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('API request failed:', error);
            return { success: false, error: error.message };
        }
    }

    static async get(url) {
        return this.apiRequest(url, { method: 'GET' });
    }

    static async post(url, data) {
        return this.apiRequest(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}

// Initialize the main application
document.addEventListener('DOMContentLoaded', () => {
    new AcademicBot();
});

// Export for use in other modules
window.AcademicBot = AcademicBot;
