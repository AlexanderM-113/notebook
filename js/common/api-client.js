// API Client - Wrapper for Appwrite API calls
class ApiClient {
    constructor() {
        this.databases = databases;
        this.storage = storage;
        this.functions = functions;
        this.dbId = DB_ID;
        this.collections = COLLECTIONS;
        this.buckets = BUCKETS;
        this.Query = Appwrite.Query;
    }

    // Generic database operations
    async listDocuments(collectionId, queries = []) {
        try {
            const response = await this.databases.listDocuments(
                this.dbId,
                collectionId,
                queries
            );
            return response.documents;
        } catch (error) {
            console.error('Error listing documents:', error);
            throw error;
        }
    }

    async getDocument(collectionId, documentId) {
        try {
            return await this.databases.getDocument(
                this.dbId,
                collectionId,
                documentId
            );
        } catch (error) {
            console.error('Error getting document:', error);
            throw error;
        }
    }

    async createDocument(collectionId, data, permissions = []) {
        try {
            // Generate a simple unique ID
            const uniqueId = 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            return await this.databases.createDocument(
                this.dbId,
                collectionId,
                uniqueId,
                data,
                permissions
            );
        } catch (error) {
            console.error('Error creating document:', error);
            throw error;
        }
    }

    async updateDocument(collectionId, documentId, data) {
        try {
            return await this.databases.updateDocument(
                this.dbId,
                collectionId,
                documentId,
                data
            );
        } catch (error) {
            console.error('Error updating document:', error);
            throw error;
        }
    }

    async deleteDocument(collectionId, documentId) {
        try {
            return await this.databases.deleteDocument(
                this.dbId,
                collectionId,
                documentId
            );
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    }

    // Notebook operations
    async getNotebooks() {
        return this.listDocuments(this.collections.NOTEBOOKS);
    }

    async getNotebook(notebookId) {
        return this.getDocument(this.collections.NOTEBOOKS, notebookId);
    }

    async createNotebook(data) {
        return this.createDocument(this.collections.NOTEBOOKS, data);
    }

    async updateNotebook(notebookId, data) {
        return this.updateDocument(this.collections.NOTEBOOKS, notebookId, data);
    }

    async deleteNotebook(notebookId) {
        return this.deleteDocument(this.collections.NOTEBOOKS, notebookId);
    }

    // Group operations
    async getGroups() {
        return this.listDocuments(this.collections.GROUPS);
    }

    async getGroup(groupId) {
        return this.getDocument(this.collections.GROUPS, groupId);
    }

    async createGroup(data) {
        return this.createDocument(this.collections.GROUPS, data);
    }

    async updateGroup(groupId, data) {
        return this.updateDocument(this.collections.GROUPS, groupId, data);
    }

    async deleteGroup(groupId) {
        return this.deleteDocument(this.collections.GROUPS, groupId);
    }

    // User operations
    async getUsers() {
        return this.listDocuments(this.collections.USERS);
    }

    async getUser(userId) {
        return this.getDocument(this.collections.USERS, userId);
    }

    async getUserByFirstName(firstName) {
        const users = await this.listDocuments(
            this.collections.USERS
        );
        // Filter manually since Query might not be available
        const filteredUsers = users.filter(user => 
            user.first_name && user.first_name.toLowerCase() === firstName.toLowerCase() && 
            user.status === 'active'
        );
        return filteredUsers.length > 0 ? filteredUsers[0] : null;
    }

    async getUsersByGroup(groupId) {
        const users = await this.listDocuments(this.collections.USERS);
        return users.filter(user => user.group_id === groupId);
    }

    async createUser(data) {
        return this.createDocument(this.collections.USERS, data);
    }

    async updateUser(userId, data) {
        return this.updateDocument(this.collections.USERS, userId, data);
    }

    async deleteUser(userId) {
        return this.deleteDocument(this.collections.USERS, userId);
    }

    // Page operations
    async getPages(notebookId) {
        const pages = await this.listDocuments(this.collections.PAGES);
        const filteredPages = pages.filter(page => page.notebook_id === notebookId);
        return filteredPages.sort((a, b) => (a.order_position || 0) - (b.order_position || 0));
    }

    async getPage(pageId) {
        return this.getDocument(this.collections.PAGES, pageId);
    }

    async createPage(data) {
        return this.createDocument(this.collections.PAGES, data);
    }

    async updatePage(pageId, data) {
        return this.updateDocument(this.collections.PAGES, pageId, data);
    }

    async deletePage(pageId) {
        return this.deleteDocument(this.collections.PAGES, pageId);
    }

    // Page elements operations
    async getPageElements(pageId) {
        const elements = await this.listDocuments(this.collections.PAGE_ELEMENTS);
        const filteredElements = elements.filter(element => element.page_id === pageId);
        return filteredElements.sort((a, b) => (a.order_position || 0) - (b.order_position || 0));
    }

    async getPageElement(elementId) {
        return this.getDocument(this.collections.PAGE_ELEMENTS, elementId);
    }

    async createPageElement(data) {
        return this.createDocument(this.collections.PAGE_ELEMENTS, data);
    }

    async updatePageElement(elementId, data) {
        return this.updateDocument(this.collections.PAGE_ELEMENTS, elementId, data);
    }

    async deletePageElement(elementId) {
        return this.deleteDocument(this.collections.PAGE_ELEMENTS, elementId);
    }

    // Page assignment operations
    async getPageAssignments(userId) {
        const assignments = await this.listDocuments(this.collections.PAGE_ASSIGNMENTS);
        return assignments.filter(assignment => assignment.user_id === userId);
    }

    async getPageAssignment(assignmentId) {
        return this.getDocument(this.collections.PAGE_ASSIGNMENTS, assignmentId);
    }

    async createPageAssignment(data) {
        return this.createDocument(this.collections.PAGE_ASSIGNMENTS, data);
    }

    async updatePageAssignment(assignmentId, data) {
        return this.updateDocument(this.collections.PAGE_ASSIGNMENTS, assignmentId, data);
    }

    async deletePageAssignment(assignmentId) {
        return this.deleteDocument(this.collections.PAGE_ASSIGNMENTS, assignmentId);
    }

    // Entry operations
    async getEntries(notebookId = null) {
        const entries = await this.listDocuments(this.collections.ENTRIES);
        if (notebookId) {
            return entries.filter(entry => entry.notebook_id === notebookId);
        }
        return entries;
    }

    async getEntry(entryId) {
        return this.getDocument(this.collections.ENTRIES, entryId);
    }

    async getUserEntries(userId) {
        const entries = await this.listDocuments(this.collections.ENTRIES);
        return entries.filter(entry => entry.user_id === userId);
    }

    async createEntry(data) {
        return this.createDocument(this.collections.ENTRIES, data);
    }

    async updateEntry(entryId, data) {
        return this.updateDocument(this.collections.ENTRIES, entryId, data);
    }

    async deleteEntry(entryId) {
        return this.deleteDocument(this.collections.ENTRIES, entryId);
    }

    // Entry response operations
    async getEntryResponses(entryId) {
        const responses = await this.listDocuments(this.collections.ENTRY_RESPONSES);
        return responses.filter(response => response.entry_id === entryId);
    }

    async getEntryResponse(responseId) {
        return this.getDocument(this.collections.ENTRY_RESPONSES, responseId);
    }

    async createEntryResponse(data) {
        return this.createDocument(this.collections.ENTRY_RESPONSES, data);
    }

    async updateEntryResponse(responseId, data) {
        return this.updateDocument(this.collections.ENTRY_RESPONSES, responseId, data);
    }

    async deleteEntryResponse(responseId) {
        return this.deleteDocument(this.collections.ENTRY_RESPONSES, responseId);
    }

    // Audit log operations
    async getAuditLogs(filters = {}) {
        let logs = await this.listDocuments(this.collections.AUDIT_LOG);
        
        // Apply filters manually
        if (filters.actionType) {
            logs = logs.filter(log => log.action_type === filters.actionType);
        }
        
        if (filters.performedBy) {
            logs = logs.filter(log => log.performed_by === filters.performedBy);
        }
        
        if (filters.dateFrom) {
            logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.dateFrom));
        }
        
        if (filters.dateTo) {
            logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.dateTo));
        }
        
        // Sort by timestamp descending
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return logs;
    }

    async createAuditLog(data) {
        return this.createDocument(this.collections.AUDIT_LOG, data);
    }

    // Storage operations
    async uploadFile(bucketId, file, fileId = null) {
        try {
            return await this.storage.createFile(
                bucketId,
                fileId || ID.unique(),
                file
            );
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    async getFile(bucketId, fileId) {
        try {
            return await this.storage.getFile(bucketId, fileId);
        } catch (error) {
            console.error('Error getting file:', error);
            throw error;
        }
    }

    async getFilePreview(bucketId, fileId) {
        try {
            return this.storage.getFilePreview(bucketId, fileId);
        } catch (error) {
            console.error('Error getting file preview:', error);
            throw error;
        }
    }

    async deleteFile(bucketId, fileId) {
        try {
            return await this.storage.deleteFile(bucketId, fileId);
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    // Function operations
    async executeFunction(functionId, data = {}) {
        try {
            return await this.functions.createExecution(functionId, data);
        } catch (error) {
            console.error('Error executing function:', error);
            throw error;
        }
    }
}

// Create global API client instance
const apiClient = new ApiClient();