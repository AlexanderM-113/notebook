// Appwrite Client Configuration
const { Client, Account, Databases, Storage, Functions, ID, Query } = Appwrite;

// Initialize Appwrite Client
const client = new Client()
    .setEndpoint('https://sfo.cloud.appwrite.io/v1')
    .setProject('6a3454e9002af9bce3d6');
client.setKey('standard_34226a60f3607f5160ffbb5d87b71504b8c3b811083c8e63b6ebb3647ed35795b6856a2771a0e1199fc9bc656ad44d183cd5eec9fe2c53a7f8f15f6ba66a733d1ffc76eabfb0e0484c45f5c3de2277d1fa0ec46e8c12b5d52a5f574be92195eec51dd06040fe0227fbcebe386f6ff67fc771d96d081f634d3f25983188a52df3');
// Initialize Appwrite Services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);

// Database IDs
const DB_ID = 'notebook_db';

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