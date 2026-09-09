// User Login Handler
class UserLoginHandler {
    constructor() {
        this.loginForm = document.getElementById('login-form');
        this.firstNameInput = document.getElementById('user-first-name');
        this.errorElement = document.getElementById('login-error');
        this.init();
    }

    init() {
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const firstName = this.firstNameInput.value.trim();
        
        if (!firstName) {
            this.showError('Please enter your first name');
            return;
        }

        try {
            DomUtils.showLoading(this.loginForm.querySelector('button[type="submit"]'), 'Logging in...');
            
            // Attempt login
            const user = await authManager.userLogin(firstName);
            
            if (user) {
                DomUtils.hideLoading(this.loginForm.querySelector('button[type="submit"]'));
                DomUtils.showToast('Login successful!', 'success');
                
                // Redirect to user dashboard
                setTimeout(() => {
                    this.navigateToDashboard();
                }, 1000);
            }
        } catch (error) {
            DomUtils.hideLoading(this.loginForm.querySelector('button[type="submit"]'));
            this.showError(error.message);
        }
    }

    showError(message) {
        if (this.errorElement) {
            this.errorElement.textContent = message;
            DomUtils.show(this.errorElement);
        }
    }

    hideError() {
        if (this.errorElement) {
            DomUtils.hide(this.errorElement);
        }
    }

    navigateToDashboard() {
        DomUtils.hide('#user-login-screen');
        DomUtils.show('#user-dashboard');
        
        // Initialize user dashboard
        if (typeof userDashboard !== 'undefined') {
            userDashboard.load();
        }
    }
}

// Initialize when DOM is ready
let userLoginHandler;
document.addEventListener('DOMContentLoaded', () => {
    userLoginHandler = new UserLoginHandler();
});