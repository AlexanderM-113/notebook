// Notebook Editor Handler
class NotebookEditor {
    constructor() {
        this.modal = document.getElementById('notebook-editor-modal');
        this.notebookTitle = document.getElementById('editor-notebook-title');
        this.sidebarTitle = document.getElementById('sidebar-notebook-title');
        this.groupIndicator = document.getElementById('sidebar-group-indicator');
        this.pagesList = document.getElementById('pages-list');
        this.pageTitleInput = document.getElementById('page-title-input');
        this.pageNumberDisplay = document.getElementById('page-number-display');
        this.pageTypeDisplay = document.getElementById('page-type-display');
        this.currentNotebook = null;
        this.currentPage = null;
        this.pages = [];
        this.currentTab = 'template-pages';
        this.init();
    }

    init() {
        // Setup sidebar tabs
        this.setupSidebarTabs();

        // Setup page actions
        this.setupPageActions();

        // Setup page configuration
        this.setupPageConfig();

        // Setup close modal
        this.setupCloseModal();

        // Setup page list drag and drop
        this.setupDragAndDrop();
    }

    setupSidebarTabs() {
        const tabButtons = this.modal.querySelectorAll('.sidebar-tabs .tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchSidebarTab(tab);
            });
        });
    }

    switchSidebarTab(tab) {
        const tabButtons = this.modal.querySelectorAll('.sidebar-tabs .tab-btn');
        tabButtons.forEach(btn => {
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        this.currentTab = tab;
        this.renderPagesList();
    }

    setupPageActions() {
        // Add template page button
        const addTemplateBtn = document.getElementById('add-template-page');
        if (addTemplateBtn) {
            addTemplateBtn.addEventListener('click', () => this.addNewPage('template'));
        }

        // Add content page button
        const addContentBtn = document.getElementById('add-content-page');
        if (addContentBtn) {
            addContentBtn.addEventListener('click', () => this.addNewPage('content'));
        }

        // Save page button
        const savePageBtn = document.getElementById('save-page');
        if (savePageBtn) {
            savePageBtn.addEventListener('click', () => this.saveCurrentPage());
        }

        // Preview page button
        const previewPageBtn = document.getElementById('preview-page');
        if (previewPageBtn) {
            previewPageBtn.addEventListener('click', () => this.previewCurrentPage());
        }

        // Publish notebook button
        const publishBtn = document.getElementById('publish-notebook-btn');
        if (publishBtn) {
            publishBtn.addEventListener('click', () => this.publishNotebook());
        }
    }

    setupPageConfig() {
        // Page title input
        if (this.pageTitleInput) {
            this.pageTitleInput.addEventListener('input', () => {
                if (this.currentPage) {
                    this.currentPage.title = this.pageTitleInput.value;
                }
            });
        }
    }

    setupCloseModal() {
        const closeButtons = this.modal.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                DomUtils.hide(this.modal);
            });
        });
    }

    setupDragAndDrop() {
        if (this.pagesList && typeof Sortable !== 'undefined') {
            new Sortable(this.pagesList, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                onEnd: async (evt) => {
                    await this.updatePageOrder();
                }
            });
        }
    }

    async load(notebookId) {
        try {
            // Load notebook
            this.currentNotebook = await apiClient.getNotebook(notebookId);
            
            // Update UI
            if (this.notebookTitle) {
                this.notebookTitle.textContent = this.currentNotebook.title || 'Notebook Editor';
            }

            if (this.sidebarTitle) {
                this.sidebarTitle.textContent = this.currentNotebook.title || 'Notebook';
            }

            // Load group info
            if (this.currentNotebook.group_id) {
                const group = await apiClient.getGroup(this.currentNotebook.group_id);
                if (this.groupIndicator && group) {
                    this.groupIndicator.textContent = `Assigned to ${group.name}`;
                }
            }

            // Load pages
            await this.loadPages();

            // Select first page if available
            if (this.pages.length > 0) {
                this.selectPage(this.pages[0]);
            }

        } catch (error) {
            console.error('Error loading notebook:', error);
            DomUtils.showToast('Error loading notebook', 'error');
        }
    }

    async loadPages() {
        try {
            this.pages = await apiClient.getPages(this.currentNotebook.$id);
            this.renderPagesList();
        } catch (error) {
            console.error('Error loading pages:', error);
            this.pages = [];
        }
    }

    renderPagesList() {
        if (!this.pagesList) return;

        DomUtils.clear(this.pagesList);

        const filteredPages = this.pages.filter(page => {
            if (this.currentTab === 'template-pages') {
                return page.page_type === 'template';
            } else {
                return page.page_type === 'content';
            }
        });

        filteredPages.forEach(page => {
            const pageItem = this.createPageItem(page);
            this.pagesList.appendChild(pageItem);
        });
    }

    createPageItem(page) {
        const isActive = this.currentPage && this.currentPage.$id === page.$id;
        const icon = page.page_type === 'template' ? '📝' : '📄';

        const item = DomUtils.createElement('div', {
            className: `page-item ${isActive ? 'active' : ''}`,
            dataset: { pageId: page.$id }
        }, [
            DomUtils.createElement('div', { className: 'page-info' }, [
                DomUtils.createElement('div', { className: 'page-title' }, page.title || 'Untitled'),
                DomUtils.createElement('div', { className: 'page-number' }, `Page ${page.page_number}`)
            ]),
            DomUtils.createElement('div', { className: 'page-actions' }, [
                DomUtils.createElement('button', { 
                    className: 'btn btn-sm btn-secondary',
                    dataset: { action: 'edit', pageId: page.$id }
                }, '✎'),
                DomUtils.createElement('button', { 
                    className: 'btn btn-sm btn-danger',
                    dataset: { action: 'delete', pageId: page.$id }
                }, '✕')
            ])
        ]);

        item.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                this.selectPage(page);
            }
        });

        // Add action button listeners
        item.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = e.target.dataset.action;
                const pageId = e.target.dataset.pageId;
                this.handlePageAction(action, pageId);
            });
        });

        return item;
    }

    selectPage(page) {
        this.currentPage = page;

        // Update UI
        if (this.pageTitleInput) {
            this.pageTitleInput.value = page.title || '';
        }

        if (this.pageNumberDisplay) {
            this.pageNumberDisplay.textContent = `Page ${page.page_number}`;
        }

        if (this.pageTypeDisplay) {
            this.pageTypeDisplay.textContent = page.page_type === 'template' ? 'Template Page' : 'Content Page';
        }

        // Update page config
        this.updatePageConfig(page);

        // Show/hide element builder based on page type
        const elementsBuilder = document.getElementById('elements-builder');
        const contentEditor = document.getElementById('content-editor');

        if (page.page_type === 'template') {
            DomUtils.show(elementsBuilder);
            DomUtils.hide(contentEditor);
        } else {
            DomUtils.hide(elementsBuilder);
            DomUtils.show(contentEditor);
        }

        // Re-render pages list to update active state
        this.renderPagesList();

        // Load page elements if template page
        if (page.page_type === 'template' && typeof pageBuilder !== 'undefined') {
            pageBuilder.loadPage(page);
        }

        // Load content if content page
        if (page.page_type === 'content') {
            const richTextEditor = document.getElementById('rich-text-editor');
            if (richTextEditor) {
                richTextEditor.innerHTML = page.content || '';
            }
        }
    }

    updatePageConfig(page) {
        // Update page configuration fields
        const bgColor = document.getElementById('page-bg-color');
        if (bgColor) {
            bgColor.value = page.background_color || '#ffffff';
        }

        const fontFamily = document.getElementById('page-font-family');
        if (fontFamily) {
            fontFamily.value = page.font_family || 'Arial';
        }

        const fontSize = document.getElementById('page-font-size');
        if (fontSize) {
            fontSize.value = page.font_size || 16;
        }

        const requiresSignature = document.getElementById('page-requires-signature');
        if (requiresSignature) {
            requiresSignature.checked = page.requires_signature !== false;
        }
    }

    async addNewPage(pageType) {
        try {
            const pageNumber = this.pages.length + 1;

            const pageData = {
                notebook_id: this.currentNotebook.$id,
                page_number: pageNumber,
                title: `New ${pageType === 'template' ? 'Template' : 'Content'} Page`,
                page_type: pageType,
                order_position: this.pages.length,
                requires_signature: true
            };

            const newPage = await apiClient.createPage(pageData);
            this.pages.push(newPage);
            
            // Switch to appropriate tab
            this.switchSidebarTab(pageType === 'template' ? 'template-pages' : 'content-pages');
            
            // Select the new page
            this.selectPage(newPage);

            DomUtils.showToast('Page created successfully', 'success');

        } catch (error) {
            console.error('Error creating page:', error);
            DomUtils.showToast('Error creating page', 'error');
        }
    }

    async saveCurrentPage() {
        if (!this.currentPage) return;

        try {
            const updateData = {
                title: this.pageTitleInput.value || 'Untitled',
                background_color: document.getElementById('page-bg-color').value,
                font_family: document.getElementById('page-font-family').value,
                font_size: parseInt(document.getElementById('page-font-size').value),
                requires_signature: document.getElementById('page-requires-signature').checked
            };

            // Add content for content pages
            if (this.currentPage.page_type === 'content') {
                const richTextEditor = document.getElementById('rich-text-editor');
                if (richTextEditor) {
                    updateData.content = richTextEditor.innerHTML;
                }
            }

            await apiClient.updatePage(this.currentPage.$id, updateData);
            
            // Update local page data
            this.currentPage = { ...this.currentPage, ...updateData };
            
            // Update pages list
            this.renderPagesList();

            DomUtils.showToast('Page saved successfully', 'success');

        } catch (error) {
            console.error('Error saving page:', error);
            DomUtils.showToast('Error saving page', 'error');
        }
    }

    previewCurrentPage() {
        // Open preview modal or switch to preview mode
        DomUtils.showToast('Preview feature coming soon', 'info');
    }

    async handlePageAction(action, pageId) {
        switch (action) {
            case 'edit':
                const page = this.pages.find(p => p.$id === pageId);
                if (page) {
                    this.selectPage(page);
                }
                break;
            case 'delete':
                this.deletePage(pageId);
                break;
        }
    }

    async deletePage(pageId) {
        DomUtils.showConfirmation(
            'Are you sure you want to delete this page? All elements and entry data will be permanently deleted.',
            async () => {
                try {
                    await apiClient.deletePage(pageId);
                    
                    // Remove from local array
                    this.pages = this.pages.filter(p => p.$id !== pageId);
                    
                    // Clear current page if it was deleted
                    if (this.currentPage && this.currentPage.$id === pageId) {
                        this.currentPage = null;
                    }
                    
                    // Re-render pages list
                    this.renderPagesList();
                    
                    // Select first page if available
                    if (this.pages.length > 0 && !this.currentPage) {
                        this.selectPage(this.pages[0]);
                    }

                    DomUtils.showToast('Page deleted successfully', 'success');

                } catch (error) {
                    console.error('Error deleting page:', error);
                    DomUtils.showToast('Error deleting page', 'error');
                }
            }
        );
    }

    async updatePageOrder() {
        const pageItems = this.pagesList.querySelectorAll('.page-item');
        const newOrder = [];

        pageItems.forEach((item, index) => {
            const pageId = item.dataset.pageId;
            const page = this.pages.find(p => p.$id === pageId);
            if (page) {
                page.order_position = index;
                newOrder.push(page);
            }
        });

        // Update all pages
        for (const page of newOrder) {
            try {
                await apiClient.updatePage(page.$id, { order_position: page.order_position });
            } catch (error) {
                console.error('Error updating page order:', error);
            }
        }

        // Update page numbers
        await this.updatePageNumbers();
    }

    async updatePageNumbers() {
        for (let i = 0; i < this.pages.length; i++) {
            try {
                await apiClient.updatePage(this.pages[i].$id, { page_number: i + 1 });
                this.pages[i].page_number = i + 1;
            } catch (error) {
                console.error('Error updating page number:', error);
            }
        }

        this.renderPagesList();
    }

    async publishNotebook() {
        try {
            await apiClient.updateNotebook(this.currentNotebook.$id, { status: 'published' });
            this.currentNotebook.status = 'published';
            
            DomUtils.showToast('Notebook published successfully', 'success');
            
            // Reload admin dashboard to show updated status
            if (typeof adminDashboard !== 'undefined') {
                await adminDashboard.loadNotebooks();
            }

        } catch (error) {
            console.error('Error publishing notebook:', error);
            DomUtils.showToast('Error publishing notebook', 'error');
        }
    }
}

// Initialize when DOM is ready
let notebookEditor;
document.addEventListener('DOMContentLoaded', () => {
    notebookEditor = new NotebookEditor();
});