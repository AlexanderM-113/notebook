// Admin Dashboard Handler
class AdminDashboard {
    constructor() {
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.adminName = document.getElementById('admin-name');
        this.logoutBtn = document.getElementById('admin-logout-btn');
        this.currentTab = 'notebooks';
        this.init();
    }

    async init() {
        // Setup navigation
        this.setupNavigation();

        // Setup logout
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }

        // Load initial data
        await this.loadInitialData();
    }

    setupNavigation() {
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    switchTab(tabName) {
        // Update nav buttons
        this.navButtons.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update tab contents
        this.tabContents.forEach(content => {
            if (content.id === `${tabName}-tab`) {
                content.classList.add('active');
                content.classList.remove('hidden');
            } else {
                content.classList.remove('active');
                content.classList.add('hidden');
            }
        });

        this.currentTab = tabName;

        // Load tab-specific data
        this.loadTabData(tabName);
    }

    async loadInitialData() {
        try {
            // Check if admin is authenticated
            const user = authManager.getCurrentUser();
            
            if (!user || !authManager.isUserAdmin()) {
                this.navigateToLogin();
                return;
            }

            // Update admin name
            if (this.adminName) {
                this.adminName.textContent = user.name || user.email || 'Admin';
            }

            // Load initial tab data
            this.loadTabData(this.currentTab);

        } catch (error) {
            console.error('Error loading initial data:', error);
            DomUtils.showToast('Error loading dashboard', 'error');
        }
    }

    async loadTabData(tabName) {
        switch (tabName) {
            case 'notebooks':
                await this.loadNotebooks();
                break;
            case 'entries':
                await this.loadEntries();
                break;
            case 'groups':
                await this.loadGroups();
                break;
            case 'audit-log':
                await this.loadAuditLog();
                break;
            case 'settings':
                // Settings are loaded separately
                break;
        }
    }

    async loadNotebooks() {
        try {
            const notebooks = await apiClient.getNotebooks();
            this.renderNotebooks(notebooks);
        } catch (error) {
            console.error('Error loading notebooks:', error);
            DomUtils.showToast('Error loading notebooks', 'error');
        }
    }

    renderNotebooks(notebooks) {
        const notebooksList = document.getElementById('notebooks-list');
        if (!notebooksList) return;

        DomUtils.clear(notebooksList);

        if (notebooks.length === 0) {
            this.renderEmptyState(notebooksList, 'No notebooks created yet', 'Create your first notebook to get started');
            return;
        }

        notebooks.forEach(notebook => {
            const card = this.createNotebookCard(notebook);
            notebooksList.appendChild(card);
        });
    }

    createNotebookCard(notebook) {
        const statusClass = notebook.status || 'draft';
        const statusText = (notebook.status || 'draft').charAt(0).toUpperCase() + (notebook.status || 'draft').slice(1);

        const card = DomUtils.createElement('div', { className: 'notebook-card' }, [
            DomUtils.createElement('h3', {}, notebook.title || 'Untitled Notebook'),
            DomUtils.createElement('div', { className: 'notebook-type' }, notebook.type || 'Notebook'),
            DomUtils.createElement('span', { 
                className: `status-badge ${statusClass}`
            }, statusText),
            DomUtils.createElement('div', { className: 'notebook-stats' }, [
                DomUtils.createElement('div', { className: 'stat-item' }, [
                    DomUtils.createElement('span', { className: 'stat-label' }, 'Pages'),
                    DomUtils.createElement('span', { className: 'stat-value' }, notebook.page_count || 0)
                ]),
                DomUtils.createElement('div', { className: 'stat-item' }, [
                    DomUtils.createElement('span', { className: 'stat-label' }, 'Entries'),
                    DomUtils.createElement('span', { className: 'stat-value' }, notebook.entry_count || 0)
                ])
            ]),
            DomUtils.createElement('div', { className: 'card-actions' }, [
                DomUtils.createElement('button', { 
                    className: 'btn btn-sm btn-primary',
                    dataset: { action: 'edit', notebookId: notebook.$id }
                }, 'Edit'),
                DomUtils.createElement('button', { 
                    className: 'btn btn-sm btn-secondary',
                    dataset: { action: 'entries', notebookId: notebook.$id }
                }, 'Entries'),
                DomUtils.createElement('button', { 
                    className: 'btn btn-sm btn-danger',
                    dataset: { action: 'delete', notebookId: notebook.$id }
                }, 'Delete')
            ])
        ]);

        // Add event listeners
        card.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const notebookId = e.target.dataset.notebookId;
                this.handleNotebookAction(action, notebookId);
            });
        });

        return card;
    }

    async handleNotebookAction(action, notebookId) {
        switch (action) {
            case 'edit':
                this.openNotebookEditor(notebookId);
                break;
            case 'entries':
                this.switchTab('entries');
                // Filter entries by notebook
                const filter = document.getElementById('entry-notebook-filter');
                if (filter) {
                    filter.value = notebookId;
                    filter.dispatchEvent(new Event('change'));
                }
                break;
            case 'delete':
                this.deleteNotebook(notebookId);
                break;
        }
    }

    async loadEntries() {
        try {
            const entries = await apiClient.getEntries();
            this.renderEntries(entries);
        } catch (error) {
            console.error('Error loading entries:', error);
            DomUtils.showToast('Error loading entries', 'error');
        }
    }

    renderEntries(entries) {
        const entriesList = document.getElementById('entries-list');
        if (!entriesList) return;

        DomUtils.clear(entriesList);

        if (entries.length === 0) {
            this.renderEmptyState(entriesList, 'No entries yet', 'Entries will appear here when users submit pages');
            return;
        }

        const table = DomUtils.createElement('table', { className: 'table' }, [
            DomUtils.createElement('thead', {}, [
                DomUtils.createElement('tr', {}, [
                    DomUtils.createElement('th', {}, 'User'),
                    DomUtils.createElement('th', {}, 'Date'),
                    DomUtils.createElement('th', {}, 'Status'),
                    DomUtils.createElement('th', {}, 'Actions')
                ])
            ]),
            DomUtils.createElement('tbody', {}, entries.map(entry => this.createEntryRow(entry)))
        ]);

        entriesList.appendChild(table);
    }

    async createEntryRow(entry) {
        // Get user info
        const user = await apiClient.getUser(entry.user_id);
        const userName = user ? user.first_name : 'Unknown';

        const statusClass = entry.is_locked ? 'locked' : 'unlocked';
        const statusText = entry.is_locked ? 'Locked' : 'Unlocked';

        return DomUtils.createElement('tr', {}, [
            DomUtils.createElement('td', {}, userName),
            DomUtils.createElement('td', {}, DomUtils.formatDate(entry.submission_date, 'short')),
            DomUtils.createElement('td', {}, DomUtils.createElement('span', { 
                className: `status-badge ${statusClass}`
            }, statusText)),
            DomUtils.createElement('td', {}, [
                DomUtils.createElement('button', { 
                    className: 'btn btn-sm btn-primary',
                    dataset: { action: 'view', entryId: entry.$id }
                }, 'View'),
                !entry.is_locked ? DomUtils.createElement('button', { 
                    className: 'btn btn-sm btn-warning',
                    dataset: { action: 'lock', entryId: entry.$id }
                }, 'Lock') : DomUtils.createElement('button', { 
                    className: 'btn btn-sm btn-warning',
                    dataset: { action: 'unlock', entryId: entry.$id }
                }, 'Unlock')
            ])
        ]);
    }

    async loadGroups() {
        try {
            const groups = await apiClient.getGroups();
            this.renderGroups(groups);
        } catch (error) {
            console.error('Error loading groups:', error);
            DomUtils.showToast('Error loading groups', 'error');
        }
    }

    renderGroups(groups) {
        const groupsList = document.getElementById('groups-list');
        if (!groupsList) return;

        DomUtils.clear(groupsList);

        if (groups.length === 0) {
            this.renderEmptyState(groupsList, 'No groups created yet', 'Create groups to organize your users');
            return;
        }

        groups.forEach(group => {
            const card = this.createGroupCard(group);
            groupsList.appendChild(card);
        });
    }

    createGroupCard(group) {
        return DomUtils.createElement('div', { className: 'group-card' }, [
            DomUtils.createElement('div', { className: 'group-info' }, [
                DomUtils.createElement('h3', {}, group.name || 'Unnamed Group'),
                DomUtils.createElement('p', {}, `${group.user_count || 0} users`)
            ]),
            DomUtils.createElement('div', { className: 'group-actions' }, [
                DomUtils.createElement('button', { 
                    className: 'btn btn-sm btn-primary',
                    dataset: { action: 'users', groupId: group.$id }
                }, 'View Users'),
                DomUtils.createElement('button', { 
                    className: 'btn btn-sm btn-secondary',
                    dataset: { action: 'edit', groupId: group.$id }
                }, 'Edit'),
                DomUtils.createElement('button', { 
                    className: 'btn btn-sm btn-danger',
                    dataset: { action: 'delete', groupId: group.$id }
                }, 'Delete')
            ])
        ]);
    }

    async loadAuditLog() {
        try {
            const auditLogs = await apiClient.getAuditLogs();
            this.renderAuditLog(auditLogs);
        } catch (error) {
            console.error('Error loading audit log:', error);
            DomUtils.showToast('Error loading audit log', 'error');
        }
    }

    renderAuditLog(auditLogs) {
        const auditLogList = document.getElementById('audit-log-list');
        if (!auditLogList) return;

        DomUtils.clear(auditLogList);

        if (auditLogs.length === 0) {
            this.renderEmptyState(auditLogList, 'No activity yet', 'System actions will be logged here');
            return;
        }

        const table = DomUtils.createElement('table', { className: 'table' }, [
            DomUtils.createElement('thead', {}, [
                DomUtils.createElement('tr', {}, [
                    DomUtils.createElement('th', {}, 'Timestamp'),
                    DomUtils.createElement('th', {}, 'Action'),
                    DomUtils.createElement('th', {}, 'User'),
                    DomUtils.createElement('th', {}, 'Resource')
                ])
            ]),
            DomUtils.createElement('tbody', {}, auditLogs.map(log => this.createAuditLogRow(log)))
        ]);

        auditLogList.appendChild(table);
    }

    createAuditLogRow(log) {
        return DomUtils.createElement('tr', {}, [
            DomUtils.createElement('td', {}, DomUtils.createElement('span', { 
                className: 'timestamp'
            }, DomUtils.formatDate(log.timestamp, 'datetime'))),
            DomUtils.createElement('td', {}, DomUtils.createElement('span', { 
                className: 'action-type'
            }, log.action_type)),
            DomUtils.createElement('td', {}, log.performed_by),
            DomUtils.createElement('td', {}, `${log.resource_type}: ${log.resource_name}`)
        ]);
    }

    renderEmptyState(container, title, message) {
        const emptyState = DomUtils.createElement('div', { className: 'empty-state' }, [
            DomUtils.createElement('div', { className: 'empty-icon' }, '📋'),
            DomUtils.createElement('h3', {}, title),
            DomUtils.createElement('p', {}, message)
        ]);

        container.appendChild(emptyState);
    }

    openNotebookEditor(notebookId) {
        // Open notebook editor modal
        const modal = document.getElementById('notebook-editor-modal');
        if (modal) {
            DomUtils.show(modal);
            
            // Initialize notebook editor
            if (typeof notebookEditor !== 'undefined') {
                notebookEditor.load(notebookId);
            }
        }
    }

    async deleteNotebook(notebookId) {
        DomUtils.showConfirmation(
            'Are you sure you want to delete this notebook? All pages and entries will be permanently deleted.',
            async () => {
                try {
                    await apiClient.deleteNotebook(notebookId);
                    DomUtils.showToast('Notebook deleted successfully', 'success');
                    await this.loadNotebooks();
                } catch (error) {
                    console.error('Error deleting notebook:', error);
                    DomUtils.showToast('Error deleting notebook', 'error');
                }
            }
        );
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
        DomUtils.hide('#admin-dashboard');
        DomUtils.show('#admin-login-screen');
    }
}

// Initialize when DOM is ready
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});