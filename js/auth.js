// Authentication Manager
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.sessionKey = 'notebook_user_session';
    }

    // Initialize authentication
    async init() {
        // Check for existing session
        const sessionData = localStorage.getItem(this.sessionKey);
        if (sessionData) {
            try {
                this.currentUser = JSON.parse(sessionData);
                this.isAdmin = this.currentUser.role === 'admin';
                return this.currentUser;
            } catch (error) {
                console.error('Error parsing session:', error);
                this.clearSession();
            }
        }
        return null;
    }

    // User login by first name
    async userLogin(firstName) {
        try {
            // Find user by first name
            const user = await apiClient.getUserByFirstName(firstName);
            
            if (!user) {
                throw new Error('User not found. Please check your name or contact administrator.');
            }

            if (user.status !== 'active') {
                throw new Error('Your account is not active. Please contact administrator.');
            }

            // Create session
            this.currentUser = {
                id: user.$id,
                firstName: user.first_name,
                fullName: user.full_name,
                groupId: user.group_id,
                notebookId: user.notebook_id,
                role: 'user'
            };
            
            this.isAdmin = false;
            this.saveSession();
            
            // Update last login
            await apiClient.updateUser(user.$id, { last_login: new Date().toISOString() });
            
            return this.currentUser;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Admin login
    async adminLogin(email, password) {
        try {
            // Create email password session
            const session = await account.createEmailPasswordSession(email, password);
            
            // Get current user
            const user = await account.get();
            
            // Create session
            this.currentUser = {
                id: user.$id,
                email: user.email,
                name: user.name,
                role: 'admin'
            };
            
            this.isAdmin = true;
            this.saveSession();
            
            return this.currentUser;
        } catch (error) {
            console.error('Admin login error:', error);
            throw new Error('Invalid email or password');
        }
    }

    // Logout
    async logout() {
        try {
            if (this.isAdmin) {
                await account.deleteSession('current');
            }
            
            this.clearSession();
            this.currentUser = null;
            this.isAdmin = false;
            
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            this.clearSession();
            return true;
        }
    }

    // Save session to localStorage
    saveSession() {
        if (this.currentUser) {
            localStorage.setItem(this.sessionKey, JSON.stringify(this.currentUser));
        }
    }

    // Clear session
    clearSession() {
        localStorage.removeItem(this.sessionKey);
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Check if user is admin
    isUserAdmin() {
        return this.isAdmin;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Get user ID
    getUserId() {
        return this.currentUser ? this.currentUser.id : null;
    }

    // Check session expiration
    async checkSession() {
        if (!this.currentUser) {
            return false;
        }

        if (this.isAdmin) {
            try {
                await account.get();
                return true;
            } catch (error) {
                this.clearSession();
                return false;
            }
        }

        return true;
    }
}

// Create global auth manager instance
const authManager = new AuthManager();