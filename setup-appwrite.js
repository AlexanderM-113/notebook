// Appwrite Setup Script
// This script sets up the database collections and storage buckets for the Notebook Writer application

const { Client, Databases, Storage, ID } = Appwrite;

// Initialize Appwrite Client
const client = new Client()
    .setEndpoint('https://sfo.cloud.appwrite.io/v1')
    .setProject('6a3454e9002af9bce3d6');

// Set API key
client.setKey('<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appwrite Setup - Notebook Writer</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        .status {
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
        }
        .success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .info {
            background-color: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        .log {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
            max-height: 400px;
            overflow-y: auto;
            font-family: monospace;
            font-size: 12px;
        }
        button {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 5px;
        }
        button:hover {
            background-color: #0056b3;
        }
        button:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
        }
        .progress {
            margin: 20px 0;
        }
        .progress-bar {
            height: 20px;
            background-color: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background-color: #007bff;
            width: 0%;
            transition: width 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Appwrite Setup - Notebook Writer</h1>
        
        <div class="status info">
            <strong>Instructions:</strong> Click the button below to set up your Appwrite database and storage. Make sure you have your Appwrite API key configured in the script.
        </div>

        <div class="progress">
            <div class="progress-bar">
                <div class="progress-fill" id="progress-fill"></div>
            </div>
        </div>

        <button id="setup-btn">Start Setup</button>
        <button id="clear-btn">Clear Log</button>

        <div class="log" id="log"></div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/appwrite@13.0.0"></script>
    <script>
        // Wait for Appwrite to load
        window.addEventListener('load', function() {
            if (typeof Appwrite === 'undefined') {
                log('Appwrite SDK failed to load', 'error');
                return;
            }
            
            const { Client, Databases, Storage, ID } = Appwrite;

        // Initialize Appwrite Client
        const client = new Client()
            .setEndpoint('https://sfo.cloud.appwrite.io/v1')
            .setProject('6a3454e9002af9bce3d6');

        // Set API key
        client.setKey('standard_4372961cd462c7cd49806133425b80358b230c7dccb89e4528db8be6e54e0aff6ca6d061a60bf998052fa9bc8384c9c2a8f89b324e069928b7c0b0318f91bd251cb976fe63fff37d13d2fbca745430738c060b9478010dcff5629fbcc1d238894c1db4ac45b2a291571155704dde559a6b23e21505f1df5b1efe3766f71c5863');

        // Initialize services
        const databases = new Databases(client);
        const storage = new Storage(client);

        // Database ID
        const DB_ID = 'notebook_db';

        // Simplified collection definitions (using JSON attributes)
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

        // UI Functions
        function log(message, type = 'info') {
            const logDiv = document.getElementById('log');
            const timestamp = new Date().toLocaleTimeString();
            const color = type === 'error' ? 'red' : type === 'success' ? 'green' : 'black';
            logDiv.innerHTML += `<div style="color: ${color}">[${timestamp}] ${message}</div>`;
            logDiv.scrollTop = logDiv.scrollHeight;
        }

        function clearLog() {
            document.getElementById('log').innerHTML = '';
        }

        function updateProgress(percent) {
            document.getElementById('progress-fill').style.width = percent + '%';
        }

        async function runSetup() {
            const setupBtn = document.getElementById('setup-btn');
            setupBtn.disabled = true;
            
            try {
                log('Starting Appwrite setup...', 'info');
                updateProgress(5);

                // Create database
                log('Creating database...', 'info');
                try {
                    await databases.create(DB_ID, 'Notebook Writer Database');
                    log('Database created successfully', 'success');
                } catch (error) {
                    if (error.message.includes('already exists')) {
                        log('Database already exists', 'info');
                    } else {
                        throw error;
                    }
                }
                updateProgress(15);

                // Create collections
                log('Creating collections...', 'info');
                for (let i = 0; i < collections.length; i++) {
                    const collection = collections[i];
                    try {
                        await databases.createCollection(DB_ID, collection.id, collection.name);
                        log(`Collection '${collection.name}' created successfully`, 'success');
                    } catch (error) {
                        if (error.message.includes('already exists')) {
                            log(`Collection '${collection.name}' already exists`, 'info');
                        } else {
                            log(`Error creating collection '${collection.name}': ${error.message}`, 'error');
                        }
                    }
                    updateProgress(15 + ((i + 1) / collections.length) * 35);
                }

                // Create storage buckets
                log('Creating storage buckets...', 'info');
                for (let i = 0; i < buckets.length; i++) {
                    const bucket = buckets[i];
                    try {
                        await storage.createBucket(bucket.id, bucket.name);
                        log(`Bucket '${bucket.name}' created successfully`, 'success');
                    } catch (error) {
                        if (error.message.includes('already exists')) {
                            log(`Bucket '${bucket.name}' already exists`, 'info');
                        } else {
                            log(`Error creating bucket '${bucket.name}': ${error.message}`, 'error');
                        }
                    }
                    updateProgress(50 + ((i + 1) / buckets.length) * 40);
                }

                updateProgress(100);
                log('Appwrite setup completed successfully!', 'success');
                log('Please configure attributes in Appwrite Console manually for now.', 'info');
                log('Open index.html to test the application.', 'info');

            } catch (error) {
                log(`Error during setup: ${error.message}`, 'error');
                console.error(error);
            } finally {
                setupBtn.disabled = false;
            }
        }

        // Make functions globally available
        window.log = log;
        window.clearLog = clearLog;
        window.updateProgress = updateProgress;
        window.runSetup = runSetup;

        // Add event listeners to buttons
        document.getElementById('setup-btn').addEventListener('click', runSetup);
        document.getElementById('clear-btn').addEventListener('click', clearLog);
        });
</body>
</html>');

// Initialize services
const databases = new Databases(client);
const storage = new Storage(client);

// Database ID
const DB_ID = 'notebook_db';

// Collection definitions
const collections = [
    {
        name: 'notebooks',
        id: 'notebooks',
        attributes: [
            { name: 'title', type: 'string', size: 255, required: true },
            { name: 'description', type: 'string', size: 1000, required: false },
            { name: 'type', type: 'string', size: 100, required: false },
            { name: 'status', type: 'string', size: 50, required: true, default: 'draft' },
            { name: 'group_id', type: 'string', size: 255, required: false },
            { name: 'cover_logo_id', type: 'string', size: 255, required: false },
            { name: 'cover_title', type: 'string', size: 255, required: false },
            { name: 'cover_subtitle', type: 'string', size: 500, required: false },
            { name: 'cover_background_color', type: 'string', size: 7, required: false },
            { name: 'cover_text_color', type: 'string', size: 7, required: false },
            { name: 'global_font_family', type: 'string', size: 100, required: false },
            { name: 'global_text_color', type: 'string', size: 7, required: false },
            { name: 'global_background_color', type: 'string', size: 7, required: false },
            { name: 'global_font_size', type: 'integer', required: false },
            { name: 'toc_title', type: 'string', size: 255, required: false, default: 'Table of Contents' },
            { name: 'toc_style', type: 'string', size: 50, required: false, default: 'list' },
            { name: 'include_toc_page_numbers', type: 'boolean', required: false, default: true },
            { name: 'pdf_paper_size', type: 'string', size: 10, required: false, default: 'letter' },
            { name: 'pdf_orientation', type: 'string', size: 10, required: false, default: 'portrait' },
            { name: 'pdf_margins_top', type: 'integer', required: false, default: 72 },
            { name: 'pdf_margins_bottom', type: 'integer', required: false, default: 72 },
            { name: 'pdf_margins_left', type: 'integer', required: false, default: 72 },
            { name: 'pdf_margins_right', type: 'integer', required: false, default: 72 },
            { name: 'created_by', type: 'string', size: 255, required: false },
            { name: 'page_count', type: 'integer', required: false, default: 0 },
            { name: 'entry_count', type: 'integer', required: false, default: 0 }
        ]
    },
    {
        name: 'groups',
        id: 'groups',
        attributes: [
            { name: 'name', type: 'string', size: 255, required: true },
            { name: 'notebook_id', type: 'string', size: 255, required: false },
            { name: 'description', type: 'string', size: 1000, required: false },
            { name: 'user_count', type: 'integer', required: false, default: 0 },
            { name: 'created_by', type: 'string', size: 255, required: false }
        ]
    },
    {
        name: 'users',
        id: 'users',
        attributes: [
            { name: 'first_name', type: 'string', size: 100, required: true },
            { name: 'full_name', type: 'string', size: 255, required: false },
            { name: 'email', type: 'string', size: 255, required: false },
            { name: 'group_id', type: 'string', size: 255, required: false },
            { name: 'notebook_id', type: 'string', size: 255, required: false },
            { name: 'last_login', type: 'datetime', required: false },
            { name: 'entry_count', type: 'integer', required: false, default: 0 },
            { name: 'status', type: 'string', size: 50, required: true, default: 'active' }
        ]
    },
    {
        name: 'pages',
        id: 'pages',
        attributes: [
            { name: 'notebook_id', type: 'string', size: 255, required: true },
            { name: 'page_number', type: 'integer', required: true },
            { name: 'title', type: 'string', size: 255, required: true },
            { name: 'page_type', type: 'string', size: 50, required: true },
            { name: 'order_position', type: 'integer', required: true },
            { name: 'background_color', type: 'string', size: 7, required: false },
            { name: 'background_image_id', type: 'string', size: 255, required: false },
            { name: 'font_family', type: 'string', size: 100, required: false },
            { name: 'font_size', type: 'integer', required: false },
            { name: 'font_color', type: 'string', size: 7, required: false },
            { name: 'page_padding', type: 'integer', required: false },
            { name: 'requires_signature', type: 'boolean', required: false, default: true },
            { name: 'content', type: 'string', size: 10000, required: false }
        ]
    },
    {
        name: 'page_elements',
        id: 'page_elements',
        attributes: [
            { name: 'page_id', type: 'string', size: 255, required: true },
            { name: 'element_type', type: 'string', size: 50, required: true },
            { name: 'order_position', type: 'integer', required: true },
            { name: 'question_text', type: 'string', size: 1000, required: false },
            { name: 'required', type: 'boolean', required: false, default: true },
            { name: 'field_type', type: 'string', size: 50, required: false },
            { name: 'field_height', type: 'integer', required: false },
            { name: 'max_characters', type: 'integer', required: false },
            { name: 'min_value', type: 'float', required: false },
            { name: 'max_value', type: 'float', required: false },
            { name: 'placeholder_text', type: 'string', size: 255, required: false },
            { name: 'validation_message', type: 'string', size: 500, required: false },
            { name: 'help_text', type: 'string', size: 500, required: false },
            { name: 'field_background_color', type: 'string', size: 7, required: false },
            { name: 'field_text_color', type: 'string', size: 7, required: false },
            { name: 'field_font_size', type: 'integer', required: false },
            { name: 'image_label', type: 'string', size: 255, required: false },
            { name: 'image_description', type: 'string', size: 1000, required: false },
            { name: 'image_required', type: 'boolean', required: false, default: false },
            { name: 'max_file_size_mb', type: 'integer', required: false, default: 10 },
            { name: 'allowed_formats', type: 'string', size: 500, required: false },
            { name: 'image_box_height', type: 'integer', required: false },
            { name: 'image_box_width', type: 'integer', required: false },
            { name: 'image_border_color', type: 'string', size: 7, required: false },
            { name: 'image_background_color', type: 'string', size: 7, required: false },
            { name: 'text_content', type: 'string', size: 10000, required: false },
            { name: 'text_style', type: 'string', size: 50, required: false },
            { name: 'text_color', type: 'string', size: 7, required: false },
            { name: 'text_background_color', type: 'string', size: 7, required: false },
            { name: 'text_font_size', type: 'integer', required: false },
            { name: 'text_font_weight', type: 'string', size: 50, required: false },
            { name: 'text_alignment', type: 'string', size: 50, required: false }
        ]
    },
    {
        name: 'page_assignments',
        id: 'page_assignments',
        attributes: [
            { name: 'user_id', type: 'string', size: 255, required: true },
            { name: 'page_id', type: 'string', size: 255, required: true },
            { name: 'assigned_date', type: 'datetime', required: false },
            { name: 'assigned_by', type: 'string', size: 255, required: false },
            { name: 'due_date', type: 'datetime', required: false },
            { name: 'status', type: 'string', size: 50, required: true, default: 'assigned' }
        ]
    },
    {
        name: 'entries',
        id: 'entries',
        attributes: [
            { name: 'user_id', type: 'string', size: 255, required: true },
            { name: 'notebook_id', type: 'string', size: 255, required: true },
            { name: 'page_id', type: 'string', size: 255, required: true },
            { name: 'group_id', type: 'string', size: 255, required: false },
            { name: 'submission_date', type: 'datetime', required: false },
            { name: 'submission_day', type: 'datetime', required: false },
            { name: 'is_locked', type: 'boolean', required: false, default: true },
            { name: 'unlocked_by', type: 'string', size: 255, required: false },
            { name: 'unlocked_at', type: 'datetime', required: false },
            { name: 'submission_status', type: 'string', size: 50, required: true, default: 'submitted' }
        ]
    },
    {
        name: 'entry_responses',
        id: 'entry_responses',
        attributes: [
            { name: 'entry_id', type: 'string', size: 255, required: true },
            { name: 'page_element_id', type: 'string', size: 255, required: false },
            { name: 'response_type', type: 'string', size: 50, required: true },
            { name: 'response_value', type: 'string', size: 10000, required: false },
            { name: 'response_numeric', type: 'float', required: false },
            { name: 'image_file_id', type: 'string', size: 255, required: false },
            { name: 'image_count', type: 'integer', required: false, default: 0 },
            { name: 'image_file_ids', type: 'string', size: 2000, required: false },
            { name: 'signature_file_id', type: 'string', size: 255, required: false },
            { name: 'uploaded_at', type: 'datetime', required: false },
            { name: 'edited_at', type: 'datetime', required: false }
        ]
    },
    {
        name: 'audit_log',
        id: 'audit_log',
        attributes: [
            { name: 'action_type', type: 'string', size: 100, required: true },
            { name: 'performed_by', type: 'string', size: 255, required: true },
            { name: 'resource_type', type: 'string', size: 50, required: true },
            { name: 'resource_id', type: 'string', size: 255, required: false },
            { name: 'resource_name', type: 'string', size: 255, required: false },
            { name: 'timestamp', type: 'datetime', required: false },
            { name: 'details', type: 'string', size: 5000, required: false }
        ]
    }
];

// Storage bucket definitions
const buckets = [
    {
        name: 'notebook_covers',
        id: 'notebook_covers',
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    },
    {
        name: 'page_backgrounds',
        id: 'page_backgrounds',
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    },
    {
        name: 'entry_images',
        id: 'entry_images',
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf']
    },
    {
        name: 'signatures',
        id: 'signatures',
        maxSize: 2 * 1024 * 1024, // 2MB
        allowedExtensions: ['png']
    },
    {
        name: 'exports',
        id: 'exports',
        maxSize: 50 * 1024 * 1024, // 50MB
        allowedExtensions: ['pdf']
    }
];

// Setup function
async function setupAppwrite() {
    console.log('Starting Appwrite setup...');

    try {
        // Create database
        console.log('Creating database...');
        try {
            await databases.create(DB_ID, 'Notebook Writer Database');
            console.log('Database created successfully');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('Database already exists');
            } else {
                throw error;
            }
        }

        // Create collections
        console.log('Creating collections...');
        for (const collection of collections) {
            try {
                await databases.createCollection(DB_ID, collection.id, collection.name);
                console.log(`Collection '${collection.name}' created successfully`);

                // Create attributes
                for (const attr of collection.attributes) {
                    try {
                        let attribute;
                        
                        switch (attr.type) {
                            case 'string':
                                attribute = await databases.createStringAttribute(
                                    DB_ID,
                                    collection.id,
                                    attr.name,
                                    attr.size,
                                    attr.required,
                                    attr.default
                                );
                                break;
                            case 'integer':
                                attribute = await databases.createIntegerAttribute(
                                    DB_ID,
                                    collection.id,
                                    attr.name,
                                    attr.required,
                                    attr.default,
                                    attr.min,
                                    attr.max
                                );
                                break;
                            case 'float':
                                attribute = await databases.createFloatAttribute(
                                    DB_ID,
                                    collection.id,
                                    attr.name,
                                    attr.required,
                                    attr.default,
                                    attr.min,
                                    attr.max
                                );
                                break;
                            case 'boolean':
                                attribute = await databases.createBooleanAttribute(
                                    DB_ID,
                                    collection.id,
                                    attr.name,
                                    attr.required,
                                    attr.default
                                );
                                break;
                            case 'datetime':
                                attribute = await databases.createDatetimeAttribute(
                                    DB_ID,
                                    collection.id,
                                    attr.name,
                                    attr.required,
                                    attr.default
                                );
                                break;
                            default:
                                console.log(`  Unknown attribute type '${attr.type}' for '${attr.name}'`);
                                continue;
                        }
                        console.log(`  Attribute '${attr.name}' created`);
                    } catch (error) {
                        if (error.message.includes('already exists')) {
                            console.log(`  Attribute '${attr.name}' already exists`);
                        } else {
                            console.error(`  Error creating attribute '${attr.name}':`, error.message);
                        }
                    }
                }
            } catch (error) {
                if (error.message.includes('already exists')) {
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
                await storage.createBucket(
                    bucket.id,
                    bucket.name,
                    bucket.allowedExtensions,
                    bucket.maxSize,
                    false, // encryption
                    false  // antivirus
                );
                console.log(`Bucket '${bucket.name}' created successfully`);
            } catch (error) {
                if (error.message.includes('already exists')) {
                    console.log(`Bucket '${bucket.name}' already exists`);
                } else {
                    console.error(`Error creating bucket '${bucket.name}':`, error.message);
                }
            }
        }

        console.log('Appwrite setup completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Update your Appwrite client configuration in js/appwrite-client.js');
        console.log('2. Open index.html in a web browser to test the application');
        console.log('3. Create an admin account in Appwrite console');

    } catch (error) {
        console.error('Error during setup:', error);
    }
}

// Run setup
setupAppwrite();
