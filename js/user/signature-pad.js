// Signature Pad Handler
class SignaturePadHandler {
    constructor() {
        this.canvas = document.getElementById('signature-canvas');
        this.clearButton = document.getElementById('clear-signature');
        this.confirmButton = document.getElementById('confirm-signature');
        this.statusElement = document.getElementById('signature-status');
        this.signaturePad = null;
        this.isConfirmed = false;
        this.init();
    }

    init() {
        if (!this.canvas) return;

        // Initialize signature pad
        this.signaturePad = new SignaturePad(this.canvas, {
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)'
        });

        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));

        // Handle touch events for mobile
        this.handleTouchEvents();

        // Clear button
        if (this.clearButton) {
            this.clearButton.addEventListener('click', this.clear.bind(this));
        }

        // Confirm button
        if (this.confirmButton) {
            this.confirmButton.addEventListener('click', this.confirm.bind(this));
        }

        // Enable submit button based on signature
        this.updateSubmitButton();
    }

    handleResize() {
        // Resize canvas to fit container
        const container = this.canvas.parentElement;
        if (container) {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            this.canvas.width = this.canvas.offsetWidth * ratio;
            this.canvas.height = this.canvas.offsetHeight * ratio;
            this.canvas.getContext('2d').scale(ratio, ratio);
            this.signaturePad.clear();
        }
    }

    handleTouchEvents() {
        // Prevent scrolling when signing on touch devices
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
        }, { passive: false });
    }

    clear() {
        this.signaturePad.clear();
        this.isConfirmed = false;
        this.updateStatus();
        this.updateSubmitButton();
    }

    confirm() {
        if (this.signaturePad.isEmpty()) {
            DomUtils.showToast('Please sign before confirming', 'error');
            return;
        }

        this.isConfirmed = true;
        this.updateStatus();
        this.updateSubmitButton();
    }

    isSigned() {
        return !this.signaturePad.isEmpty() && this.isConfirmed;
    }

    async getSignatureFile() {
        if (this.signaturePad.isEmpty()) {
            throw new Error('Signature is empty');
        }

        const dataURL = this.signaturePad.toDataURL('image/png');
        const blob = await this.dataURLToBlob(dataURL);
        return new File([blob], 'signature.png', { type: 'image/png' });
    }

    dataURLToBlob(dataURL) {
        return new Promise((resolve, reject) => {
            const arr = dataURL.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            
            resolve(new Blob([u8arr], { type: mime }));
        });
    }

    updateStatus() {
        if (!this.statusElement) return;

        if (this.isConfirmed) {
            this.statusElement.textContent = 'Signed and locked';
            this.statusElement.classList.add('signed');
        } else if (!this.signaturePad.isEmpty()) {
            this.statusElement.textContent = 'Signed (not confirmed)';
            this.statusElement.classList.remove('signed');
        } else {
            this.statusElement.textContent = 'Not signed';
            this.statusElement.classList.remove('signed');
        }
    }

    updateSubmitButton() {
        const submitButton = document.getElementById('submit-page');
        if (submitButton) {
            submitButton.disabled = !this.isConfirmed;
        }

        if (this.confirmButton) {
            this.confirmButton.disabled = this.signaturePad.isEmpty();
        }
    }

    // Get signature as base64 string
    getSignatureBase64() {
        if (this.signaturePad.isEmpty()) {
            return null;
        }
        return this.signaturePad.toDataURL('image/png');
    }
}

// Initialize when DOM is ready
let signaturePad;
document.addEventListener('DOMContentLoaded', () => {
    signaturePad = new SignaturePadHandler();
});