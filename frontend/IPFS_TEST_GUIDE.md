# IPFS Upload Test Guide

## Quick Test Checklist

Use this guide to verify IPFS storage is working correctly.

### ✅ Pre-Test Setup

1. **Environment Variables Set**
   ```bash
   # Check .env.local has these:
   PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   NEXT_PUBLIC_PINATA_GATEWAY=your-gateway.mypinata.cloud
   ```

2. **Development Server Running**
   ```bash
   npm run dev
   ```

3. **MetaMask Connected**
   - Install MetaMask extension
   - Connect to Arbitrum network
   - Have test ETH for gas

4. **Test PDF File Ready**
   - Any PDF file (medical report, test document, etc.)
   - Recommended: < 5MB for faster upload

---

## 🧪 Test Procedure

### Test 1: Upload File to IPFS

1. Navigate to `http://localhost:3000`
2. Click "Connect MetaMask" and approve connection
3. Click "Patient Dashboard" button
4. Click "Upload" tab in dashboard
5. Click "Select PDF" button
6. Choose a PDF file
7. Wait for AI processing (10-30 seconds)
8. Observe success message: "Document processed successfully!"
9. Click "Upload to Blockchain" button
10. Watch progress bar: 0% → 20% → 60% → 100%

**Expected Results**:
- ✅ Progress bar completes smoothly
- ✅ Success message appears: "Successfully uploaded to blockchain!"
- ✅ Green checkmark icon displayed
- ✅ IPFS hash shown (starts with "Qm" or "baf")
- ✅ No error messages in browser console

**If Errors Occur**:
- Check browser console (F12)
- Verify PINATA_JWT in .env.local
- Confirm Pinata dashboard shows API key is active
- Check internet connection

---

### Test 2: View Record in Dashboard

1. After successful upload, click "Records" tab
2. Find your uploaded document in the list

**Expected Results**:
- ✅ Document appears in records list
- ✅ Shows filename/metadata
- ✅ Displays CID (truncated, e.g., "Qm1234...5678")
- ✅ Shows upload date
- ✅ "View on IPFS" link is visible
- ✅ "Verified" badge displayed

---

### Test 3: Access File via IPFS Gateway

1. In Records tab, click "View on IPFS" link
2. New tab opens with gateway URL

**Expected Results**:
- ✅ New tab opens to Pinata gateway URL
- ✅ URL format: `https://your-gateway.mypinata.cloud/ipfs/Qm...`
- ✅ PDF file loads in browser
- ✅ File content matches original upload
- ✅ No 404 or access errors

**Common Issues**:
- **File not loading immediately**: Wait 30-60 seconds for IPFS propagation
- **404 Error**: Check CID is correct, try default gateway: `gateway.pinata.cloud`
- **Gateway timeout**: Refresh page, IPFS network may be slow

---

### Test 4: Verify in Pinata Dashboard

1. Open [https://app.pinata.cloud/pinmanager](https://app.pinata.cloud/pinmanager)
2. Log in to your Pinata account
3. Navigate to "Files" section

**Expected Results**:
- ✅ Uploaded file appears in file list
- ✅ Filename matches your upload
- ✅ CID matches blockchain record
- ✅ File size is correct
- ✅ Upload timestamp is recent
- ✅ Status shows "Pinned"

---

### Test 5: Blockchain Verification

1. Open browser console (F12) during upload
2. Look for transaction logs

**Expected Results**:
- ✅ Console shows: "Uploading to IPFS..."
- ✅ Console shows: "IPFS upload successful: Qm..."
- ✅ Console shows: "Recording on blockchain..."
- ✅ Console shows: "Transaction confirmed"
- ✅ No error messages or failed transactions

---

## 🔍 Debug Checklist

If tests fail, check these common issues:

### Issue: "PINATA_JWT not configured"
- [ ] `.env.local` file exists
- [ ] `PINATA_JWT` variable is set
- [ ] JWT token is copied correctly (no spaces)
- [ ] Development server was restarted after adding env vars

### Issue: Upload fails with network error
- [ ] Internet connection is stable
- [ ] Pinata API is accessible (check https://status.pinata.cloud/)
- [ ] API key hasn't expired
- [ ] API key has `pinFileToIPFS` permission

### Issue: File not appearing in records
- [ ] Blockchain transaction completed successfully
- [ ] Wallet has sufficient ETH for gas
- [ ] Contract address is correct
- [ ] Check blockchain explorer for transaction

### Issue: IPFS link doesn't load
- [ ] Wait 30-60 seconds for propagation
- [ ] Try alternative gateway: `gateway.pinata.cloud`
- [ ] Verify CID format (should start with Qm or baf)
- [ ] Check Pinata dashboard to confirm file is pinned

---

## 📊 Test Results Template

Use this template to document your test results:

```
Test Date: ___________
Tester: ___________

Test 1: Upload File to IPFS
- Status: [ ] Pass [ ] Fail
- Upload time: _____ seconds
- IPFS CID: Qm___________
- Notes: ___________

Test 2: View Record in Dashboard
- Status: [ ] Pass [ ] Fail
- Record displayed correctly: [ ] Yes [ ] No
- IPFS link visible: [ ] Yes [ ] No
- Notes: ___________

Test 3: Access via IPFS Gateway
- Status: [ ] Pass [ ] Fail
- Gateway URL: ___________
- File loaded: [ ] Yes [ ] No
- Load time: _____ seconds
- Notes: ___________

Test 4: Verify in Pinata Dashboard
- Status: [ ] Pass [ ] Fail
- File found: [ ] Yes [ ] No
- CID matches: [ ] Yes [ ] No
- Notes: ___________

Test 5: Blockchain Verification
- Status: [ ] Pass [ ] Fail
- Transaction hash: 0x___________
- Gas used: ___________
- Notes: ___________

Overall Test Result: [ ] All Pass [ ] Some Failed

Issues Found:
1. ___________
2. ___________
3. ___________

Recommendations:
1. ___________
2. ___________
3. ___________
```

---

## 🎯 Success Criteria

All tests pass when:
- ✅ File uploads to IPFS without errors
- ✅ Real CID is generated (not simulated hash)
- ✅ Record appears in dashboard with IPFS link
- ✅ File is accessible via gateway URL
- ✅ File appears in Pinata dashboard
- ✅ Blockchain transaction confirms successfully
- ✅ No console errors during entire flow

---

## 📞 Support

If tests fail after trying all troubleshooting steps:

1. **Check Documentation**:
   - Read [PINATA_SETUP.md](./PINATA_SETUP.md)
   - Review [IPFS_IMPLEMENTATION.md](./IPFS_IMPLEMENTATION.md)

2. **Verify API Configuration**:
   - Test API key in Pinata dashboard
   - Try uploading directly in Pinata UI
   - Check API key permissions

3. **Test with Curl** (to isolate frontend issues):
   ```bash
   curl -X POST \
     https://api.pinata.cloud/pinning/pinFileToIPFS \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "file=@test.pdf"
   ```

4. **Contact Support**:
   - Pinata Discord: https://discord.gg/pinata
   - Pinata Support: https://www.pinata.cloud/support
   - GitHub Issues: Open issue in repository

---

## 🚀 Next Steps After Successful Test

Once all tests pass:

1. **Test with Different File Sizes**:
   - Small file (< 1MB)
   - Medium file (1-5MB)
   - Large file (5-10MB)

2. **Test Upload Multiple Files**:
   - Upload 3-5 files in succession
   - Verify all appear in records
   - Check all IPFS links work

3. **Test Access Control** (optional):
   - Upload as Patient A
   - Try accessing as Patient B
   - Verify access is restricted

4. **Performance Testing**:
   - Measure upload time for various file sizes
   - Test gateway load times
   - Monitor Pinata bandwidth usage

5. **Production Preparation**:
   - Set up production Pinata account
   - Configure custom gateway domain
   - Set up monitoring/alerting
   - Review security best practices

---

**Happy Testing! 🎉**
