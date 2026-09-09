// Page Builder Handler
class PageBuilder {
    constructor() {
        this.elementsList = document.getElementById('elements-list');
        this.elementButtons = document.querySelectorAll('.element-actions button');
        this.currentElements = [];
        this.init();
    }

    init() {
        // Setup element buttons
        this.setupElementButtons();

        // Setup drag and drop for elements
        this.setupElementDragAndDrop();
    }

    setupElementButtons() {
        this.elementButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const elementType = e.target.dataset.elementType;
                this.addElement(elementType);
            });
        });
    }

    setupElementDragAndDrop() {
        if (this.elementsList && typeof Sortable !== 'undefined') {
            new Sortable(this.elementsList, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                onEnd: async (evt) => {
                    await this.updateElementOrder();
                }
            });
        }
    }

    async loadPage(page) {
        try {
            this.currentElements = await apiClient.getPageElements(page.$id);
            this.renderElements();
        } catch (error) {
            console.error('Error loading page elements:', error);
            this.currentElements = [];
        }
    }

    renderElements() {
        if (!this.elementsList) return;

        DomUtils.clear(this.elementsList);

        this.currentElements.forEach(element => {
            const elementItem = this.createElementItem(element);
            this.elementsList.appendChild(elementItem);
        });
    }

    createElementItem(element) {
        const itemType = this.getElementTypeLabel(element.element_type);

        const item = DomUtils.createElement('div', {
            className: 'element-item',
            dataset: { elementId: element.$id }
        }, [
            DomUtils.createElement('div', { className: 'element-header' }, [
                DomUtils.createElement('span', { className: 'element-type' }, itemType),
                DomUtils.createElement('div', { className: 'element-actions' }, [
                    DomUtils.createElement('button', { 
                        className: 'btn btn-sm btn-secondary',
                        dataset: { action: 'edit', elementId: element.$id }
                    }, '✎'),
                    DomUtils.createElement('button', { 
                        className: 'btn btn-sm btn-danger',
                        dataset: { action: 'delete', elementId: element.$id }
                    }, '✕')
                ])
            ]),
            DomUtils.createElement('div', { className: 'element-config' }, this.renderElementConfig(element))
        ]);

        // Add action button listeners
        item.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = e.target.dataset.action;
                const elementId = e.target.dataset.elementId;
                this.handleElementAction(action, elementId);
            });
        });

        return item;
    }

    getElementTypeLabel(type) {
        const labels = {
            'question': 'Question',
            'image_upload': 'Image Upload',
            'text': 'Text Section',
            'divider': 'Divider',
            'spacing': 'Spacing'
        };
        return labels[type] || type;
    }

    renderElementConfig(element) {
        switch (element.element_type) {
            case 'question':
                return this.renderQuestionConfig(element);
            case 'image_upload':
                return this.renderImageUploadConfig(element);
            case 'text':
                return this.renderTextConfig(element);
            case 'divider':
                return '<p>Horizontal divider</p>';
            case 'spacing':
                return '<p>Vertical spacing</p>';
            default:
                return '<p>Unknown element type</p>';
        }
    }

    renderQuestionConfig(element) {
        return DomUtils.createElement('div', {}, [
            DomUtils.createElement('p', {}, element.question_text || 'Untitled Question'),
            DomUtils.createElement('p', { className: 'text-muted' }, 
                `Type: ${element.field_type || 'text'} | Required: ${element.required ? 'Yes' : 'No'}`
            )
        ]);
    }

    renderImageUploadConfig(element) {
        return DomUtils.createElement('div', {}, [
            DomUtils.createElement('p', {}, element.image_label || 'Image Upload'),
            DomUtils.createElement('p', { className: 'text-muted' }, 
                `Max size: ${element.max_file_size_mb || 10}MB | Required: ${element.image_required ? 'Yes' : 'No'}`
            )
        ]);
    }

    renderTextConfig(element) {
        return DomUtils.createElement('div', {}, [
            DomUtils.createElement('p', {}, element.text_content?.substring(0, 100) + '...' || 'Text content'),
            DomUtils.createElement('p', { className: 'text-muted' }, 
                `Style: ${element.text_style || 'paragraph'}`
            )
        ]);
    }

    async addElement(elementType) {
        if (!notebookEditor.currentPage) {
            DomUtils.showToast('Please select a page first', 'warning');
            return;
        }

        try {
            const elementData = {
                page_id: notebookEditor.currentPage.$id,
                element_type: elementType,
                order_position: this.currentElements.length
            };

            // Add default values based on element type
            switch (elementType) {
                case 'question':
                    elementData.question_text = 'New Question';
                    elementData.field_type = 'text';
                    elementData.required = true;
                    break;
                case 'image_upload':
                    elementData.image_label = 'Upload Image';
                    elementData.image_required = false;
                    elementData.max_file_size_mb = 10;
                    break;
                case 'text':
                    elementData.text_content = 'Enter your text here';
                    elementData.text_style = 'paragraph';
                    break;
            }

            const newElement = await apiClient.createPageElement(elementData);
            this.currentElements.push(newElement);
            this.renderElements();

            DomUtils.showToast('Element added successfully', 'success');

        } catch (error) {
            console.error('Error adding element:', error);
            DomUtils.showToast('Error adding element', 'error');
        }
    }

    async handleElementAction(action, elementId) {
        switch (action) {
            case 'edit':
                this.editElement(elementId);
                break;
            case 'delete':
                this.deleteElement(elementId);
                break;
        }
    }

    editElement(elementId) {
        const element = this.currentElements.find(e => e.$id === elementId);
        if (!element) return;

        // Create edit modal (simplified for now)
        const newValue = prompt('Enter new value:', 
            element.question_text || element.image_label || element.text_content || '');
        
        if (newValue !== null) {
            this.updateElement(elementId, newValue);
        }
    }

    async updateElement(elementId, newValue) {
        try {
            const element = this.currentElements.find(e => e.$id === elementId);
            if (!element) return;

            const updateData = {};

            switch (element.element_type) {
                case 'question':
                    updateData.question_text = newValue;
                    break;
                case 'image_upload':
                    updateData.image_label = newValue;
                    break;
                case 'text':
                    updateData.text_content = newValue;
                    break;
            }

            await apiClient.updatePageElement(elementId, updateData);
            
            // Update local element
            Object.assign(element, updateData);
            
            this.renderElements();
            DomUtils.showToast('Element updated successfully', 'success');

        } catch (error) {
            console.error('Error updating element:', error);
            DomUtils.showToast('Error updating element', 'error');
        }
    }

    async deleteElement(elementId) {
        DomUtils.showConfirmation(
            'Are you sure you want to delete this element?',
            async () => {
                try {
                    await apiClient.deletePageElement(elementId);
                    
                    // Remove from local array
                    this.currentElements = this.currentElements.filter(e => e.$id !== elementId);
                    
                    this.renderElements();
                    DomUtils.showToast('Element deleted successfully', 'success');

                } catch (error) {
                    console.error('Error deleting element:', error);
                    DomUtils.showToast('Error deleting element', 'error');
                }
            }
        );
    }

    async updateElementOrder() {
        const elementItems = this.elementsList.querySelectorAll('.element-item');
        const newOrder = [];

        elementItems.forEach((item, index) => {
            const elementId = item.dataset.elementId;
            const element = this.currentElements.find(e => e.$id === elementId);
            if (element) {
                element.order_position = index;
                newOrder.push(element);
            }
        });

        // Update all elements
        for (const element of newOrder) {
            try {
                await apiClient.updatePageElement(element.$id, { order_position: element.order_position });
            } catch (error) {
                console.error('Error updating element order:', error);
            }
        }
    }
}

// Initialize when DOM is ready
let pageBuilder;
document.addEventListener('DOMContentLoaded', () => {
    pageBuilder = new PageBuilder();
});