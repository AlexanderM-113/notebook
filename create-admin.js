// Create Admin User Script
const API_ENDPOINT = 'https://sfo.cloud.appwrite.io/v1';
const PROJECT_ID = '6a3454e9002af9bce3d6';
const API_KEY = 'standard_4372961cd462c7cd49806133425b80358b230c7dccb89e4528db8be6e54e0aff6ca6d061a60bf998052fa9bc8384c9c2a8f89b324e069928b7c0b0318f91bd251cb976fe63fff37d13d2fbca745430738c060b9478010dcff5629fbcc1d238894c1db4ac45b2a291571155704dde559a6b23e21505f1df5b1efe3766f71c5863';

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
