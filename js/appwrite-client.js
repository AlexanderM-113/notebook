// Appwrite Client Configuration
const { Client, Account, Databases, Storage, Functions, ID, Query } = Appwrite;

// Initialize Appwrite Client
const client = new Client()
    .setEndpoint('https://sfo.cloud.appwrite.io/v1')
    .setProject('6a3454e9002af9bce3d6');
client.setKey('standard_52e5e317398afa99696e1e3216004a9ec45e35b2cb7de84a8969083824d3b11f5bb6db0da8c92f4e688e42a01d92a6951fe971d2c13a8bc39033eddb26d77d40c7d1e1cca0ef1908181cd06de738ee3f27b9fbceb72909d968b8da1e606f5b930fb5fab842688236db274b9ce978c9482411f1e6777e43460c66c2ace5c5db27');
// Initialize Appwrite Services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);

// Database IDs
const DB_ID = '6aa1fac90031a849319c';

// Collection IDs
const COLLECTIONS = {
    NOTEBOOKS: 'notebooks',
    GROUPS: 'groups',
    USERS: 'users',
    PAGES: 'pages',
    PAGE_ELEMENTS: 'page_elements',
    PAGE_ASSIGNMENTS: 'page_assignments',
    ENTRIES: 'entries',
    ENTRY_RESPONSES: 'entry_responses',
    AUDIT_LOG: 'audit_log'
};

// Storage Bucket IDs
const BUCKETS = {
    NOTEBOOK_COVERS: 'notebook_covers',
    PAGE_BACKGROUNDS: 'page_backgrounds',
    ENTRY_IMAGES: 'entry_images',
    SIGNATURES: 'signatures',
    EXPORTS: 'exports'
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        client,
        account,
        databases,
        storage,
        functions,
        ID,
        Query,
        DB_ID,
        COLLECTIONS,
        BUCKETS
    };
}