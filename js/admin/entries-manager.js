// Entries Manager Handler
class EntriesManager {
    constructor() {
        this.notebookFilter = document.getElementById('entry-notebook-filter');
        this.statusFilter = document.getElementById('entry-status-filter');
        this.searchInput = document.getElementById('entry-search');
        this.init();
    }

    init() {
        // Setup filters
        this.setupFilters();

        // Setup entry list click handlers
        this.setupEntryHandlers();
    }

    setupFilters() {
        if (this.notebookFilter) {
            this.notebookFilter.addEventListener('change', () => this.filterEntries());
        }

        if (this.statusFilter) {
            this.statusFilter.addEventListener('change', () => this.filterEntries());
        }

        if (this.searchInput) {
            this.searchInput.addEventListener('input', DomUtils.debounce(() => this.filterEntries(), 300));
        }
    }

    setupEntryHandlers() {
        // Entry action buttons are handled in admin-dashboard.js
        // This is for additional entry-specific functionality
    }

    async filterEntries() {
        try {
            const notebookId = this.notebookFilter ? this.notebookFilter.value : '';
            const status = this.statusFilter ? this.statusFilter.value : '';
            const searchTerm = this.searchInput ? this.searchInput.value.toLowerCase() : '';

            let entries = await apiClient.getEntries(notebookId);

            // Filter by status
            if (status) {
                entries = entries.filter(entry => {
                    if (status === 'locked') return entry.is_locked;
                    if (status === 'unlocked') return !entry.is_locked;
                    return true;
                });
            }

            // Filter by search term
            if (searchTerm) {
                const users = await apiClient.getUsers();
                entries = entries.filter(entry => {
                    const user = users.find(u => u.$id === entry.user_id);
                    return user && user.first_name.toLowerCase().includes(searchTerm);
                });
            }

            // Render filtered entries
            this.renderEntries(entries);

        } catch (error) {
            console.error('Error filtering entries:', error);
            DomUtils.showToast('Error filtering entries', 'error');
        }
    }

    renderEntries(entries) {
        const entriesList = document.getElementById('entries-list');
        if (!entriesList) return;

        DomUtils.clear(entriesList);

        if (entries.length === 0) {
            adminDashboard.renderEmptyState(entriesList, 'No entries found', 'Try adjusting your filters');
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
                DomUtils.createElement('button', { 
                    className: 'btn btn-sm btn-warning',
                    dataset: { action: entry.is_locked ? 'unlock' : 'lock', entryId: entry.$id }
                }, entry.is_locked ? 'Unlock' : 'Lock'),
                DomUtils.createElement('button', { 
                    className: 'btn btn-sm btn-danger',
                    dataset: { action: 'delete', entryId: entry.$id }
                }, 'Delete')
            ])
        ]);
    }

    async viewEntry(entryId) {
        try {
            const entry = await apiClient.getEntry(entryId);
            const user = await apiClient.getUser(entry.user_id);
            const page = await apiClient.getPage(entry.page_id);
            const responses = await apiClient.getEntryResponses(entryId);

            this.showEntryDetails(entry, user, page, responses);

        } catch (error) {
            console.error('Error viewing entry:', error);
            DomUtils.showToast('Error loading entry details', 'error');
        }
    }

    showEntryDetails(entry, user, page, responses) {
        const modal = document.getElementById('entry-details-modal');
        const content = document.getElementById('entry-details-content');

        if (!modal || !content) return;

        // Build entry details HTML
        let html = `
            <div class="entry-header">
                <div class="entry-info">
                    <h3>${user ? user.first_name : 'Unknown'}'s Entry</h3>
                    <p>${page ? page.title : 'Unknown Page'} | ${DomUtils.formatDate(entry.submission_date, 'datetime')}</p>
                </div>
                <span class="entry-status ${entry.is_locked ? 'locked' : 'unlocked'}">
                    ${entry.is_locked ? 'Locked' : 'Unlocked'}
                </span>
            </div>
        `;

        // Add page content
        html += `<div class="entry-page">`;
        html += `<h4>${page ? page.title : 'Page'}</h4>`;

        if (page && page.page_type === 'template') {
            // Show template page responses
            responses.forEach(response => {
                if (response.response_type !== 'signature') {
                    html += `
                        <div class="page-response">
                            <div class="response-label">${response.question_text || 'Question'}</div>
                            <div class="response-value">${response.response_value || 'No answer'}</div>
                        </div>
                    `;
                }
            });
        } else {
            // Show content page content
            html += `<div class="response-value">${page ? page.content : 'No content'}</div>`;
        }

        // Show signature
        const signatureResponse = responses.find(r => r.response_type === 'signature');
        if (signatureResponse && signatureResponse.signature_file_id) {
            html += `
                <div class="signature-display">
                    <p><strong>Signature:</strong></p>
                    <img src="${apiClient.getFilePreviewUrl(BUCKETS.SIGNATURES, signatureResponse.signature_file_id)}" alt="Signature" />
                </div>
            `;
        }

        html += `</div>`;

        content.innerHTML = html;

        // Setup action buttons
        const unlockBtn = document.getElementById('unlock-entry-btn');
        const exportBtn = document.getElementById('export-pdf-btn');
        const deleteBtn = document.getElementById('delete-entry-btn');

        if (unlockBtn) {
            unlockBtn.classList.toggle('hidden', !entry.is_locked);
            unlockBtn.onclick = () => this.unlockEntry(entryId);
        }

        if (exportBtn) {
            exportBtn.onclick = () => this.exportEntryPDF(entryId);
        }

        if (deleteBtn) {
            deleteBtn.classList.remove('hidden');
            deleteBtn.onclick = () => this.deleteEntry(entryId);
        }

        DomUtils.show(modal);
    }

    async unlockEntry(entryId) {
        try {
            await apiClient.updateEntry(entryId, {
                is_locked: false,
                unlocked_at: new Date().toISOString(),
                submission_status: 'unlocked'
            });

            DomUtils.showToast('Entry unlocked successfully', 'success');
            DomUtils.hide('#entry-details-modal');
            
            // Reload entries
            if (typeof adminDashboard !== 'undefined') {
                await adminDashboard.loadEntries();
            }

        } catch (error) {
            console.error('Error unlocking entry:', error);
            DomUtils.showToast('Error unlocking entry', 'error');
        }
    }

    async lockEntry(entryId) {
        try {
            await apiClient.updateEntry(entryId, {
                is_locked: true,
                submission_status: 'locked'
            });

            DomUtils.showToast('Entry locked successfully', 'success');
            
            // Reload entries
            if (typeof adminDashboard !== 'undefined') {
                await adminDashboard.loadEntries();
            }

        } catch (error) {
            console.error('Error locking entry:', error);
            DomUtils.showToast('Error locking entry', 'error');
        }
    }

    async deleteEntry(entryId) {
        DomUtils.showConfirmation(
            'Are you sure you want to delete this entry? All data and files will be permanently deleted.',
            async () => {
                try {
                    // Get entry responses to delete associated files
                    const responses = await apiClient.getEntryResponses(entryId);
                    
                    // Delete associated files
                    for (const response of responses) {
                        if (response.image_file_id) {
                            await apiClient.deleteFile(BUCKETS.ENTRY_IMAGES, response.image_file_id);
                        }
                        if (response.signature_file_id) {
                            await apiClient.deleteFile(BUCKETS.SIGNATURES, response.signature_file_id);
                        }
                    }

                    // Delete entry responses
                    for (const response of responses) {
                        await apiClient.deleteEntryResponse(response.$id);
                    }

                    // Delete entry
                    await apiClient.deleteEntry(entryId);

                    DomUtils.showToast('Entry deleted successfully', 'success');
                    DomUtils.hide('#entry-details-modal');
                    
                    // Reload entries
                    if (typeof adminDashboard !== 'undefined') {
                        await adminDashboard.loadEntries();
                    }

                } catch (error) {
                    console.error('Error deleting entry:', error);
                    DomUtils.showToast('Error deleting entry', 'error');
                }
            }
        );
    }

    async exportEntryPDF(entryId) {
        try {
            DomUtils.showLoading(document.getElementById('export-pdf-btn'), 'Generating PDF...');

            const entry = await apiClient.getEntry(entryId);
            const user = await apiClient.getUser(entry.user_id);
            const notebook = await apiClient.getNotebook(entry.notebook_id);
            const pages = await apiClient.getPages(entry.notebook_id);
            const entries = await apiClient.getUserEntries(entry.user_id);

            // Generate PDF
            const pdfBlob = await pdfGenerator.generateNotebookPDF(notebook, user, entries, pages);
            
            // Download PDF
            const filename = pdfGenerator.generateFilename(
                notebook.title,
                user.first_name,
                new Date(entry.submission_date)
            );
            
            pdfGenerator.downloadPDF(pdfBlob, filename);

            DomUtils.hideLoading(document.getElementById('export-pdf-btn'));
            DomUtils.showToast('PDF exported successfully', 'success');

        } catch (error) {
            console.error('Error exporting PDF:', error);
            DomUtils.hideLoading(document.getElementById('export-pdf-btn'));
            DomUtils.showToast('Error exporting PDF', 'error');
        }
    }
}

// Initialize when DOM is ready
let entriesManager;
document.addEventListener('DOMContentLoaded', () => {
    entriesManager = new EntriesManager();
});