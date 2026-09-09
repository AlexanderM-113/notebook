// Storage Utilities - Helper functions for file upload and storage operations
class StorageUtils {
    // Convert file to base64
    static fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // Convert base64 to blob
    static base64ToBlob(base64, mimeType) {
        const byteCharacters = atob(base64.split(',')[1]);
        const byteArrays = [];
        
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        
        return new Blob(byteArrays, { type: mimeType });
    }

    // Resize image
    static resizeImage(file, maxWidth, maxHeight, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = event => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Calculate new dimensions
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width *= ratio;
                        height *= ratio;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob(
                        blob => resolve(new File([blob], file.name, { type: file.type })),
                        file.type,
                        quality
                    );
                };
                img.onerror = error => reject(error);
            };
            reader.onerror = error => reject(error);
        });
    }

    // Validate image file
    static validateImageFile(file, maxSizeMB = 10, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']) {
        if (!file) {
            return { valid: false, error: 'No file selected' };
        }
        
        // Check file type
        if (!allowedTypes.includes(file.type)) {
            return { valid: false, error: 'Invalid file type. Allowed types: ' + allowedTypes.join(', ') };
        }
        
        // Check file size
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
        }
        
        return { valid: true };
    }

    // Get file extension
    static getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    }

    // Format file size
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Generate unique filename
    static generateFilename(originalFilename, prefix = '') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const extension = this.getFileExtension(originalFilename);
        const baseName = originalFilename.replace(`.${extension}`, '');
        
        return `${prefix}${baseName}_${timestamp}_${random}.${extension}`;
    }

    // Download file from URL
    static downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Upload file to Appwrite storage
    static async uploadToStorage(file, bucketId, fileId = null) {
        try {
            const uniqueId = fileId || ('file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
            const result = await apiClient.uploadFile(bucketId, file, uniqueId);
            return { success: true, fileId: result.$id, file: result };
        } catch (error) {
            console.error('Error uploading file:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete file from Appwrite storage
    static async deleteFromStorage(bucketId, fileId) {
        try {
            await apiClient.deleteFile(bucketId, fileId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting file:', error);
            return { success: false, error: error.message };
        }
    }

    // Get file preview URL
    static getFilePreviewUrl(bucketId, fileId, options = {}) {
        try {
            const preview = apiClient.getFilePreview(bucketId, fileId, options);
            return preview.href;
        } catch (error) {
            console.error('Error getting file preview:', error);
            return null;
        }
    }

    // Handle file input change
    static handleFileInput(fileInput, callback, options = {}) {
        const file = fileInput.files[0];
        
        if (!file) {
            if (callback) callback(null, { valid: false, error: 'No file selected' });
            return;
        }
        
        // Validate file
        const validation = this.validateImageFile(
            file,
            options.maxSizeMB || 10,
            options.allowedTypes || ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        );
        
        if (!validation.valid) {
            if (callback) callback(null, validation);
            return;
        }
        
        // Resize if needed
        if (options.resize && (options.maxWidth || options.maxHeight)) {
            this.resizeImage(
                file,
                options.maxWidth || 1920,
                options.maxHeight || 1080,
                options.quality || 0.8
            ).then(resizedFile => {
                if (callback) callback(resizedFile, { valid: true });
            }).catch(error => {
                if (callback) callback(null, { valid: false, error: error.message });
            });
        } else {
            if (callback) callback(file, { valid: true });
        }
    }

    // Create image preview
    static createImagePreview(file, callback) {
        const reader = new FileReader();
        reader.onload = event => {
            const img = document.createElement('img');
            img.src = event.target.result;
            img.className = 'image-preview';
            if (callback) callback(img, event.target.result);
        };
        reader.readAsDataURL(file);
    }

    // Capture canvas as image
    static captureCanvasAsImage(canvas, filename = 'signature.png') {
        return new Promise((resolve, reject) => {
            try {
                canvas.toBlob(blob => {
                    const file = new File([blob], filename, { type: 'image/png' });
                    resolve(file);
                }, 'image/png');
            } catch (error) {
                reject(error);
            }
        });
    }

    // Clear file input
    static clearFileInput(fileInput) {
        if (typeof fileInput === 'string') {
            fileInput = document.querySelector(fileInput);
        }
        if (fileInput) {
            fileInput.value = '';
        }
    }
}