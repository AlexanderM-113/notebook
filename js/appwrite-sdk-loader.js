/**
 * Appwrite SDK - Downloaded locally to avoid CDN/tracking prevention issues
 * This is a stub that loads Appwrite from a reliable CDN fallback
 * For production, you should have the actual SDK file here
 */

// If you want to download the actual SDK:
// Visit: https://cdn.jsdelivr.net/npm/appwrite@latest
// Or use Node.js: npm install appwrite

// For now, this file will dynamically load from CDN with error handling
if (typeof window !== 'undefined' && !window.Appwrite) {
    // Create a promise that resolves when SDK loads
    window.AppwriteSDKReady = new Promise((resolve, reject) => {
        // Multiple CDN options for fallback
        const cdnUrls = [
            'https://cdn.jsdelivr.net/npm/appwrite@latest',
            'https://unpkg.com/appwrite@latest',
            'https://cdnjs.cloudflare.com/ajax/libs/appwrite-sdk/13.0.0/appwrite.min.js'
        ];
        
        let currentAttempt = 0;
        
        function loadFromCDN(url) {
            const script = document.createElement('script');
            script.src = url;
            script.onload = () => {
                if (window.Appwrite) {
                    resolve(window.Appwrite);
                } else if (currentAttempt < cdnUrls.length - 1) {
                    currentAttempt++;
                    setTimeout(() => loadFromCDN(cdnUrls[currentAttempt]), 500);
                } else {
                    reject(new Error('Failed to load Appwrite SDK from any CDN'));
                }
            };
            script.onerror = () => {
                if (currentAttempt < cdnUrls.length - 1) {
                    currentAttempt++;
                    loadFromCDN(cdnUrls[currentAttempt]);
                } else {
                    reject(new Error('All CDN attempts failed'));
                }
            };
            document.head.appendChild(script);
        }
        
        loadFromCDN(cdnUrls[0]);
    });
}
