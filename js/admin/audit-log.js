// Audit Log Handler
class AuditLogHandler {
    constructor() {
        this.actionFilter = document.getElementById('audit-action-filter');
        this.dateFromFilter = document.getElementById('audit-date-from');
        this.dateToFilter = document.getElementById('audit-date-to');
        this.init();
    }

    init() {
        // Setup filters
        this.setupFilters();

        // Populate action filter
        this.populateActionFilter();
    }

    setupFilters() {
        if (this.actionFilter) {
            this.actionFilter.addEventListener('change', () => this.filterAuditLogs());
        }

        if (this.dateFromFilter) {
            this.dateFromFilter.addEventListener('change', () => this.filterAuditLogs());
        }

        if (this.dateToFilter) {
            this.dateToFilter.addEventListener('change', () => this.filterAuditLogs());
        }
    }

    populateActionFilter() {
        if (!this.actionFilter) return;

        const actions = [
            'entry_submitted',
            'entry_unlocked',
            'user_assigned',
            'user_created',
            'user_removed',
            'page_created',
            'page_deleted',
            'notebook_created',
            'notebook_published',
            'group_created',
            'settings_updated'
        ];

        actions.forEach(action => {
            const option = DomUtils.createElement('option', { value: action }, 
                action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            );
            this.actionFilter.appendChild(option);
        });
    }

    async filterAuditLogs() {
        try {
            const actionType = this.actionFilter ? this.actionFilter.value : '';
            const dateFrom = this.dateFromFilter ? this.dateFromFilter.value : '';
            const dateTo = this.dateToFilter ? this.dateToFilter.value : '';

            const filters = {};
            
            if (actionType) {
                filters.actionType = actionType;
            }
            
            if (dateFrom) {
                filters.dateFrom = new Date(dateFrom).toISOString();
            }
            
            if (dateTo) {
                filters.dateTo = new Date(dateTo).toISOString();
            }

            const auditLogs = await apiClient.getAuditLogs(filters);
            this.renderAuditLogs(auditLogs);

        } catch (error) {
            console.error('Error filtering audit logs:', error);
            DomUtils.showToast('Error filtering audit logs', 'error');
        }
    }

    renderAuditLogs(auditLogs) {
        const auditLogList = document.getElementById('audit-log-list');
        if (!auditLogList) return;

        DomUtils.clear(auditLogList);

        if (auditLogs.length === 0) {
            adminDashboard.renderEmptyState(auditLogList, 'No audit logs found', 'Try adjusting your filters');
            return;
        }

        const table = DomUtils.createElement('table', { className: 'table' }, [
            DomUtils.createElement('thead', {}, [
                DomUtils.createElement('tr', {}, [
                    DomUtils.createElement('th', {}, 'Timestamp'),
                    DomUtils.createElement('th', {}, 'Action'),
                    DomUtils.createElement('th', {}, 'Performed By'),
                    DomUtils.createElement('th', {}, 'Resource'),
                    DomUtils.createElement('th', {}, 'Details')
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
            }, this.formatActionType(log.action_type))),
            DomUtils.createElement('td', {}, log.performed_by),
            DomUtils.createElement('td', {}, `${log.resource_type}: ${log.resource_name}`),
            DomUtils.createElement('td', {}, this.formatDetails(log.details))
        ]);
    }

    formatActionType(actionType) {
        return actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    formatDetails(details) {
        if (!details) return '-';
        
        try {
            if (typeof details === 'string') {
                const parsed = JSON.parse(details);
                return JSON.stringify(parsed, null, 2).substring(0, 100) + '...';
            }
            return JSON.stringify(details, null, 2).substring(0, 100) + '...';
        } catch (error) {
            return String(details).substring(0, 100) + '...';
        }
    }

    async createAuditLogEntry(actionType, resourceType, resourceId, resourceName, details = {}) {
        try {
            const user = authManager.getCurrentUser();
            
            const logData = {
                action_type: actionType,
                performed_by: user ? (user.name || user.email || user.id) : 'system',
                resource_type: resourceType,
                resource_id: resourceId,
                resource_name: resourceName,
                timestamp: new Date().toISOString(),
                details: JSON.stringify(details)
            };

            await apiClient.createAuditLog(logData);

        } catch (error) {
            console.error('Error creating audit log entry:', error);
        }
    }
}

// Initialize when DOM is ready
let auditLog;
document.addEventListener('DOMContentLoaded', () => {
    auditLog = new AuditLogHandler();
});