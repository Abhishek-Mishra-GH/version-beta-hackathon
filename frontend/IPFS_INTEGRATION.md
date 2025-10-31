# IPFS Integration Guide

## Overview
The patient dashboard now includes document upload functionality with a placeholder for IPFS storage integration.

## Current Implementation

### Upload Flow
1. User clicks "Upload Document" button
2. File picker opens (accepts: PDF, JPG, JPEG, PNG, DOC, DOCX)
3. User selects a file
4. Upload dialog modal appears showing:
   - File name and size
   - Progress bar during upload
   - Success confirmation

### Code Location
File: `src/app/patient-dashboard/page.tsx`

#### Key Functions to Implement

**`handleUploadToIPFS` (Line ~129)**
```typescript
const handleUploadToIPFS = async () => {
  if (!selectedFile) return;

  // TODO: IPFS Integration - Upload file to IPFS
  // Steps to implement:
  // 1. Install IPFS client: npm install ipfs-http-client
  // 2. Initialize IPFS client
  // 3. Upload file to IPFS
  // 4. Get IPFS hash (CID)
  // 5. Store hash with metadata in your database
  // 6. Update UI with success message
}
```

## IPFS Integration Options

### Option 1: Web3.Storage (Recommended for Hackathon)
```bash
npm install web3.storage
```

```typescript
import { Web3Storage } from 'web3.storage';

const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN });

const handleUploadToIPFS = async () => {
  if (!selectedFile) return;
  
  setUploadProgress(10);
  
  try {
    const cid = await client.put([selectedFile]);
    console.log('Stored on IPFS with CID:', cid);
    
    // Save metadata to your backend
    await fetch('/api/health-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: selectedFile.name,
        ipfsHash: cid,
        size: selectedFile.size,
        type: selectedFile.type,
      })
    });
    
    setUploadProgress(100);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Option 2: Pinata
```bash
npm install @pinata/sdk
```

### Option 3: IPFS HTTP Client (Self-hosted)
```bash
npm install ipfs-http-client
```

## Environment Variables Needed

Add to `.env.local`:
```env
NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_token_here
# or
NEXT_PUBLIC_PINATA_API_KEY=your_key_here
NEXT_PUBLIC_PINATA_SECRET_KEY=your_secret_here
```

## Backend API Endpoint Needed

Create: `src/app/api/health-records/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // TODO: Validate data
    // TODO: Store in database with user association
    // TODO: Record on blockchain (optional)
    
    return NextResponse.json({
      success: true,
      recordId: 'generated_id',
      ipfsHash: data.ipfsHash,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

## Next Steps

1. Choose IPFS provider (Web3.Storage recommended)
2. Get API credentials
3. Install required packages
4. Implement `handleUploadToIPFS` function
5. Create backend API endpoint
6. Add metadata storage (database)
7. Update health records list after successful upload
8. Optional: Add blockchain verification

## Security Considerations

- Encrypt sensitive documents before uploading
- Store encryption keys securely
- Validate file types and sizes
- Implement user authentication
- Add rate limiting
- Verify user ownership before allowing access

## UI Features Already Implemented

✅ File picker with type restrictions
✅ Upload progress indicator
✅ Success/error messaging
✅ Modal dialog for upload
✅ File size display
✅ Cancel functionality
✅ Minimal, clean UI design

## Testing Checklist

- [ ] Upload PDF document
- [ ] Upload image file
- [ ] Test file size limits
- [ ] Verify progress indicator
- [ ] Test cancel functionality
- [ ] Verify IPFS hash generation
- [ ] Test metadata storage
- [ ] Verify document retrieval
- [ ] Test error handling
- [ ] Mobile responsiveness
