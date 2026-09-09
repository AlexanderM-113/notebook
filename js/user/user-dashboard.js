// User Dashboard Handler
class UserDashboard {
    constructor() {
        this.welcomeElement = document.getElementById('user-welcome');
        this.assignedPagesElement = document.getElementById('assigned-pages');
        this.progressBar = document.getElementById('progress-bar');
        this.progressText = document.getElementById('progress-text');
        this.logoutBtn = document.getElementById('user-logout-btn');
        this.assignedPages = [];
        this.init();
    }

    async init() {
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }
    }

    async load() {
        try {
            const user = authManager.getCurrentUser();
            
            if (!user) {
                this.navigateToLogin();
                return;
            }

            // Update welcome message
            if (this.welcomeElement) {
                this.welcomeElement.textContent = `Hello, ${user.firstName}!`;
            }

            // Load assigned pages
            await this.loadAssignedPages(user.id);

        } catch (error) {
            console.error('Error loading dashboard:', error);
            DomUtils.showToast('Error loading dashboard', 'error');
        }
    }

    async loadAssignedPages(userId) {
        try {
            // Get page assignments for user
            const assignments = await apiClient.getPageAssignments(userId);
            
            if (assignments.length === 0) {
                this.showEmptyState();
                return;
            }

            // Get pages and entries
            const pageIds = assignments.map(a => a.page_id);
            this.assignedPages = [];
            
            for (const assignment of assignments) {
                const page = await apiClient.getPage(assignment.page_id);
                const entry = await this.getUserEntryForPage(userId, assignment.page_id);
                
                this.assignedPages.push({
                    ...page,
                    assignmentId: assignment.$id,
                    status: assignment.status,
                    entry: entry
                });
            }

            // Sort by order position
            this.assignedPages.sort((a, b) => a.order_position - b.order_position);

            // Render pages
            this.renderPages();
            this.updateProgress();

        } catch (error) {
            console.error('Error loading assigned pages:', error);
            DomUtils.showToast('Error loading pages', 'error');
        }
    }

    async getUserEntryForPage(userId, pageId) {
        try {
            const entries = await apiClient.getEntries();
            return entries.find(e => e.user_id === userId && e.page_id === pageId);
        } catch (error) {
            console.error('Error getting user entry:', error);
            return null;
        }
    }

    renderPages() {
        if (!this.assignedPagesElement) return;

        DomUtils.clear(this.assignedPagesElement);

        this.assignedPages.forEach((page, index) => {
            const pageCard = this.createPageCard(page, index);
            this.assignedPagesElement.appendChild(pageCard);
        });
    }

    createPageCard(page, index) {
        const status = this.getPageStatus(page);
        const statusClass = status.class;
        const statusText = status.text;
        const pageTypeIcon = page.page_type === 'template' ? '📝' : '📄';

        const card = DomUtils.createElement('div', {
            className: `page-card ${statusClass}`,
            dataset: { pageId: page.$id }
        }, [
            DomUtils.createElement('div', { className: 'page-header' }, [
                DomUtils.createElement('span', { className: 'page-number' }, `Page ${index + 1}`),
                DomUtils.createElement('span', { className: 'page-type' }, pageTypeIcon)
            ]),
            DomUtils.createElement('h3', {}, page.title || `Page ${index + 1}`),
            DomUtils.createElement('span', { className: `page-status ${statusClass}` }, statusText)
        ]);

        card.addEventListener('click', () => this.openPage(page));

        return card;
    }

    getPageStatus(page) {
        if (page.status === 'unlocked') {
            return { class: 'needs-resubmission', text: 'Needs Re-submission' };
        }

        if (page.entry && page.entry.is_locked) {
            return { class: 'locked', text: 'Locked' };
        }

        if (page.entry) {
            return { class: 'completed', text: 'Completed' };
        }

        return { class: 'not-started', text: 'Not Started' };
    }

    updateProgress() {
        const total = this.assignedPages.length;
        const completed = this.assignedPages.filter(p => p.entry && p.entry.is_locked).length;
        const percentage = total > 0 ? (completed / total) * 100 : 0;

        if (this.progressBar) {
            this.progressBar.style.width = `${percentage}%`;
        }

        if (this.progressText) {
            this.progressText.textContent = `You have completed ${completed} of ${total} assigned pages`;
        }
    }

    showEmptyState() {
        if (!this.assignedPagesElement) return;

        DomUtils.clear(this.assignedPagesElement);

        const emptyState = DomUtils.createElement('div', { className: 'empty-state' }, [
            DomUtils.createElement('div', { className: 'empty-icon' }, '📋'),
            DomUtils.createElement('h3', {}, 'No Pages Assigned'),
            DomUtils.createElement('p', {}, 'You haven\'t been assigned any pages yet. Please contact your administrator.')
        ]);

        this.assignedPagesElement.appendChild(emptyState);

        if (this.progressBar) {
            this.progressBar.style.width = '0%';
        }

        if (this.progressText) {
            this.progressText.textContent = 'You have completed 0 of 0 assigned pages';
        }
    }

    openPage(page) {
        // Check if page is locked
        if (page.entry && page.entry.is_locked) {
            DomUtils.showToast('This page is locked. Contact administrator to make changes.', 'warning');
            return;
        }

        // Navigate to page entry screen
        DomUtils.hide('#user-dashboard');
        DomUtils.show('#page-entry-screen');

        // Initialize page entry
        if (typeof pageEntry !== 'undefined') {
            pageEntry.load(page);
        }
    }

    async handleLogout() {
        try {
            await authManager.logout();
            DomUtils.showToast('Logged out successfully', 'success');
            this.navigateToLogin();
        } catch (error) {
            console.error('Logout error:', error);
            DomUtils.showToast('Error logging out', 'error');
        }
    }

    navigateToLogin() {
        DomUtils.hide('#user-dashboard');
        DomUtils.show('#user-login-screen');
        
        // Reset login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            FormUtils.resetForm(loginForm);
        }
    }
}

// Initialize when DOM is ready
let userDashboard;
document.addEventListener('DOMContentLoaded', () => {
    userDashboard = new UserDashboard();
});