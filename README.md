# Notebook Writer

A comprehensive web application for managing customizable digital notebooks with fillable forms and content pages. Built with HTML, CSS, JavaScript, and Appwrite backend.

## Features

### For Administrators
- **Notebook Management**: Create and manage multiple independent notebooks
- **Page Designer**: Build template pages with questions, image uploads, and text sections
- **Content Pages**: Create fixed content pages for user acknowledgment
- **User Management**: Organize users into groups and assign specific pages
- **Entry Management**: View, unlock, edit, and export user submissions
- **PDF Export**: Generate complete notebook PDFs with all user data
- **Audit Logging**: Track all system actions for compliance

### For Users
- **Simple Login**: Access notebooks using only first name (no password required)
- **Page Completion**: Fill out assigned template pages with questions and images
- **Digital Signatures**: Sign each page to acknowledge completion
- **Progress Tracking**: See completion status for all assigned pages
- **Independent Work**: Each user works independently with isolated data

## System Architecture

### Two Independent Notebooks
- **Notebook A**: Assigned to Group A users
- **Notebook B**: Assigned to Group B users
- **No Data Sync**: User submissions are completely isolated between notebooks

### Page Types
1. **Template Pages**: Fillable forms with questions, image uploads, and text sections
2. **Content Pages**: Fixed admin-created content that users acknowledge and sign

### User Authentication
- **Name-Based Login**: Users enter only their first name to access the system
- **Group Assignment**: Each user belongs to a specific group with access to one notebook
- **No Sign-Up Required**: Admins manage all user accounts

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Appwrite (Database, Authentication, Storage, Functions)
- **PDF Generation**: jsPDF + html2pdf
- **Signature Capture**: SignaturePad.js
- **Drag & Drop**: SortableJS
- **Database**: Appwrite Document Database
- **Storage**: Appwrite File Storage

## Setup Instructions

### Prerequisites
- Appwrite account (free tier available)
- Web browser with JavaScript enabled
- Basic knowledge of web development

### Step 1: Appwrite Setup

1. **Create Appwrite Project**
   - Log in to your Appwrite console
   - Create a new project named "Notebook Writer"
   - Note your Project ID and API Endpoint

2. **Configure API Key**
   - Go to Settings > API Keys
   - Create a new API key with all permissions
   - Copy the API key

3. **Run Database Setup**
   - Open `browser-setup.html` in your web browser
   - Click "Start Setup" to create database collections and storage buckets
   - Alternatively, use the Appwrite Console to manually create:
     - Database: `notebook_db`
     - Collections: notebooks, groups, users, pages, page_elements, page_assignments, entries, entry_responses, audit_log
     - Storage Buckets: notebook_covers, page_backgrounds, entry_images, signatures, exports

### Step 2: Configure Application

1. **Update Appwrite Credentials**
   - Open `js/appwrite-client.js`
   - Update the following with your Appwrite details:
   ```javascript
   const client = new Client()
       .setEndpoint('YOUR_APPWRITE_ENDPOINT') // e.g., 'https://cloud.appwrite.io/v1'
       .setProject('YOUR_PROJECT_ID');
   ```

2. **Update API Key in Setup Script**
   - Open `browser-setup.html`
   - Replace the API key with your actual Appwrite API key
   - This is only needed for the initial setup

### Step 3: Deploy the Application

1. **Local Development**
   - Simply open `index.html` in your web browser
   - Or use a local server like Live Server in VS Code

2. **Production Deployment**
   - Upload all files to your web server
   - Ensure HTTPS is enabled for secure connections
   - Configure CORS in Appwrite if needed

### Step 4: Initial Configuration

1. **Create Admin Account**
   - Use Appwrite Console to create an admin user
   - Or use the admin login interface with email/password

2. **Create Groups**
   - Log in as admin
   - Navigate to Groups tab
   - Create "Group A" and "Group B"

3. **Create Notebooks**
   - Navigate to Notebooks tab
   - Create "Notebook A" and assign to Group A
   - Create "Notebook B" and assign to Group B

4. **Add Users**
   - Navigate to Groups tab
   - Add users to each group with their first names
   - Assign specific pages to each user

## Usage Guide

### For Administrators

#### Creating a Notebook
1. Click "Create New Notebook"
2. Enter notebook details (title, type, description)
3. Assign to a group
4. Configure cover page and styling settings
5. Add template and/or content pages
6. Publish the notebook

#### Building Template Pages
1. In the notebook editor, click "Add Template Page"
2. Configure page settings (background, fonts, signature requirement)
3. Add elements:
   - **Questions**: Text, textarea, or numeric fields
   - **Image Upload**: Allow users to upload images
   - **Text Sections**: Add instructions or headers
   - **Dividers**: Separate content sections
4. Save and preview the page

#### Managing Users
1. Navigate to Groups tab
2. Click "View Users" on a group
3. Click "Add User" to create new users
4. Click "Assign Pages" to give users access to specific pages
5. Users can now log in with their first name

#### Reviewing Entries
1. Navigate to Entries tab
2. Filter by notebook, status, or user name
3. Click "View" to see detailed responses
4. Click "Unlock" to allow users to re-edit
5. Click "Export Notebook PDF" to download complete submissions

### For Users

#### Logging In
1. Open the application URL
2. Enter your first name
3. Click "Enter"
4. If your name is found in the assigned group, you'll access your dashboard

#### Completing Pages
1. View your assigned pages on the dashboard
2. Click on a page to open it
3. Fill out all required questions
4. Upload any required images
5. Sign the page using the signature pad
6. Click "Submit Page"
7. Repeat for all assigned pages

#### Viewing Completed Work
1. After submission, pages are locked
2. View your progress on the dashboard
3. Contact administrator if you need to make changes

## Database Schema

### Collections

#### notebooks
- Stores notebook configurations and settings
- Includes cover page design, styling, and TOC settings

#### groups
- User groups for notebook assignment
- Each group assigned to one notebook

#### users
- User accounts with first-name authentication
- Group membership and notebook assignment

#### pages
- Template and content pages
- Page configuration and ordering

#### page_elements
- Individual elements within template pages
- Questions, image uploads, text sections, etc.

#### page_assignments
- Maps users to specific pages
- Tracks assignment status and due dates

#### entries
- User submissions for specific pages
- Locking status and submission metadata

#### entry_responses
- Actual user responses and uploaded files
- Links to storage files

#### audit_log
- System action tracking
- Immutable audit trail

### Storage Buckets

- **notebook_covers**: Notebook cover images (5MB max)
- **page_backgrounds**: Page background images (5MB max)
- **entry_images**: User-uploaded images (10MB max)
- **signatures**: Digital signature PNGs (2MB max)
- **exports**: Generated PDF files (50MB max)

## PDF Export

The application generates comprehensive PDFs containing:
- Cover page with notebook branding
- Table of Contents (auto-generated)
- All assigned template pages with user responses
- All content pages with fixed content
- Uploaded images embedded
- Digital signatures
- Professional formatting (Letter size, 300 DPI)

## Security Considerations

- **Name-Based Authentication**: Simple but requires controlled environment
- **Data Isolation**: Complete separation between notebooks
- **Audit Logging**: All actions tracked for compliance
- **File Validation**: Server-side validation of uploads
- **Entry Locking**: Prevents unauthorized modifications

## Troubleshooting

### Common Issues

**"Name not found" error**
- Ensure user is added to the correct group
- Check that the user's status is "active"
- Verify the notebook is published

**Cannot submit page**
- Ensure all required fields are filled
- Check that signature is completed
- Verify file uploads meet size requirements

**PDF generation fails**
- Check browser console for errors
- Ensure all storage files are accessible
- Verify Appwrite functions are configured

**Appwrite connection errors**
- Verify API endpoint and project ID
- Check API key permissions
- Ensure CORS is configured correctly

## Development

### File Structure
```
notebook/
├── index.html              # Main application file
├── css/
│   ├── common.css          # Shared styles
│   ├── admin.css           # Admin interface styles
│   ├── user.css            # User interface styles
│   └── responsive.css      # Mobile responsiveness
├── js/
│   ├── appwrite-client.js  # Appwrite configuration
│   ├── auth.js             # Authentication management
│   ├── app.js              # Main application logic
│   ├── common/             # Shared utilities
│   ├── admin/              # Admin functionality
│   └── user/               # User functionality
├── lib/                    # External libraries
├── assets/                 # Static assets
├── browser-setup.html      # Database setup tool
└── README.md              # This file
```

### Adding New Features

1. **New Page Element Types**
   - Add element type to `page-builder.js`
   - Update rendering logic in `page-entry.js`
   - Add validation rules as needed

2. **Additional Export Formats**
   - Extend `pdf-generator.js`
   - Add new export options to admin interface

3. **Enhanced Authentication**
   - Modify `auth.js` for additional login methods
   - Update user management accordingly

## License

This project is provided as-is for educational and commercial use.

## Support

For issues and questions:
- Check the troubleshooting section
- Review Appwrite documentation
- Consult the code comments for implementation details

## Credits

Built with:
- [Appwrite](https://appwrite.io/) - Backend-as-a-Service
- [SignaturePad.js](https://github.com/szimek/signature_pad) - Signature capture
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation
- [SortableJS](https://github.com/SortableJS/Sortable) - Drag and drop