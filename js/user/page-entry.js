// Page Entry Handler
class PageEntry {
    constructor() {
        this.backButton = document.getElementById('back-to-dashboard');
        this.pageTitle = document.getElementById('page-title');
        this.pageNumber = document.getElementById('page-number');
        this.pageContent = document.getElementById('page-content');
        this.pageEntryForm = document.getElementById('page-entry-form');
        this.submitButton = document.getElementById('submit-page');
        this.currentPage = null;
        this.pageElements = [];
        this.formData = {};
        this.init();
    }

    init() {
        if (this.backButton) {
            this.backButton.addEventListener('click', this.handleBack.bind(this));
        }

        if (this.pageEntryForm) {
            this.pageEntryForm.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }

    async load(page) {
        try {
            this.currentPage = page;
            
            // Update page header
            if (this.pageTitle) {
                this.pageTitle.textContent = page.title || 'Untitled Page';
            }

            if (this.pageNumber) {
                this.pageNumber.textContent = `Page ${page.page_number}`;
            }

            // Load page elements
            await this.loadPageElements(page);

            // Render page content
            this.renderPageContent();

            // Initialize signature pad
            if (typeof signaturePad !== 'undefined') {
                signaturePad.init();
            }

        } catch (error) {
            console.error('Error loading page:', error);
            DomUtils.showToast('Error loading page', 'error');
        }
    }

    async loadPageElements(page) {
        try {
            if (page.page_type === 'template') {
                this.pageElements = await apiClient.getPageElements(page.$id);
                // Sort by order position
                this.pageElements.sort((a, b) => a.order_position - b.order_position);
            } else {
                this.pageElements = [];
            }
        } catch (error) {
            console.error('Error loading page elements:', error);
            this.pageElements = [];
        }
    }

    renderPageContent() {
        if (!this.pageContent) return;

        DomUtils.clear(this.pageContent);

        if (this.currentPage.page_type === 'template') {
            this.renderTemplatePage();
        } else {
            this.renderContentPage();
        }
    }

    renderTemplatePage() {
        this.pageElements.forEach((element, index) => {
            const elementContainer = this.createElementContainer(element, index);
            this.pageContent.appendChild(elementContainer);
        });
    }

    createElementContainer(element, index) {
        const container = DomUtils.createElement('div', {
            className: 'form-group',
            dataset: { elementId: element.$id, elementType: element.element_type }
        });

        switch (element.element_type) {
            case 'question':
                container.appendChild(this.createQuestionElement(element));
                break;
            case 'image_upload':
                container.appendChild(this.createImageUploadElement(element));
                break;
            case 'text':
                container.appendChild(this.createTextSection(element));
                break;
            case 'divider':
                container.appendChild(this.createDivider());
                break;
            case 'spacing':
                container.appendChild(this.createSpacing());
                break;
            default:
                console.warn('Unknown element type:', element.element_type);
        }

        return container;
    }

    createQuestionElement(element) {
        const label = DomUtils.createElement('label', {
            className: element.required ? 'required' : ''
        }, element.question_text || 'Question');

        let input;
        const fieldId = `field-${element.$id}`;

        switch (element.field_type) {
            case 'text':
                input = DomUtils.createElement('input', {
                    type: 'text',
                    id: fieldId,
                    name: element.$id,
                    placeholder: element.placeholder_text || '',
                    maxlength: element.max_characters,
                    required: element.required
                });
                break;
            case 'textarea':
                input = DomUtils.createElement('textarea', {
                    id: fieldId,
                    name: element.$id,
                    placeholder: element.placeholder_text || '',
                    maxlength: element.max_characters,
                    required: element.required,
                    style: `height: ${element.field_height || 120}px`
                });
                break;
            case 'numeric':
                input = DomUtils.createElement('input', {
                    type: 'number',
                    id: fieldId,
                    name: element.$id,
                    placeholder: element.placeholder_text || '',
                    min: element.min_value,
                    max: element.max_value,
                    required: element.required
                });
                break;
            default:
                input = DomUtils.createElement('input', {
                    type: 'text',
                    id: fieldId,
                    name: element.$id,
                    required: element.required
                });
        }

        // Add event listeners for validation
        input.addEventListener('input', () => this.handleFieldInput(input, element));
        input.addEventListener('blur', () => this.handleFieldBlur(input, element));

        const container = DomUtils.createElement('div');
        container.appendChild(label);
        container.appendChild(input);

        // Add character counter for text fields
        if (element.max_characters && (element.field_type === 'text' || element.field_type === 'textarea')) {
            const counter = DomUtils.createElement('div', { className: 'character-counter' }, '0/' + element.max_characters);
            container.appendChild(counter);
            input.dataset.counterId = `counter-${element.$id}`;
            counter.id = `counter-${element.$id}`;
        }

        // Add help text
        if (element.help_text) {
            const helpText = DomUtils.createElement('div', { className: 'help-text' }, element.help_text);
            container.appendChild(helpText);
        }

        return container;
    }

    createImageUploadElement(element) {
        const label = DomUtils.createElement('label', {
            className: element.image_required ? 'required' : ''
        }, element.image_label || 'Upload Image');

        const uploadBox = DomUtils.createElement('div', {
            className: 'image-upload-box',
            dataset: { elementId: element.$id }
        }, [
            DomUtils.createElement('div', { className: 'upload-icon' }, '📷'),
            DomUtils.createElement('div', { className: 'upload-text' }, 'Click to upload or drag and drop'),
            DomUtils.createElement('div', { className: 'upload-hint' }, `Max size: ${element.max_file_size_mb || 10}MB`),
            DomUtils.createElement('input', {
                type: 'file',
                accept: element.allowed_formats ? element.allowed_formats.join(',') : 'image/*',
                dataset: { elementId: element.$id }
            })
        ]);

        // Add event listeners
        uploadBox.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
                const fileInput = uploadBox.querySelector('input[type="file"]');
                fileInput.click();
            }
        });

        uploadBox.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadBox.classList.add('drag-over');
        });

        uploadBox.addEventListener('dragleave', () => {
            uploadBox.classList.remove('drag-over');
        });

        uploadBox.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadBox.classList.remove('drag-over');
            
            const file = e.dataTransfer.files[0];
            if (file) {
                this.handleImageUpload(file, element, uploadBox);
            }
        });

        const fileInput = uploadBox.querySelector('input[type="file"]');
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageUpload(file, element, uploadBox);
            }
        });

        const container = DomUtils.createElement('div');
        container.appendChild(label);
        container.appendChild(uploadBox);

        // Add description
        if (element.image_description) {
            const description = DomUtils.createElement('div', { className: 'help-text' }, element.image_description);
            container.appendChild(description);
        }

        return container;
    }

    createTextSection(element) {
        const textSection = DomUtils.createElement('div', {
            className: `text-section ${element.text_style || ''}`
        });

        if (element.text_content) {
            textSection.innerHTML = element.text_content;
        }

        return textSection;
    }

    createDivider() {
        return DomUtils.createElement('div', { className: 'divider' });
    }

    createSpacing() {
        return DomUtils.createElement('div', { className: 'spacing' });
    }

    renderContentPage() {
        const contentSection = DomUtils.createElement('div', { className: 'text-section' });
        
        if (this.currentPage.content) {
            contentSection.innerHTML = this.currentPage.content;
        }

        this.pageContent.appendChild(contentSection);
    }

    handleFieldInput(input, element) {
        // Update character counter
        if (input.dataset.counterId) {
            const counter = document.getElementById(input.dataset.counterId);
            if (counter && element.max_characters) {
                FormUtils.updateCharacterCounter(input, counter, element.max_characters);
            }
        }

        // Validate on input
        this.validateField(input, element);
    }

    handleFieldBlur(input, element) {
        this.validateField(input, element);
    }

    validateField(input, element) {
        const value = input.value;
        let isValid = true;

        // Check required
        if (element.required && !FormUtils.validateRequired(value)) {
            isValid = false;
        }

        // Check min/max for numeric
        if (element.field_type === 'numeric') {
            if (element.min_value !== undefined && parseFloat(value) < element.min_value) {
                isValid = false;
            }
            if (element.max_value !== undefined && parseFloat(value) > element.max_value) {
                isValid = false;
            }
        }

        // Check max length
        if (element.max_characters && value.length > element.max_characters) {
            isValid = false;
        }

        if (isValid) {
            FormUtils.showFieldSuccess(input);
        } else {
            FormUtils.showFieldError(input, 'Invalid value');
        }

        return isValid;
    }

    async handleImageUpload(file, element, uploadBox) {
        // Validate file
        const validation = StorageUtils.validateImageFile(
            file,
            element.max_file_size_mb || 10,
            element.allowed_formats || ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        );

        if (!validation.valid) {
            DomUtils.showToast(validation.error, 'error');
            return;
        }

        try {
            // Create preview
            StorageUtils.createImagePreview(file, (img, base64) => {
                // Clear upload box
                DomUtils.clear(uploadBox);
                
                // Add preview
                uploadBox.classList.add('has-file');
                uploadBox.appendChild(img);
                
                // Add file info
                const fileInfo = DomUtils.createElement('div', { className: 'image-info' }, 
                    `${file.name} (${StorageUtils.formatFileSize(file.size)})`
                );
                uploadBox.appendChild(fileInfo);
                
                // Add remove button
                const removeBtn = DomUtils.createElement('button', {
                    className: 'remove-image-btn'
                }, 'Remove');
                
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeImageUpload(element, uploadBox);
                });
                
                uploadBox.appendChild(removeBtn);
                
                // Store file data
                this.formData[element.$id] = {
                    type: 'image',
                    file: file,
                    base64: base64
                };
            });
        } catch (error) {
            console.error('Error creating image preview:', error);
            DomUtils.showToast('Error processing image', 'error');
        }
    }

    removeImageUpload(element, uploadBox) {
        // Remove from form data
        delete this.formData[element.$id];
        
        // Reset upload box
        DomUtils.clear(uploadBox);
        uploadBox.classList.remove('has-file');
        
        uploadBox.innerHTML = [
            DomUtils.createElement('div', { className: 'upload-icon' }, '📷'),
            DomUtils.createElement('div', { className: 'upload-text' }, 'Click to upload or drag and drop'),
            DomUtils.createElement('div', { className: 'upload-hint' }, `Max size: ${element.max_file_size_mb || 10}MB`),
            DomUtils.createElement('input', {
                type: 'file',
                accept: element.allowed_formats ? element.allowed_formats.join(',') : 'image/*',
                dataset: { elementId: element.$id }
            })
        ];

        // Re-attach event listeners
        const fileInput = uploadBox.querySelector('input[type="file"]');
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageUpload(file, element, uploadBox);
            }
        });
    }

    async handleSubmit(event) {
        event.preventDefault();

        try {
            // Validate all fields
            if (!this.validateForm()) {
                DomUtils.showToast('Please fix validation errors', 'error');
                return;
            }

            // Check signature
            if (typeof signaturePad !== 'undefined' && !signaturePad.isSigned()) {
                DomUtils.showToast('Please sign the page', 'error');
                return;
            }

            DomUtils.showLoading(this.submitButton, 'Submitting...');

            // Collect form data
            const formData = this.collectFormData();

            // Create entry
            const user = authManager.getCurrentUser();
            const entryData = {
                user_id: user.id,
                notebook_id: this.currentPage.notebook_id,
                page_id: this.currentPage.$id,
                group_id: user.groupId,
                submission_date: new Date().toISOString(),
                submission_day: new Date().toISOString().split('T')[0],
                is_locked: true,
                submission_status: 'submitted'
            };

            const entry = await apiClient.createEntry(entryData);

            // Create entry responses
            for (const [elementId, responseData] of Object.entries(formData)) {
                const responseValue = responseData.value || responseData.base64;
                const responseDataType = responseData.type;

                const response = await apiClient.createEntryResponse({
                    entry_id: entry.$id,
                    page_element_id: elementId,
                    response_type: responseDataType,
                    response_value: responseValue,
                    uploaded_at: new Date().toISOString()
                });

                // Upload image if needed
                if (responseDataType === 'image' && responseData.file) {
                    const filename = StorageUtils.generateFilename(responseData.file.name, `entry_${entry.$id}_`);
                    const uploadResult = await StorageUtils.uploadToStorage(
                        responseData.file,
                        BUCKETS.ENTRY_IMAGES,
                        null
                    );

                    if (uploadResult.success) {
                        await apiClient.updateEntryResponse(response.$id, {
                            image_file_id: uploadResult.fileId
                        });
                    }
                }
            }

            // Upload signature
            if (typeof signaturePad !== 'undefined') {
                const signatureFile = await signaturePad.getSignatureFile();
                const uploadResult = await StorageUtils.uploadToStorage(
                    signatureFile,
                    BUCKETS.SIGNATURES,
                    null
                );

                if (uploadResult.success) {
                    await apiClient.createEntryResponse({
                        entry_id: entry.$id,
                        response_type: 'signature',
                        signature_file_id: uploadResult.fileId,
                        uploaded_at: new Date().toISOString()
                    });
                }
            }

            // Update page assignment status
            const assignments = await apiClient.getPageAssignments(user.id);
            const assignment = assignments.find(a => a.page_id === this.currentPage.$id);
            if (assignment) {
                await apiClient.updatePageAssignment(assignment.$id, {
                    status: 'completed'
                });
            }

            DomUtils.hideLoading(this.submitButton);
            DomUtils.showToast('Page submitted successfully!', 'success');

            // Navigate back to dashboard
            setTimeout(() => {
                this.handleBack();
            }, 1500);

        } catch (error) {
            console.error('Error submitting page:', error);
            DomUtils.hideLoading(this.submitButton);
            DomUtils.showToast('Error submitting page', 'error');
        }
    }

    validateForm() {
        let isValid = true;

        // Validate all required fields
        this.pageElements.forEach(element => {
            if (element.element_type === 'question' && element.required) {
                const input = document.querySelector(`[name="${element.$id}"]`);
                if (input) {
                    if (!this.validateField(input, element)) {
                        isValid = false;
                    }
                }
            }

            if (element.element_type === 'image_upload' && element.image_required) {
                if (!this.formData[element.$id]) {
                    isValid = false;
                    const uploadBox = document.querySelector(`[data-element-id="${element.$id}"]`);
                    if (uploadBox) {
                        uploadBox.style.borderColor = '#e74c3c';
                    }
                }
            }
        });

        return isValid;
    }

    collectFormData() {
        const formData = {};

        // Collect text/numeric responses
        this.pageElements.forEach(element => {
            if (element.element_type === 'question') {
                const input = document.querySelector(`[name="${element.$id}"]`);
                if (input) {
                    formData[element.$id] = {
                        type: element.field_type === 'numeric' ? 'numeric' : 'text',
                        value: input.value
                    };
                }
            }
        });

        // Add image data
        Object.keys(this.formData).forEach(key => {
            formData[key] = this.formData[key];
        });

        return formData;
    }

    handleBack() {
        DomUtils.hide('#page-entry-screen');
        DomUtils.show('#user-dashboard');

        // Reload dashboard
        if (typeof userDashboard !== 'undefined') {
            userDashboard.load();
        }

        // Clear signature pad
        if (typeof signaturePad !== 'undefined') {
            signaturePad.clear();
        }
    }
}

// Initialize when DOM is ready
let pageEntry;
document.addEventListener('DOMContentLoaded', () => {
    pageEntry = new PageEntry();
});