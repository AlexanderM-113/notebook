// DOM Utilities - Helper functions for DOM manipulation
class DomUtils {
    // Show element
    static show(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.classList.remove('hidden');
            element.classList.add('active');
        }
    }

    // Hide element
    static hide(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.classList.remove('active');
            element.classList.add('hidden');
        }
    }

    // Toggle element visibility
    static toggle(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.classList.toggle('hidden');
            element.classList.toggle('active');
        }
    }

    // Create element with attributes and content
    static createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'dataset') {
                Object.keys(attributes[key]).forEach(dataKey => {
                    element.dataset[dataKey] = attributes[key][dataKey];
                });
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        // Set content
        if (content) {
            if (typeof content === 'string') {
                element.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                element.appendChild(content);
            } else if (Array.isArray(content)) {
                content.forEach(child => {
                    if (typeof child === 'string') {
                        element.innerHTML += child;
                    } else if (child instanceof HTMLElement) {
                        element.appendChild(child);
                    }
                });
            }
        }
        
        return element;
    }

    // Remove element
    static remove(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    // Clear element content
    static clear(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.innerHTML = '';
        }
    }

    // Add event listener
    static on(element, event, handler, options = {}) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.addEventListener(event, handler, options);
        }
    }

    // Remove event listener
    static off(element, event, handler) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.removeEventListener(event, handler);
        }
    }

    // Get element by selector
    static get(selector) {
        return document.querySelector(selector);
    }

    // Get all elements by selector
    static getAll(selector) {
        return document.querySelectorAll(selector);
    }

    // Add class to element
    static addClass(element, className) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.classList.add(className);
        }
    }

    // Remove class from element
    static removeClass(element, className) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.classList.remove(className);
        }
    }

    // Check if element has class
    static hasClass(element, className) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        return element ? element.classList.contains(className) : false;
    }

    // Set element attribute
    static setAttr(element, name, value) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.setAttribute(name, value);
        }
    }

    // Get element attribute
    static getAttr(element, name) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        return element ? element.getAttribute(name) : null;
    }

    // Set element data attribute
    static setData(element, name, value) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.dataset[name] = value;
        }
    }

    // Get element data attribute
    static getData(element, name) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        return element ? element.dataset[name] : null;
    }

    // Set element value
    static setValue(element, value) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.value = value;
        }
    }

    // Get element value
    static getValue(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        return element ? element.value : null;
    }

    // Disable element
    static disable(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.disabled = true;
        }
    }

    // Enable element
    static enable(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.disabled = false;
        }
    }

    // Focus element
    static focus(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.focus();
        }
    }

    // Scroll to element
    static scrollTo(element, options = { behavior: 'smooth', block: 'start' }) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.scrollIntoView(options);
        }
    }

    // Show loading state
    static showLoading(element, message = 'Loading...') {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            const originalContent = element.innerHTML;
            element.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner-small"></div>
                    <span>${message}</span>
                </div>
            `;
            element.dataset.originalContent = originalContent;
            element.disabled = true;
        }
    }

    // Hide loading state
    static hideLoading(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element && element.dataset.originalContent) {
            element.innerHTML = element.dataset.originalContent;
            delete element.dataset.originalContent;
            element.disabled = false;
        }
    }

    // Show toast notification
    static showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = this.createElement('div', {
            className: `toast ${type}`
        }, message);

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                this.remove(toast);
            }, 300);
        }, duration);
    }

    // Show confirmation dialog
    static showConfirmation(message, onConfirm, onCancel) {
        const modal = document.getElementById('confirmation-modal');
        const messageElement = document.getElementById('confirmation-message');
        const confirmBtn = document.getElementById('confirm-action');
        const cancelBtn = document.getElementById('confirm-cancel');

        if (modal && messageElement) {
            messageElement.textContent = message;
            this.show(modal);

            const handleConfirm = () => {
                this.hide(modal);
                if (onConfirm) onConfirm();
                cleanup();
            };

            const handleCancel = () => {
                this.hide(modal);
                if (onCancel) onCancel();
                cleanup();
            };

            const cleanup = () => {
                this.off(confirmBtn, 'click', handleConfirm);
                this.off(cancelBtn, 'click', handleCancel);
            };

            this.on(confirmBtn, 'click', handleConfirm);
            this.on(cancelBtn, 'click', handleCancel);
        }
    }

    // Escape HTML to prevent XSS
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Format date
    static formatDate(date, format = 'short') {
        const d = new Date(date);
        
        if (format === 'short') {
            return d.toLocaleDateString();
        } else if (format === 'long') {
            return d.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else if (format === 'time') {
            return d.toLocaleTimeString();
        } else if (format === 'datetime') {
            return d.toLocaleString();
        }
        
        return d.toLocaleDateString();
    }

    // Debounce function
    static debounce(func, wait) {
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

    // Throttle function
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Add slideOut animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .loading-state {
        display: flex;
        align-items: center;
        gap: 10px;
        justify-content: center;
    }
    
    .loading-spinner-small {
        width: 20px;
        height: 20px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);