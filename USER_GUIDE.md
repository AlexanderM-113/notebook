# Notebook Writer - Complete User Guide

## Quick Start

### For Administrators

1. **Start the Application**
   ```bash
   npm start
   ```
   The app will run on `http://localhost:8000`

2. **Admin Login**
   - Open `http://localhost:8000` in your browser
   - Click on "Admin Login" (or switch from User Login)
   - Enter credentials:
     - **Email**: `alexander_m113@outlook.com`
     - **Password**: `Arizonameet1`

3. **Initial Setup**
   - Create groups to organize users
   - Create notebooks for each group
   - Add users to groups
   - Design pages and assign them to users

### For Regular Users

1. **Access the Application**
   - Open the application URL provided by your administrator
   - Enter your first name on the login screen
   - Click "Enter" to access your dashboard

2. **Complete Assigned Pages**
   - View your assigned pages on the dashboard
   - Click on a page to open it
   - Fill out all required questions and upload images
   - Sign the page using the signature pad
   - Click "Submit Page" when complete

---

## Administrator Guide

### Dashboard Overview

The admin dashboard has 5 main sections:

#### 1. Notebooks Tab
- **View all notebooks**: See all created notebooks with status and statistics
- **Create New Notebook**: Click "Create New Notebook" to start
- **Edit Notebooks**: Click "Edit" on any notebook card to modify it
- **View Entries**: Click "Entries" to see submissions for that notebook
- **Delete Notebooks**: Remove notebooks (careful - this deletes all data)

#### 2. Entries Tab
- **View all submissions**: See all user submissions across notebooks
- **Filter by notebook**: Use the dropdown to filter submissions
- **Filter by status**: View locked/unlocked entries
- **Search users**: Find submissions by user name
- **View details**: Click "View" to see complete submission
- **Lock/Unlock entries**: Control whether users can edit their submissions

#### 3. Groups Tab
- **Manage user groups**: Create and manage user groups
- **View group members**: See how many users are in each group
- **Edit groups**: Modify group details
- **Delete groups**: Remove groups (also removes user assignments)

#### 4. Audit Log Tab
- **Track all actions**: See complete history of system actions
- **Filter by action type**: View specific types of actions
- **Filter by date range**: Narrow down by time period
- **Compliance tracking**: Maintain audit trail for regulatory requirements

#### 5. Settings Tab
- **Application settings**: Customize app name and colors
- **PDF settings**: Configure paper size, orientation, and export options
- **Cover page settings**: Toggle cover page inclusion
- **Table of contents**: Toggle TOC inclusion

### Creating a Notebook

1. **Click "Create New Notebook"** in the Notebooks tab
2. **Fill in notebook details**:
   - **Title**: Name of the notebook (e.g., "Employee Handbook")
   - **Type**: Category of notebook (e.g., "HR", "Training")
   - **Description**: Optional description
   - **Group**: Assign to a user group
3. **Configure cover page**:
   - Add cover title and subtitle
   - Set background and text colors
   - Upload cover logo (optional)
4. **Set global styling**:
   - Font family and size
   - Text and background colors
   - PDF export settings
5. **Click "Create"** to save the notebook

### Designing Pages

1. **Open the notebook editor** by clicking "Edit" on a notebook
2. **Add pages** using the sidebar buttons:
   - **+ Template Page**: For fillable forms with questions
   - **+ Content Page**: For fixed content that users acknowledge

#### Template Pages (Fillable Forms)

1. **Configure page settings**:
   - Page title and number
   - Background color or image
   - Font settings
   - Signature requirement toggle

2. **Add page elements**:
   - **+ Question**: Add text, textarea, or numeric questions
   - **+ Image Upload**: Allow users to upload images
   - **+ Text Section**: Add instructions or headers
   - **+ Divider**: Separate content sections
   - **+ Spacing**: Add visual spacing

3. **Configure each element**:
   - **Questions**: Set field type, required status, validation
   - **Image Uploads**: Set max file size, allowed formats
   - **Text Sections**: Add content and styling

4. **Preview and save**: Click "Preview" to test, "Save Page" to save

#### Content Pages (Fixed Content)

1. **Switch to "Content Pages" tab** in the sidebar
2. **Add content page** using "+ Content Page" button
3. **Configure page settings** (same as template pages)
4. **Add content** in the rich text editor:
   - Type or paste content
   - Use basic formatting (bold, italic, etc.)
   - Add links and lists
5. **Set signature requirement** if users need to acknowledge

### Managing Users and Groups

#### Creating Groups

1. **Go to Groups tab**
2. **Click "Create New Group"**
3. **Enter group name** (e.g., "Department A", "New Hires")
4. **Optional**: Add description
5. **Save the group**

#### Adding Users

1. **Go to Groups tab**
2. **Find the group** you want to add users to
3. **Click "View Users"** on the group card
4. **Click "Add User"**
5. **Enter user details**:
   - **First Name**: Required (used for login)
   - **Full Name**: Optional
   - **Email**: Optional
   - **Status**: Set to "active" to enable login
6. **Save the user**

#### Assigning Pages to Users

1. **Go to Groups tab**
2. **Click "View Users"** on a group
3. **Find the user** you want to assign pages to
4. **Click "Assign Pages"**
5. **Select pages** from the available pages
6. **Set due dates** (optional)
7. **Save assignments**

### Reviewing User Submissions

1. **Go to Entries tab**
2. **Filter entries** by notebook, status, or user name
3. **Click "View"** on any entry to see:
   - User information
   - Submission date
   - All responses to questions
   - Uploaded images
   - Digital signature
4. **Lock/Unlock entries**:
   - **Locked**: Users cannot edit (default after submission)
   - **Unlocked**: Users can edit their submission

### Exporting Notebooks

1. **Go to Entries tab**
2. **Find the user's entry** you want to export
3. **Click "View"** to see the entry details
4. **Click "Export Notebook PDF"** to generate:
   - Cover page with branding
   - Table of contents
   - All completed pages with responses
   - Uploaded images
   - Digital signatures
   - Professional formatting

---

## Regular User Guide

### Login Process

1. **Open the application URL** provided by your administrator
2. **Enter your first name** exactly as registered by your admin
3. **Click "Enter"** to access your dashboard

### Dashboard Overview

Your dashboard shows:
- **Welcome message** with your name
- **Progress bar** showing completion status
- **List of assigned pages** with completion status
- **Logout button**

### Completing Pages

1. **View your assigned pages** on the dashboard
2. **Click on any page** to open it
3. **Fill out the form**:
   - Answer all required questions (marked with *)
   - Upload required images
   - Add optional information as requested
4. **Sign the page**:
   - Use your mouse or finger to sign in the signature box
   - Click "Clear" if you need to redo your signature
   - Click "Confirm Signature" when satisfied
5. **Submit the page**:
   - Review your answers
   - Click "Submit Page" to finalize
   - Once submitted, the page is locked and cannot be edited

### Progress Tracking

- **Progress bar**: Shows how many pages you've completed
- **Page status**: Each page shows "Completed" or "Pending"
- **Completion percentage**: Updated automatically as you complete pages

### Getting Help

If you encounter issues:
- **Can't log in**: Contact your administrator to verify your name is registered correctly
- **Pages not showing**: Check with your admin that pages have been assigned to you
- **Submission errors**: Ensure all required fields are filled and signature is completed
- **Need to edit**: Contact your administrator to unlock your submission

---

## Troubleshooting

### Common Issues

#### Admin Login Issues

**Problem**: Can't log in as admin
**Solution**: 
- Verify you're using correct credentials: `alexander_m113@outlook.com` / `Arizonameet1`
- Check that caps lock is off
- Try refreshing the page

#### User Login Issues

**Problem**: User can't log in
**Solution**:
- Verify the user's first name is spelled exactly as registered
- Check that the user's status is set to "active" in the admin panel
- Ensure the user has been assigned to a group
- Verify that pages have been assigned to the user

#### Appwrite Connection Issues

**Problem**: "Failed to connect to Appwrite" errors
**Solution**:
- Check your internet connection
- Verify the API endpoint is correct: `https://sfo.cloud.appwrite.io/v1`
- Ensure the API key has proper permissions
- Check Appwrite service status

#### PDF Export Issues

**Problem**: PDF generation fails
**Solution**:
- Check browser console for specific errors
- Ensure all storage files are accessible
- Verify that the user has completed all required fields
- Try exporting individual pages first

#### Page Submission Issues

**Problem**: Can't submit page
**Solution**:
- Ensure all required fields are filled
- Check that signature is completed and confirmed
- Verify file uploads meet size requirements
- Check for validation error messages

---

## Best Practices

### For Administrators

1. **Plan your notebook structure** before creating
2. **Use groups strategically** to organize users by department, role, etc.
3. **Test pages** before assigning to users
4. **Regularly review submissions** to provide feedback
5. **Keep audit logs** for compliance and tracking
6. **Back up important data** regularly

### For Users

1. **Complete pages promptly** to avoid missing deadlines
2. **Read instructions carefully** before answering questions
3. **Use clear, concise language** in text responses
4. **Upload appropriate images** that meet requirements
5. **Sign pages carefully** - signatures are legally binding
6. **Keep a copy** of exported PDFs for your records

---

## Security Notes

### For Administrators

- **Protect admin credentials**: Never share admin login details
- **Regular password changes**: Consider updating admin password periodically
- **Monitor audit logs**: Review regularly for suspicious activity
- **User access management**: Remove inactive users promptly
- **Data privacy**: Ensure user data is handled according to privacy policies

### For Users

- **Don't share login details**: Your first name is your login identifier
- **Secure your device**: Log out when using shared devices
- **Report issues**: Contact admin if you notice suspicious activity
- **Data accuracy**: Ensure your submissions are accurate and complete

---

## Technical Support

If you encounter technical issues not covered in this guide:

1. **Check the browser console** for error messages (F12 → Console)
2. **Verify internet connection** and Appwrite service status
3. **Try a different browser** (Chrome, Firefox, Safari, Edge)
4. **Clear browser cache** and cookies
5. **Contact your administrator** with specific error details

For development or deployment issues, refer to the technical documentation or contact the development team.
