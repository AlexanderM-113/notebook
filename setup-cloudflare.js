// Cloudflare Setup Script
// This script sets up the D1 database and R2 storage for the Notebook Writer application
// Run with Node.js and Wrangler: wrangler d1 execute notebook_db --file=schema.sql

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Cloudflare setup...');

// Read the schema file
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

console.log('Database schema loaded from schema.sql');

console.log('\nTo complete the Cloudflare setup, follow these steps:');
console.log('1. Install Wrangler CLI: npm install -g wrangler');
console.log('2. Login to Cloudflare: wrangler login');
console.log('3. Create D1 database: wrangler d1 create notebook_db');
console.log('4. Update wrangler.toml with the database ID from step 3');
console.log('5. Create R2 bucket: wrangler r2 bucket create notebook-storage');
console.log('6. Execute schema: wrangler d1 execute notebook_db --file=schema.sql --local');
console.log('7. Deploy worker: wrangler deploy');
console.log('8. Set environment variables: wrangler secret put ADMIN_EMAIL');
console.log('9. Set environment variables: wrangler secret put ADMIN_PASSWORD');
console.log('\nOr run this automated setup:');

async function automatedSetup() {
    try {
        console.log('Creating D1 database...');
        const dbResult = execSync('wrangler d1 create notebook_db', { encoding: 'utf8' });
        console.log(dbResult);

        // Extract database ID from output
        const dbIdMatch = dbResult.match(/database_id = "([^"]+)"/);
        if (dbIdMatch) {
            const dbId = dbIdMatch[1];
            console.log(`Database ID: ${dbId}`);

            // Update wrangler.toml
            let wranglerConfig = fs.readFileSync('wrangler.toml', 'utf8');
            wranglerConfig = wranglerConfig.replace(/database_id = "notebook_db"/, `database_id = "${dbId}"`);
            fs.writeFileSync('wrangler.toml', wranglerConfig);
            console.log('Updated wrangler.toml with database ID');
        }

        console.log('Creating R2 bucket...');
        const bucketResult = execSync('wrangler r2 bucket create notebook-storage', { encoding: 'utf8' });
        console.log(bucketResult);

        console.log('Executing database schema...');
        execSync('wrangler d1 execute notebook_db --file=schema.sql --local', { encoding: 'utf8' });
        console.log('Database schema executed successfully');

        console.log('Deploying worker...');
        execSync('wrangler deploy', { encoding: 'utf8' });
        console.log('Worker deployed successfully');

        console.log('\nSetup completed successfully!');
        console.log('Please set your admin credentials:');
        console.log('wrangler secret put ADMIN_EMAIL');
        console.log('wrangler secret put ADMIN_PASSWORD');

    } catch (error) {
        console.error('Error during automated setup:', error.message);
        console.log('Please complete the setup manually using the steps above.');
    }
}

// Uncomment to run automated setup
// automatedSetup();
