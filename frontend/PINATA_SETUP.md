# Pinata IPFS Setup Guide

This guide will help you set up Pinata for IPFS storage in the MediChain application.

## What is Pinata?

Pinata is a pinning service that makes it easy to store and manage files on IPFS (InterPlanetary File System). It provides:
- Reliable IPFS pinning
- Fast CDN-backed gateways
- File management dashboard
- API access for programmatic uploads

## Setup Steps

### 1. Create a Pinata Account

1. Visit [https://app.pinata.cloud/register](https://app.pinata.cloud/register)
2. Sign up for a free account
3. Verify your email address
4. Log in to the Pinata dashboard

### 2. Get Your API Credentials

#### Generate JWT Token

1. In the Pinata dashboard, click on **API Keys** in the left sidebar
2. Click **New Key** button
3. Configure the key:
   - **Key Name**: `MediChain Dev` (or any name you prefer)
   - **Permissions**: Check **Admin** (or at minimum: `pinFileToIPFS`, `pinJSONToIPFS`)
4. Click **Create Key**
5. **IMPORTANT**: Copy the JWT token immediately - you won't be able to see it again!
6. Store it safely

#### Get Your Gateway Domain

1. In the Pinata dashboard, click on **Gateways** in the left sidebar
2. You'll see your default gateway domain (e.g., `gateway.pinata.cloud`)
3. For better performance, you can create a dedicated gateway:
   - Click **Create Gateway**
   - Choose a subdomain (e.g., `medichain.mypinata.cloud`)
   - Click **Create**
4. Copy your gateway domain

### 3. Configure Environment Variables

1. Open your `.env.local` file in the frontend directory
2. Add the following variables:

```bash
# Pinata IPFS Configuration
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_PINATA_GATEWAY=your-gateway.mypinata.cloud
```

**Example:**
```bash
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxMjM0NTY3OCIsImVtYWlsIjoieW91ckBleGFtcGxlLmNvbSJ9LCJpYXQiOjE2MTUyMzQ1Njd9.abcdef123456...
NEXT_PUBLIC_PINATA_GATEWAY=medichain.mypinata.cloud
```

3. Save the file
4. Restart your development server

### 4. Verify Setup

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Patient Dashboard
3. Try uploading a medical document
4. After processing, click "Upload to Blockchain"
5. Check the browser console for any errors
6. If successful, you should see:
   - Progress bar reaching 100%
   - Success message with IPFS hash
   - The file should appear in your Pinata dashboard under **Files**

### 5. View Uploaded Files

1. Go to [https://app.pinata.cloud/pinmanager](https://app.pinata.cloud/pinmanager)
2. You'll see all files uploaded through MediChain
3. Click on any file to see details:
   - CID (Content Identifier)
   - File size
   - Upload date
   - Gateway URL

## Free Tier Limits

Pinata's free tier includes:
- **1 GB** of storage
- **100 GB** bandwidth per month
- Unlimited pins
- Basic gateway access

This is sufficient for development and testing. For production, consider upgrading to a paid plan.

## Troubleshooting

### Error: "PINATA_JWT not configured"

**Solution**: Make sure you've added the `PINATA_JWT` environment variable to your `.env.local` file and restarted the dev server.

### Error: "Failed to upload to IPFS"

**Possible causes:**
1. Invalid JWT token - regenerate a new API key
2. Insufficient permissions - ensure the API key has `pinFileToIPFS` permission
3. File size exceeds limits - check Pinata dashboard for storage usage
4. Network issues - check your internet connection

### Files not appearing in Pinata dashboard

**Solution**: 
1. Wait a few seconds and refresh the page
2. Check the **Files** section (not Pins)
3. Verify the upload completed successfully in the browser console

### Gateway URL not loading

**Solution**:
1. Wait 10-30 seconds for IPFS propagation
2. Try using the default gateway: `gateway.pinata.cloud`
3. Ensure the CID is correct

## Security Best Practices

1. **Never commit** `.env.local` to version control
2. Use different API keys for development and production
3. Rotate API keys regularly
4. Use the principle of least privilege - only grant necessary permissions
5. Monitor usage in Pinata dashboard to detect unusual activity

## Additional Resources

- [Pinata Documentation](https://docs.pinata.cloud/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [Pinata SDK Documentation](https://docs.pinata.cloud/web3/sdk)

## Support

If you encounter issues:
1. Check the [Pinata Status Page](https://status.pinata.cloud/)
2. Visit [Pinata Support](https://www.pinata.cloud/support)
3. Join the [Pinata Discord](https://discord.gg/pinata)
