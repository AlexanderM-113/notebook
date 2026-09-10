// Appwrite Client Configuration
const { Client, Account, Databases, Storage, Functions, ID, Query } = Appwrite;

// Initialize Appwrite Client
const client = new Client()
    .setEndpoint('https://sfo.cloud.appwrite.io/v1')
    .setProject('6a3454e9002af9bce3d6');
client.setKey('standard_4372961cd462c7cd49806133425b80358b230c7dccb89e4528db8be6e54e0aff6ca6d061a60bf998052fa9bc8384c9c2a8f89b324e069928b7c0b0318f91bd251cb976fe63fff37d13d2fbca745430738c060b9478010dcff5629fbcc1d238894c1db4ac45b2a291571155704dde559a6b23e21505f1df5b1efe3766f71c5863');
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