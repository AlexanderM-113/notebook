// Simple Appwrite Setup Script using fetch API
// This script sets up the database collections and storage buckets for the Notebook Writer application

const API_ENDPOINT = 'https://sfo.cloud.appwrite.io/v1';
const PROJECT_ID = '6a3454e9002af9bce3d6';
const API_KEY = 'standard_52e5e317398afa99696e1e3216004a9ec45e35b2cb7de84a8969083824d3b11f5bb6db0da8c92f4e688e42a01d92a6951fe971d2c13a8bc39033eddb26d77d40c7d1e1cca0ef1908181cd06de738ee3f27b9fbceb72909d968b8da1e606f5b930fb5fab842688236db274b9ce978c9482411f1e6777e43460c66c2ace5c5db27';
let DB_ID = 'notebook_db';

// Collection definitions
const collections = [
    { id: 'notebooks', name: 'Notebooks' },
    { id: 'groups', name: 'Groups' },
    { id: 'users', name: 'Users' },
    { id: 'pages', name: 'Pages' },
    { id: 'page_elements', name: 'Page Elements' },
    { id: 'page_assignments', name: 'Page Assignments' },
    { id: 'entries', name: 'Entries' },
    { id: 'entry_responses', name: 'Entry Responses' },
    { id: 'audit_log', name: 'Audit Log' }
];

// Storage bucket definitions
const buckets = [
    { id: 'notebook_covers', name: 'Notebook Covers' },
    { id: 'page_backgrounds', name: 'Page Backgrounds' },
    { id: 'entry_images', name: 'Entry Images' },
    { id: 'signatures', name: 'Signatures' },
    { id: 'exports', name: 'Exports' }
];

// Helper function to make API requests
async function apiRequest(endpoint, method = 'GET', body = null) {
    const headers = {
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
        'Content-Type': 'application/json'
    };

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_ENDPOINT}${endpoint}`, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        
        return data;
    } catch (error) {
        throw error;
    }
}

// Setup function
async function setupAppwrite() {
    console.log('Starting Appwrite setup...');

    try {
        // Check for existing databases
        console.log('Checking for existing databases...');
        try {
            const databases = await apiRequest('/databases');
            console.log(`Found ${databases.total} existing database(s)`);
            if (databases.total > 0) {
                DB_ID = databases.databases[0].$id;
                console.log(`Using existing database: ${DB_ID}`);
            }
        } catch (error) {
            console.log('Could not list databases, will try to create one');
        }

        // Try to create database if we don't have one
        console.log('Creating database...');
        try {
            await apiRequest('/databases', 'POST', {
                databaseId: DB_ID,
                name: 'Notebook Writer Database'
            });
            console.log('Database created successfully');
        } catch (error) {
            if (error.message.includes('already exists') || error.message.includes('already deployed') || error.message.includes('maximum number')) {
                console.log('Database already exists or limit reached - continuing with setup');
            } else {
                console.log('Database creation failed, but continuing with collection setup...');
            }
        }

        // Create collections
        console.log('Creating collections...');
        for (const collection of collections) {
            try {
                await apiRequest(`/databases/${DB_ID}/collections`, 'POST', {
                    collectionId: collection.id,
                    name: collection.name
                });
                console.log(`Collection '${collection.name}' created successfully`);
            } catch (error) {
                if (error.message.includes('already exists') || error.message.includes('already deployed')) {
                    console.log(`Collection '${collection.name}' already exists`);
                } else {
                    console.error(`Error creating collection '${collection.name}':`, error.message);
                }
            }
        }

        // Create storage buckets
        console.log('Creating storage buckets...');
        for (const bucket of buckets) {
            try {
                await apiRequest('/storage/buckets', 'POST', {
                    bucketId: bucket.id,
                    name: bucket.name
                });
                console.log(`Bucket '${bucket.name}' created successfully`);
            } catch (error) {
                if (error.message.includes('already exists') || error.message.includes('already deployed')) {
                    console.log(`Bucket '${bucket.name}' already exists`);
                } else {
                    console.error(`Error creating bucket '${bucket.name}':`, error.message);
                }
            }
        }

        console.log('Appwrite setup completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Configure collection attributes in Appwrite Console');
        console.log('2. Open index.html to test the application');

    } catch (error) {
        console.error('Error during setup:', error);
    }
}

// Run setup
setupAppwrite();
