# Cloudflare Deployment Guide

This guide explains how to deploy the Notebook Writer application using Cloudflare Workers, D1 database, and R2 storage, replacing the previous Appwrite backend.

## Prerequisites

- Cloudflare account with Workers, D1, and R2 enabled
- Node.js and npm installed
- Wrangler CLI installed (`npm install -g wrangler`)
- Git (for version control)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Cloudflare

```bash
# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create notebook_db

# Create R2 storage bucket
wrangler r2 bucket create notebook-storage
```

### 3. Update Configuration

Update `wrangler.toml` with the database ID from step 2:

```toml
[[d1_databases]]
binding = "DB"
database_name = "notebook_db"
database_id = "YOUR_DATABASE_ID_FROM_STEP_2"
```

Update `js/cloudflare-client.js` with your worker URL:

```javascript
const cloudflareClient = new CloudflareClient('https://notebook-writer.YOUR_SUBDOMAIN.workers.dev');
```

### 4. Set Up Database

```bash
# Execute the database schema
wrangler d1 execute notebook_db --file=schema.sql --local
```

### 5. Set Environment Variables

```bash
# Set admin credentials (replace with your actual credentials)
wrangler secret put ADMIN_EMAIL
# Enter: alexander_m113@outlook.com

wrangler secret put ADMIN_PASSWORD
# Enter: Arizonameet1
```

### 6. Deploy to Cloudflare

```bash
# Deploy the worker
npm run deploy
# or
wrangler deploy
```

### 7. Update Frontend Configuration

Update the Cloudflare client URL in `js/cloudflare-client.js` to match your deployed worker URL.

## Architecture Overview

### Components

1. **Cloudflare Workers**: Serverless API endpoints replacing Appwrite backend
2. **D1 Database**: SQLite-based database replacing Appwrite Collections
3. **R2 Storage**: S3-compatible object storage replacing Appwrite Storage
4. **Frontend**: Static HTML/CSS/JS deployed to Netlify (unchanged)

### Data Migration

The application uses the same data structure as the Appwrite version:

- **Notebooks**: Notebook configurations and settings
- **Groups**: User groups for notebook assignment
- **Users**: User accounts with first-name authentication
- **Pages**: Template and content pages
- **Page Elements**: Individual elements within template pages
- **Page Assignments**: Maps users to specific pages
- **Entries**: User submissions for specific pages
- **Entry Responses**: Actual user responses and uploaded files
- **Audit Log**: System action tracking

### Storage Buckets

- **notebook-covers**: Notebook cover images
- **page-backgrounds**: Page background images
- **entry-images**: User-uploaded images
- **signatures**: Digital signature PNGs
- **exports**: Generated PDF files

## API Endpoints

The Cloudflare Worker provides REST API endpoints:

### Database Operations

- `GET /api/{resource}` - List all documents
- `GET /api/{resource}/{id}` - Get specific document
- `POST /api/{resource}` - Create new document
- `PUT /api/{resource}/{id}` - Update document
- `DELETE /api/{resource}/{id}` - Delete document

### Storage Operations

- `POST /storage/{bucket}/{fileId}/upload` - Upload file
- `GET /storage/{bucket}/{fileId}/download` - Download file
- `POST /storage/{bucket}/{fileId}/delete` - Delete file

### Resource Types

- `notebooks`
- `groups`
- `users`
- `pages`
- `page-elements`
- `page-assignments`
- `entries`
- `entry-responses`
- `audit-log`

## Notebook Sync Feature

The application includes automatic content sync from Notebook A to Notebook B:

### How It Works

1. When admin creates/updates content in Notebook A, it automatically syncs to Notebook B
2. Only content (pages, page elements) is synced - user answers are NOT synced
3. Each notebook maintains separate user entries and responses

### Manual Sync

You can trigger manual sync using the NotebookSyncManager:

```javascript
// Sync from Notebook A to Notebook B
await notebookSyncManager.syncNotebooks(notebookAId, notebookBId);

// Check sync status
const status = await notebookSyncManager.getSyncStatus(notebookAId, notebookBId);
```

### Configuration

Update the notebook IDs in your admin dashboard or code to enable auto-sync:

```javascript
// In your admin dashboard or initialization
const notebookAId = 'your_notebook_a_id';
const notebookBId = 'your_notebook_b_id';

// Enable auto-sync
await notebookSyncManager.autoSyncToNotebookB(notebookAId, notebookBId);
```

## Development

### Local Development

```bash
# Start local development server
npm run dev
# or
wrangler dev

# This starts a local worker with local D1 database
```

### Testing

```bash
# Test the application locally
npm start
# Open http://localhost:8000 in your browser
```

### Database Management

```bash
# Execute SQL commands
wrangler d1 execute notebook_db --local --command="SELECT * FROM notebooks"

# Backup database
wrangler d1 export notebook_db --local --output=backup.sql

# Restore database
wrangler d1 execute notebook_db --local --file=backup.sql
```

## Production Deployment

### 1. Deploy Worker

```bash
wrangler deploy
```

### 2. Configure Custom Domain (Optional)

```bash
# Add custom domain to your worker
wrangler domains add notebook.yourdomain.com
```

### 3. Update Frontend URL

Update the worker URL in `js/cloudflare-client.js` to use your custom domain or the default `.workers.dev` domain.

### 4. Test Production

- Access your Netlify frontend: https://4146notebook.netlify.app/
- Test admin login
- Test user login
- Create notebooks and pages
- Test file uploads
- Verify notebook sync functionality

## Monitoring and Debugging

### View Logs

```bash
# View worker logs
wrangler tail

# View specific logs
wrangler tail --format=pretty
```

### Analytics

Access Cloudflare Analytics dashboard for:
- Request metrics
- Error rates
- Performance data
- Geographic distribution

### Troubleshooting

**Worker not responding:**
- Check worker logs: `wrangler tail`
- Verify database connectivity
- Check environment variables

**Database errors:**
- Verify schema was executed: `wrangler d1 execute notebook_db --local --command="SELECT name FROM sqlite_master WHERE type='table'"`
- Check database ID in wrangler.toml

**Storage errors:**
- Verify R2 bucket exists: `wrangler r2 bucket list`
- Check bucket permissions

**CORS issues:**
- Worker handles CORS automatically
- Check browser console for specific errors

## Security Considerations

1. **API Keys**: Your Cloudflare API token is stored in cloud secrets manager
2. **Admin Credentials**: Stored as environment variables in Cloudflare Workers
3. **Data Encryption**: R2 provides encryption at rest
4. **HTTPS**: All Cloudflare Workers support HTTPS by default
5. **Rate Limiting**: Consider implementing rate limiting in the worker

## Cost Estimation

Cloudflare Free Tier includes:
- **Workers**: 100,000 requests/day
- **D1**: 5GB storage, 5 million reads/day
- **R2**: 10GB storage, 1 million Class A operations/month

For most notebook applications, the free tier should be sufficient.

## Migration from Appwrite

If migrating from the existing Appwrite setup:

1. **Export Data**: Use Appwrite console to export existing data
2. **Transform Data**: Convert Appwrite JSON format to match D1 schema
3. **Import Data**: Use wrangler to import transformed data
4. **Update Configuration**: Replace Appwrite client with Cloudflare client
5. **Test**: Verify all functionality works with new backend

## Support

For issues:
- Check Cloudflare Workers documentation: https://developers.cloudflare.com/workers/
- Check D1 documentation: https://developers.cloudflare.com/d1/
- Check R2 documentation: https://developers.cloudflare.com/r2/
- Review worker logs: `wrangler tail`

## Backup and Recovery

### Database Backup

```bash
# Export database
wrangler d1 export notebook_db --output=backup_$(date +%Y%m%d).sql
```

### Storage Backup

```bash
# List all files in R2 bucket
wrangler r2 object list notebook-storage

# Download specific files for backup
wrangler r2 object get notebook-storage/file-id --file=backup.jpg
```

### Recovery

```bash
# Restore database
wrangler d1 execute notebook_db --file=backup.sql

# Restore storage files
wrangler r2 object put notebook-storage/file-id --file=backup.jpg
```
