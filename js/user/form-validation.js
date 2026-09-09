// Form Validation Handler
class FormValidationHandler {
    constructor() {
        this.validators = new Map();
        this.init();
    }

    init() {
        // Set up global form validation
        this.setupGlobalValidation();
    }

    setupGlobalValidation() {
        // Add real-time validation to all forms
        document.querySelectorAll('form').forEach(form => {
            this.setupFormValidation(form);
        });
    }

    setupFormValidation(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Get validation rules from data attributes
            const rules = this.getValidationRules(input);
            
            if (Object.keys(rules).length > 0) {
                this.addInputValidation(input, rules);
            }
        });

        // Add form submit validation
        form.addEventListener('submit', (e) => {
            if (!this.validateForm(form)) {
                e.preventDefault();
                return false;
            }
        });
    }

    getValidationRules(input) {
        const rules = {};

        if (input.required) {
            rules.required = true;
        }

        if (input.type === 'email') {
            rules.email = true;
        }

        if (input.type === 'number') {
            rules.numeric = true;
            if (input.min) {
                rules.min = parseFloat(input.min);
            }
            if (input.max) {
                rules.max = parseFloat(input.max);
            }
        }

        if (input.minLength) {
            rules.minLength = parseInt(input.minLength);
        }

        if (input.maxLength) {
            rules.maxLength = parseInt(input.maxLength);
        }

        if (input.pattern) {
            rules.pattern = input.pattern;
        }

        // Custom data attributes
        if (input.dataset.required === 'true') {
            rules.required = true;
        }

        if (input.dataset.email === 'true') {
            rules.email = true;
        }

        if (input.dataset.min) {
            rules.min = parseFloat(input.dataset.min);
        }

        if (input.dataset.max) {
            rules.max = parseFloat(input.dataset.max);
        }

        if (input.dataset.minLength) {
            rules.minLength = parseInt(input.dataset.minLength);
        }

        if (input.dataset.maxLength) {
            rules.maxLength = parseInt(input.dataset.maxLength);
        }

        if (input.dataset.pattern) {
            rules.pattern = input.dataset.pattern;
        }

        if (input.dataset.message) {
            rules.message = input.dataset.message;
        }

        return rules;
    }

    addInputValidation(input, rules) {
        // Blur validation
        input.addEventListener('blur', () => {
            this.validateInput(input, rules);
        });

        // Input validation (for real-time feedback)
        input.addEventListener('input', () => {
            if (input.value.length > 0) {
                this.validateInput(input, rules);
            }
        });

        // Store rules for later use
        this.validators.set(input, rules);
    }

    validateInput(input, rules) {
        const value = input.value;
        let isValid = true;
        let errorMessage = '';

        // Required validation
        if (rules.required && !FormUtils.validateRequired(value)) {
            isValid = false;
            errorMessage = rules.message || 'This field is required';
        }

        // Email validation
        if (isValid && rules.email && value.length > 0 && !FormUtils.validateEmail(value)) {
            isValid = false;
            errorMessage = rules.message || 'Please enter a valid email address';
        }

        // Numeric validation
        if (isValid && rules.numeric && value.length > 0) {
            const num = parseFloat(value);
            if (isNaN(num)) {
                isValid = false;
                errorMessage = rules.message || 'Please enter a valid number';
            } else {
                if (rules.min !== undefined && num < rules.min) {
                    isValid = false;
                    errorMessage = rules.message || `Value must be at least ${rules.min}`;
                }
                if (rules.max !== undefined && num > rules.max) {
                    isValid = false;
                    errorMessage = rules.message || `Value must be at most ${rules.max}`;
                }
            }
        }

        // Length validation
        if (isValid && rules.minLength !== undefined && value.length < rules.minLength) {
            isValid = false;
            errorMessage = rules.message || `Minimum ${rules.minLength} characters required`;
        }

        if (isValid && rules.maxLength !== undefined && value.length > rules.maxLength) {
            isValid = false;
            errorMessage = rules.message || `Maximum ${rules.maxLength} characters allowed`;
        }

        // Pattern validation
        if (isValid && rules.pattern && value.length > 0) {
            const regex = new RegExp(rules.pattern);
            if (!regex.test(value)) {
                isValid = false;
                errorMessage = rules.message || 'Invalid format';
            }
        }

        // Update UI
        if (isValid) {
            FormUtils.showFieldSuccess(input);
        } else {
            FormUtils.showFieldError(input, errorMessage);
        }

        return isValid;
    }

    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            const rules = this.validators.get(input);
            if (rules) {
                if (!this.validateInput(input, rules)) {
                    isValid = false;
                }
            } else if (input.required) {
                // Validate required fields without explicit rules
                if (!FormUtils.validateRequired(input.value)) {
                    FormUtils.showFieldError(input, 'This field is required');
                    isValid = false;
                }
            }
        });

        return isValid;
    }

    // Custom validator registration
    registerValidator(inputName, validatorFn) {
        const input = document.querySelector(`[name="${inputName}"]`);
        if (input) {
            input.addEventListener('blur', () => {
                const result = validatorFn(input.value);
                if (result === true) {
                    FormUtils.showFieldSuccess(input);
                } else {
                    FormUtils.showFieldError(input, typeof result === 'string' ? result : 'Invalid value');
                }
            });
        }
    }

    // Clear all validation states
    clearValidation(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.classList.remove('error', 'success');
            FormUtils.clearFieldError(input);
        });
    }
}

// Initialize when DOM is ready
let formValidation;
document.addEventListener('DOMContentLoaded', () => {
    formValidation = new FormValidationHandler();
});