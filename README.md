# Notebook Writer

A comprehensive web application for managing customizable digital notebooks with fillable forms and content pages. Built with HTML, CSS, JavaScript, and Cloudflare Workers backend.

## 📚 Documentation

- **[User Guide](USER_GUIDE.md)** - Complete guide for administrators and regular users
- **[Cloudflare Deployment Guide](CLOUDFLARE_DEPLOYMENT.md)** - How to deploy with Cloudflare Workers, D1, and R2
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Legacy Appwrite deployment guide
- **[Changes Log](CHANGES.md)** - Recent fixes and improvements

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
- **Backend**: Cloudflare Workers (Serverless API)
- **Database**: Cloudflare D1 (SQLite-based)
- **Storage**: Cloudflare R2 (S3-compatible object storage)
- **PDF Generation**: jsPDF + html2pdf
- **Signature Capture**: SignaturePad.js
- **Drag & Drop**: SortableJS

## Setup Instructions

### Prerequisites
- Cloudflare account with Workers, D1, and R2 enabled
- Node.js and npm installed
- Web browser with JavaScript enabled
- Basic knowledge of web development

### Step 1: Cloudflare Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Cloudflare**
   ```bash
   # Login to Cloudflare
   wrangler login
   
   # Create D1 database
   wrangler d1 create notebook_db
   
   # Create R2 storage bucket
   wrangler r2 bucket create notebook-storage
   ```

3. **Update Configuration**
   - Update `wrangler.toml` with your database ID
   - Update `js/cloudflare-client.js` with your worker URL

4. **Set Up Database**
   ```bash
   wrangler d1 execute notebook_db --file=schema.sql --local
   ```

5. **Set Environment Variables**
   ```bash
   wrangler secret put ADMIN_EMAIL
   wrangler secret put ADMIN_PASSWORD
   ```

6. **Deploy to Cloudflare**
   ```bash
   npm run deploy
   ```

### Step 2: Configure Application

1. **Update Cloudflare Worker URL**
   - Open `js/cloudflare-client.js`
   - Update the worker URL with your deployed worker URL:
   ```javascript
   const cloudflareClient = new CloudflareClient('https://notebook-writer.YOUR_SUBDOMAIN.workers.dev');
   ```

### Step 3: Deploy the Application

1. **Local Development**
   - Simply open `index.html` in your web browser
   - Or use a local server: `npm start`
   - For local worker development: `npm run dev`

2. **Production Deployment**
   - Frontend is already deployed to Netlify: https://4146notebook.netlify.app/
   - Backend is deployed to Cloudflare Workers
   - Ensure HTTPS is enabled (automatic with Cloudflare)

### Step 4: Initial Configuration

1. **Create Admin Account**
   - Admin credentials are set via environment variables
   - Use the admin login interface with email/password

2. **Create Groups**
   - Log in as admin
   - Navigate to Groups tab
   - Create "Group A" and "Group B"

3. **Create Notebooks**
   - Navigate to Notebooks tab
   - Create "Notebook A" and assign to Group A
   - Create "Notebook B" and assign to Group B

4. **Configure Notebook Sync**
   - Content from Notebook A automatically syncs to Notebook B
   - User answers are NOT synced between notebooks
   - Each notebook maintains separate user entries

5. **Add Users**
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

### Tables (D1 Database)

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

### Storage Buckets (R2)

- **notebook-covers**: Notebook cover images (5MB max)
- **page-backgrounds**: Page background images (5MB max)
- **entry-images**: User-uploaded images (10MB max)
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
- **Cloudflare Security**: DDoS protection, HTTPS, edge security

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
- Verify worker is deployed and running

**Cloudflare connection errors**
- Verify worker URL in cloudflare-client.js
- Check worker logs: `wrangler tail`
- Ensure database and storage are configured
- Check environment variables are set

## Development

### File Structure
```
notebook/
├── index.html              # Main application file
├── wrangler.toml           # Cloudflare Workers configuration
├── schema.sql              # D1 database schema
├── css/
│   ├── common.css          # Shared styles
│   ├── admin.css           # Admin interface styles
│   ├── user.css            # User interface styles
│   └── responsive.css      # Mobile responsiveness
├── js/
│   ├── cloudflare-client.js    # Cloudflare API client
│   ├── auth.js                 # Authentication management
│   ├── app.js                  # Main application logic
│   ├── common/                 # Shared utilities
│   │   ├── api-client-cloudflare.js  # Cloudflare API wrapper
│   │   ├── storage-utils.js         # Storage utilities
│   │   └── ...
│   ├── admin/                  # Admin functionality
│   │   ├── notebook-sync.js        # Notebook sync manager
│   │   └── ...
│   └── user/                   # User functionality
├── src/
│   └── worker.js           # Cloudflare Worker script
├── lib/                    # External libraries
├── assets/                 # Static assets
├── setup-cloudflare.js     # Cloudflare setup script
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

4. **Cloudflare Worker Endpoints**
   - Add new endpoints to `src/worker.js`
   - Update API client in `js/cloudflare-client.js`
   - Test with `wrangler dev`

## License

This project is provided as-is for educational and commercial use.

## Support

For issues and questions:
- Check the troubleshooting section
- Review Cloudflare documentation
- Consult the code comments for implementation details

## Credits

Built with:
- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless compute
- [Cloudflare D1](https://developers.cloudflare.com/d1/) - SQLite database
- [Cloudflare R2](https://developers.cloudflare.com/r2/) - Object storage
- [SignaturePad.js](https://github.com/szimek/signature_pad) - Signature capture
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation
- [SortableJS](https://github.com/SortableJS/Sortable) - Drag and drop