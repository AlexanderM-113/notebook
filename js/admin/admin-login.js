// Admin Login Handler
class AdminLoginHandler {
    constructor() {
        this.loginForm = document.getElementById('admin-login-form');
        this.emailInput = document.getElementById('admin-email');
        this.passwordInput = document.getElementById('admin-password');
        this.errorElement = document.getElementById('admin-login-error');
        this.init();
    }

    init() {
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        
        if (!email || !password) {
            this.showError('Please enter both email and password');
            return;
        }

        try {
            DomUtils.showLoading(this.loginForm.querySelector('button[type="submit"]'), 'Logging in...');
            
            // Attempt login
            const user = await authManager.adminLogin(email, password);
            
            if (user) {
                DomUtils.hideLoading(this.loginForm.querySelector('button[type="submit"]'));
                DomUtils.showToast('Login successful!', 'success');
                
                // Redirect to admin dashboard
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
        DomUtils.hide('#admin-login-screen');
        DomUtils.show('#admin-dashboard');
        
        // Initialize admin dashboard
        if (typeof adminDashboard !== 'undefined') {
            adminDashboard.loadInitialData();
        }
    }
}

// Initialize when DOM is ready
let adminLoginHandler;
document.addEventListener('DOMContentLoaded', () => {
    adminLoginHandler = new AdminLoginHandler();
});
