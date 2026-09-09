// Group Manager Handler
class GroupManager {
    constructor() {
        this.createGroupBtn = document.getElementById('create-group-btn');
        this.groupsList = document.getElementById('groups-list');
        this.init();
    }

    init() {
        // Setup create group button
        if (this.createGroupBtn) {
            this.createGroupBtn.addEventListener('click', () => this.createGroup());
        }

        // Setup group card handlers
        this.setupGroupHandlers();
    }

    setupGroupHandlers() {
        // Group card handlers are set up in admin-dashboard.js
        // This handles additional group-specific functionality
    }

    async createGroup() {
        const groupName = prompt('Enter group name:');
        if (!groupName) return;

        try {
            const groupData = {
                name: groupName,
                description: '',
                user_count: 0
            };

            const group = await apiClient.createGroup(groupData);
            DomUtils.showToast('Group created successfully', 'success');
            
            // Reload groups
            if (typeof adminDashboard !== 'undefined') {
                await adminDashboard.loadGroups();
            }

        } catch (error) {
            console.error('Error creating group:', error);
            DomUtils.showToast('Error creating group', 'error');
        }
    }

    async viewGroupUsers(groupId) {
        try {
            const group = await apiClient.getGroup(groupId);
            const users = await apiClient.getUsersByGroup(groupId);

            this.showGroupUsersModal(group, users);

        } catch (error) {
            console.error('Error loading group users:', error);
            DomUtils.showToast('Error loading group users', 'error');
        }
    }

    showGroupUsersModal(group, users) {
        const modal = document.getElementById('group-users-modal');
        const title = document.getElementById('group-users-title');
        const usersList = document.getElementById('group-users-list');

        if (!modal || !title || !usersList) return;

        title.textContent = `${group.name} - Users`;
        DomUtils.clear(usersList);

        if (users.length === 0) {
            usersList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">👥</div>
                    <h3>No users in this group</h3>
                    <p>Add users to get started</p>
                </div>
            `;
            return;
        }

        users.forEach(user => {
            const userItem = this.createUserItem(user);
            usersList.appendChild(userItem);
        });

        // Setup add user button
        const addUserBtn = document.getElementById('add-user-btn');
        if (addUserBtn) {
            addUserBtn.onclick = () => this.addUserToGroup(group.$id);
        }

        DomUtils.show(modal);
    }

    createUserItem(user) {
        return DomUtils.createElement('div', { className: 'user-item' }, [
            DomUtils.createElement('div', { className: 'user-info' }, [
                DomUtils.createElement('h4', {}, user.first_name || 'Unknown'),
                DomUtils.createElement('p', {}, `Last login: ${user.last_login ? DomUtils.formatDate(user.last_login, 'short') : 'Never'}`)
            ]),
            DomUtils.createElement('div', { className: 'user-actions' }, [
                DomUtils.createElement('button', { 
                    className: 'btn btn-sm btn-primary',
                    dataset: { action: 'assign', userId: user.$id }
                }, 'Assign Pages'),
                DomUtils.createElement('button', { 
                    className: 'btn btn-sm btn-secondary',
                    dataset: { action: 'edit', userId: user.$id }
                }, 'Edit'),
                DomUtils.createElement('button', { 
                    className: 'btn btn-sm btn-danger',
                    dataset: { action: 'remove', userId: user.$id }
                }, 'Remove')
            ])
        ]);
    }

    async addUserToGroup(groupId) {
        const firstName = prompt('Enter user first name:');
        if (!firstName) return;

        const fullName = prompt('Enter full name (optional):') || '';
        const email = prompt('Enter email (optional):') || '';

        try {
            const userData = {
                first_name: firstName,
                full_name: fullName,
                email: email,
                group_id: groupId,
                status: 'active',
                entry_count: 0
            };

            const user = await apiClient.createUser(userData);
            
            // Update group user count
            const group = await apiClient.getGroup(groupId);
            await apiClient.updateGroup(groupId, { user_count: (group.user_count || 0) + 1 });

            DomUtils.showToast('User added successfully', 'success');
            
            // Reload group users
            await this.viewGroupUsers(groupId);
            
            // Reload groups to update user count
            if (typeof adminDashboard !== 'undefined') {
                await adminDashboard.loadGroups();
            }

        } catch (error) {
            console.error('Error adding user:', error);
            DomUtils.showToast('Error adding user', 'error');
        }
    }

    async editUser(userId) {
        try {
            const user = await apiClient.getUser(userId);
            
            const firstName = prompt('Enter first name:', user.first_name);
            if (firstName === null) return;

            const fullName = prompt('Enter full name:', user.full_name) || user.full_name;
            const email = prompt('Enter email:', user.email) || user.email;

            const updateData = {
                first_name: firstName,
                full_name: fullName,
                email: email
            };

            await apiClient.updateUser(userId, updateData);
            DomUtils.showToast('User updated successfully', 'success');
            
            // Reload current view
            const modal = document.getElementById('group-users-modal');
            if (modal && !DomUtils.hasClass(modal, 'hidden')) {
                await this.viewGroupUsers(user.group_id);
            }

        } catch (error) {
            console.error('Error editing user:', error);
            DomUtils.showToast('Error editing user', 'error');
        }
    }

    async removeUserFromGroup(userId) {
        try {
            const user = await apiClient.getUser(userId);
            const groupId = user.group_id;

            DomUtils.showConfirmation(
                `Are you sure you want to remove ${user.first_name} from this group? They will lose access to the notebook.`,
                async () => {
                    try {
                        // Update user status to inactive
                        await apiClient.updateUser(userId, { status: 'inactive' });
                        
                        // Update group user count
                        const group = await apiClient.getGroup(groupId);
                        await apiClient.updateGroup(groupId, { user_count: Math.max(0, (group.user_count || 0) - 1) });

                        DomUtils.showToast('User removed successfully', 'success');
                        
                        // Reload group users
                        await this.viewGroupUsers(groupId);
                        
                        // Reload groups to update user count
                        if (typeof adminDashboard !== 'undefined') {
                            await adminDashboard.loadGroups();
                        }

                    } catch (error) {
                        console.error('Error removing user:', error);
                        DomUtils.showToast('Error removing user', 'error');
                    }
                }
            );

        } catch (error) {
            console.error('Error getting user:', error);
            DomUtils.showToast('Error removing user', 'error');
        }
    }

    async assignPagesToUser(userId) {
        try {
            const user = await apiClient.getUser(userId);
            const notebook = await apiClient.getNotebook(user.notebook_id);
            const pages = await apiClient.getPages(user.notebook_id);
            const currentAssignments = await apiClient.getPageAssignments(userId);

            this.showPageAssignmentModal(user, notebook, pages, currentAssignments);

        } catch (error) {
            console.error('Error loading page assignment data:', error);
            DomUtils.showToast('Error loading pages', 'error');
        }
    }

    showPageAssignmentModal(user, notebook, pages, currentAssignments) {
        const modal = document.getElementById('page-assignment-modal');
        const title = document.getElementById('assignment-user-name');
        const pagesList = document.getElementById('assignment-pages-list');
        const form = document.getElementById('page-assignment-form');

        if (!modal || !title || !pagesList || !form) return;

        title.textContent = `Assign Pages to ${user.first_name}`;
        DomUtils.clear(pagesList);

        const assignedPageIds = currentAssignments.map(a => a.page_id);

        pages.forEach(page => {
            const isAssigned = assignedPageIds.includes(page.$id);
            const icon = page.page_type === 'template' ? '📝' : '📄';

            const item = DomUtils.createElement('div', { className: 'assignment-item' }, [
                DomUtils.createElement('input', {
                    type: 'checkbox',
                    name: 'page_ids',
                    value: page.$id,
                    checked: isAssigned
                }),
                DomUtils.createElement('div', { className: 'page-info' }, [
                    DomUtils.createElement('div', { className: 'page-title' }, `${icon} ${page.title}`),
                    DomUtils.createElement('div', { className: 'page-type' }, `Page ${page.page_number} • ${page.page_type}`)
                ])
            ]);

            pagesList.appendChild(item);
        });

        // Handle form submission
        form.onsubmit = async (e) => {
            e.preventDefault();
            await this.submitPageAssignments(user.$id, form);
        };

        DomUtils.show(modal);
    }

    async submitPageAssignments(userId, form) {
        try {
            const formData = new FormData(form);
            const selectedPageIds = formData.getAll('page_ids');

            // Get current assignments
            const currentAssignments = await apiClient.getPageAssignments(userId);
            const currentPageIds = currentAssignments.map(a => a.page_id);

            // Remove unassigned pages
            for (const assignment of currentAssignments) {
                if (!selectedPageIds.includes(assignment.page_id)) {
                    await apiClient.deletePageAssignment(assignment.$id);
                }
            }

            // Add newly assigned pages
            for (const pageId of selectedPageIds) {
                if (!currentPageIds.includes(pageId)) {
                    await apiClient.createPageAssignment({
                        user_id: userId,
                        page_id: pageId,
                        status: 'assigned'
                    });
                }
            }

            DomUtils.showToast('Pages assigned successfully', 'success');
            DomUtils.hide('#page-assignment-modal');

            // Reload group users
            const user = await apiClient.getUser(userId);
            await this.viewGroupUsers(user.group_id);

        } catch (error) {
            console.error('Error assigning pages:', error);
            DomUtils.showToast('Error assigning pages', 'error');
        }
    }
}

// Initialize when DOM is ready
let groupManager;
document.addEventListener('DOMContentLoaded', () => {
    groupManager = new GroupManager();
});