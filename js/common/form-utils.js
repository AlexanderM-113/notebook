// Form Utilities - Helper functions for form handling and validation
class FormUtils {
    // Validate required field
    static validateRequired(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    }

    // Validate email
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Validate numeric range
    static validateNumericRange(value, min, max) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
    }

    // Validate string length
    static validateLength(value, min, max) {
        const length = value.toString().length;
        return length >= min && length <= max;
    }

    // Validate file type
    static validateFileType(file, allowedTypes) {
        if (!file) return false;
        const fileType = file.type;
        return allowedTypes.some(type => fileType.includes(type));
    }

    // Validate file size
    static validateFileSize(file, maxSizeMB) {
        if (!file) return false;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxSizeBytes;
    }

    // Show field error
    static showFieldError(field, message) {
        if (typeof field === 'string') {
            field = document.querySelector(field);
        }
        
        if (field) {
            field.classList.add('error');
            field.classList.remove('success');
            
            // Find or create error message element
            let errorElement = field.parentNode.querySelector('.field-error');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'field-error';
                errorElement.style.color = '#e74c3c';
                errorElement.style.fontSize = '12px';
                errorElement.style.marginTop = '5px';
                field.parentNode.appendChild(errorElement);
            }
            
            errorElement.textContent = message;
        }
    }

    // Clear field error
    static clearFieldError(field) {
        if (typeof field === 'string') {
            field = document.querySelector(field);
        }
        
        if (field) {
            field.classList.remove('error');
            
            const errorElement = field.parentNode.querySelector('.field-error');
            if (errorElement) {
                errorElement.remove();
            }
        }
    }

    // Show field success
    static showFieldSuccess(field) {
        if (typeof field === 'string') {
            field = document.querySelector(field);
        }
        
        if (field) {
            field.classList.add('success');
            field.classList.remove('error');
            this.clearFieldError(field);
        }
    }

    // Validate form
    static validateForm(form, rules) {
        let isValid = true;
        
        rules.forEach(rule => {
            const field = typeof rule.field === 'string' 
                ? form.querySelector(rule.field) 
                : rule.field;
            
            if (!field) return;
            
            const value = field.value;
            let fieldIsValid = true;
            let errorMessage = '';
            
            // Check required
            if (rule.required && !this.validateRequired(value)) {
                fieldIsValid = false;
                errorMessage = rule.message || 'This field is required';
            }
            
            // Check email
            if (fieldIsValid && rule.email && !this.validateEmail(value)) {
                fieldIsValid = false;
                errorMessage = rule.message || 'Please enter a valid email address';
            }
            
            // Check min length
            if (fieldIsValid && rule.minLength && !this.validateLength(value, rule.minLength, Infinity)) {
                fieldIsValid = false;
                errorMessage = rule.message || `Minimum ${rule.minLength} characters required`;
            }
            
            // Check max length
            if (fieldIsValid && rule.maxLength && !this.validateLength(value, 0, rule.maxLength)) {
                fieldIsValid = false;
                errorMessage = rule.message || `Maximum ${rule.maxLength} characters allowed`;
            }
            
            // Check numeric range
            if (fieldIsValid && rule.numeric && rule.min !== undefined && rule.max !== undefined) {
                if (!this.validateNumericRange(value, rule.min, rule.max)) {
                    fieldIsValid = false;
                    errorMessage = rule.message || `Value must be between ${rule.min} and ${rule.max}`;
                }
            }
            
            // Custom validation
            if (fieldIsValid && rule.validate && typeof rule.validate === 'function') {
                const customResult = rule.validate(value);
                if (customResult !== true) {
                    fieldIsValid = false;
                    errorMessage = customResult || rule.message || 'Invalid value';
                }
            }
            
            if (fieldIsValid) {
                this.showFieldSuccess(field);
            } else {
                this.showFieldError(field, errorMessage);
                isValid = false;
            }
        });
        
        return isValid;
    }

    // Get form data as object
    static getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        formData.forEach((value, key) => {
            // Handle multiple values for same key (checkboxes, etc.)
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        });
        
        return data;
    }

    // Set form data from object
    static setFormData(form, data) {
        Object.keys(data).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                if (field.type === 'checkbox' || field.type === 'radio') {
                    field.checked = data[key];
                } else {
                    field.value = data[key];
                }
            }
        });
    }

    // Reset form
    static resetForm(form) {
        if (typeof form === 'string') {
            form = document.querySelector(form);
        }
        
        if (form) {
            form.reset();
            
            // Clear all field errors and success states
            const fields = form.querySelectorAll('input, select, textarea');
            fields.forEach(field => {
                field.classList.remove('error', 'success');
                this.clearFieldError(field);
            });
        }
    }

    // Disable form
    static disableForm(form) {
        if (typeof form === 'string') {
            form = document.querySelector(form);
        }
        
        if (form) {
            const fields = form.querySelectorAll('input, select, textarea, button');
            fields.forEach(field => {
                field.disabled = true;
            });
        }
    }

    // Enable form
    static enableForm(form) {
        if (typeof form === 'string') {
            form = document.querySelector(form);
        }
        
        if (form) {
            const fields = form.querySelectorAll('input, select, textarea, button');
            fields.forEach(field => {
                field.disabled = false;
            });
        }
    }

    // Update character counter
    static updateCharacterCounter(field, counterElement, maxLength) {
        const currentLength = field.value.length;
        const remaining = maxLength - currentLength;
        
        counterElement.textContent = `${currentLength}/${maxLength}`;
        
        counterElement.classList.remove('warning', 'error');
        
        if (remaining < 0) {
            counterElement.classList.add('error');
        } else if (remaining < maxLength * 0.1) {
            counterElement.classList.add('warning');
        }
    }

    // Serialize form to JSON
    static serializeForm(form) {
        const data = this.getFormData(form);
        return JSON.stringify(data);
    }

    // Parse JSON to form data
    static parseToForm(form, jsonString) {
        try {
            const data = JSON.parse(jsonString);
            this.setFormData(form, data);
        } catch (error) {
            console.error('Error parsing JSON to form:', error);
        }
    }
}