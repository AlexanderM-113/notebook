// Settings Handler
class SettingsHandler {
    constructor() {
        this.settingsForm = document.getElementById('settings-form');
        this.init();
    }

    init() {
        // Setup form submission
        if (this.settingsForm) {
            this.settingsForm.addEventListener('submit', this.handleSaveSettings.bind(this));
        }

        // Load current settings
        this.loadSettings();
    }

    loadSettings() {
        // Load settings from localStorage or use defaults
        const settings = this.getStoredSettings();

        if (this.settingsForm) {
            FormUtils.setFormData(this.settingsForm, settings);
        }
    }

    getStoredSettings() {
        const stored = localStorage.getItem('notebook_settings');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (error) {
                console.error('Error parsing stored settings:', error);
            }
        }

        // Return default settings
        return {
            app_name: 'Notebook Writer',
            primary_color: '#3498db',
            secondary_color: '#2ecc71',
            pdf_paper_size: 'letter',
            pdf_orientation: 'portrait',
            include_cover: true,
            include_toc: true
        };
    }

    async handleSaveSettings(event) {
        event.preventDefault();

        try {
            const formData = FormUtils.getFormData(this.settingsForm);
            
            // Store settings
            localStorage.setItem('notebook_settings', JSON.stringify(formData));

            // Apply theme colors
            this.applyThemeColors(formData);

            DomUtils.showToast('Settings saved successfully', 'success');

        } catch (error) {
            console.error('Error saving settings:', error);
            DomUtils.showToast('Error saving settings', 'error');
        }
    }

    applyThemeColors(settings) {
        const root = document.documentElement;
        
        if (settings.primary_color) {
            root.style.setProperty('--primary-color', settings.primary_color);
        }

        if (settings.secondary_color) {
            root.style.setProperty('--secondary-color', settings.secondary_color);
        }
    }

    getSettings() {
        return this.getStoredSettings();
    }
}

// Initialize when DOM is ready
let settings;
document.addEventListener('DOMContentLoaded', () => {
    settings = new SettingsHandler();
});