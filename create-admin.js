// Create Admin User Script
const API_ENDPOINT = 'https://sfo.cloud.appwrite.io/v1';
const PROJECT_ID = '6a3454e9002af9bce3d6';
const API_KEY = 'standard_52e5e317398afa99696e1e3216004a9ec45e35b2cb7de84a8969083824d3b11f5bb6db0da8c92f4e688e42a01d92a6951fe971d2c13a8bc39033eddb26d77d40c7d1e1cca0ef1908181cd06de738ee3f27b9fbceb72909d968b8da1e606f5b930fb5fab842688236db274b9ce978c9482411f1e6777e43460c66c2ace5c5db27';

const ADMIN_EMAIL = 'alexander_m113@outlook.com';
const ADMIN_PASSWORD = 'Arizonameet1';
const ADMIN_NAME = 'Alexander Admin';

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

// Create admin user
async function createAdminUser() {
    console.log('Creating admin user...');

    try {
        // Try to create the user
        try {
            const user = await apiRequest('/account', 'POST', {
                userId: 'admin_user',
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                name: ADMIN_NAME
            });
            console.log('Admin user created successfully:', user.$id);
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('Admin user already exists');
            } else {
                console.log('Error creating user:', error.message);
                console.log('Trying alternative method...');
                
                // Try using the users endpoint
                try {
                    const user = await apiRequest('/users', 'POST', {
                        userId: 'admin_user',
                        email: ADMIN_EMAIL,
                        password: ADMIN_PASSWORD,
                        name: ADMIN_NAME
                    });
                    console.log('Admin user created successfully:', user.$id);
                } catch (error2) {
                    if (error2.message.includes('already exists')) {
                        console.log('Admin user already exists');
                    } else {
                        console.log('Could not create admin user:', error2.message);
                        console.log('You may need to create the admin user manually in the Appwrite Console');
                    }
                }
            }
        }

        console.log('\nAdmin credentials:');
        console.log(`Email: ${ADMIN_EMAIL}`);
        console.log(`Password: ${ADMIN_PASSWORD}`);
        console.log('\nYou can now log in with these credentials in the admin panel.');

    } catch (error) {
        console.error('Error during admin creation:', error);
    }
}

// Run the script
createAdminUser();
