// Main Application Initialization
class App {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.init();
    }

    async init() {
        try {
            // Show loading screen
            if (this.loadingScreen) {
                DomUtils.show(this.loadingScreen);
            }

            // Initialize authentication
            await authManager.init();

            // Apply settings
            if (typeof settings !== 'undefined') {
                settings.applyThemeColors(settings.getSettings());
            }

            // Route to appropriate screen
            await this.route();

            // Hide loading screen
            if (this.loadingScreen) {
                DomUtils.hide(this.loadingScreen);
            }

        } catch (error) {
            console.error('Error initializing app:', error);
            
            if (this.loadingScreen) {
                DomUtils.hide(this.loadingScreen);
            }

            DomUtils.showToast('Error initializing application', 'error');
        }
    }

    async route() {
        const user = authManager.getCurrentUser();

        if (!user) {
            // No user logged in, show login screens
            this.showLoginScreen();
        } else if (authManager.isUserAdmin()) {
            // Admin user, show admin dashboard
            this.showAdminDashboard();
        } else {
            // Regular user, show user dashboard
            this.showUserDashboard();
        }
    }

    showLoginScreen() {
        // Hide all screens
        this.hideAllScreens();

        // Show both login screens (tabs or navigation could be added)
        // For now, we'll show user login by default
        DomUtils.show('#user-login-screen');
        
        // Add navigation between login types
        this.addLoginNavigation();
    }

    addLoginNavigation() {
        // Check if navigation already exists
        if (document.getElementById('login-type-nav')) return;

        const loginNav = DomUtils.createElement('div', {
            id: 'login-type-nav',
            className: 'login-type-nav'
        }, [
            DomUtils.createElement('button', {
                className: 'btn btn-secondary',
                id: 'switch-to-user-login'
            }, 'User Login'),
            DomUtils.createElement('button', {
                className: 'btn btn-secondary',
                id: 'switch-to-admin-login'
            }, 'Admin Login')
        ]);

        const userLoginScreen = document.getElementById('user-login-screen');
        if (userLoginScreen) {
            userLoginScreen.querySelector('.login-container').appendChild(loginNav);
        }

        // Add event listeners
        document.getElementById('switch-to-user-login').addEventListener('click', () => {
            DomUtils.hide('#admin-login-screen');
            DomUtils.show('#user-login-screen');
        });

        document.getElementById('switch-to-admin-login').addEventListener('click', () => {
            DomUtils.hide('#user-login-screen');
            DomUtils.show('#admin-login-screen');
        });
    }

    showAdminDashboard() {
        this.hideAllScreens();
        DomUtils.show('#admin-dashboard');

        // Load admin dashboard
        if (typeof adminDashboard !== 'undefined') {
            adminDashboard.loadInitialData();
        }
    }

    showUserDashboard() {
        this.hideAllScreens();
        DomUtils.show('#user-dashboard');

        // Load user dashboard
        if (typeof userDashboard !== 'undefined') {
            userDashboard.load();
        }
    }

    hideAllScreens() {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            DomUtils.hide(screen);
        });
    }

    // Global error handler
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            DomUtils.showToast('An unexpected error occurred', 'error');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            DomUtils.showToast('An unexpected error occurred', 'error');
        });
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
    app.setupErrorHandling();
});