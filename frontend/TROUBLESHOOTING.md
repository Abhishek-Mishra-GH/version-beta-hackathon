# Troubleshooting Guide

## Common Issues and Solutions

### 1. localStorage is not defined (SSR Error)

**Error Message:**
```
ReferenceError: localStorage is not defined
at getOrCreatePatientId (src\utils\user-ids.ts:47:18)
```

**Cause:** Functions accessing `localStorage` were being called during server-side rendering.

**Solution:** ✅ **FIXED** - User ID functions now check for browser environment:
```typescript
if (typeof window === "undefined" || typeof localStorage === "undefined") {
  return ""; // Return empty string during SSR
}
```

Patient/Doctor IDs are now initialized in `useEffect` (client-side only).

---

### 2. IPFS Upload Network Error

**Error Message:**
```
IPFS upload error: TypeError: fetch failed
[cause]: Error: getaddrinfo ENOTFOUND api.pinata.cloud
```

**Possible Causes:**
1. No internet connection
2. DNS resolution failure
3. Firewall blocking api.pinata.cloud
4. VPN/proxy interfering with connection
5. Pinata service temporarily down

**Solutions:**

#### Check Internet Connection
```bash
ping 8.8.8.8
ping api.pinata.cloud
```

#### Test Pinata API Directly
```bash
curl -X GET https://api.pinata.cloud/data/testAuthentication \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Check Environment Variables
Ensure `.env.local` has valid credentials:
```bash
PINATA_JWT=your_actual_jwt_token
NEXT_PUBLIC_PINATA_GATEWAY=your-gateway.mypinata.cloud
```

#### Restart Development Server
```bash
# Stop the server (Ctrl+C)
npm run dev
```

#### Use Alternative Gateway (Temporary Workaround)
If Pinata API is unreachable, you can temporarily disable IPFS upload:

Edit `src/app/patient-dashboard/page.tsx` and comment out the IPFS upload step:
```typescript
// Skip IPFS for testing
// const ipfsResponse = await fetch("/api/ipfs", ...);
const ipfsHash = `Qm${Date.now().toString(36)}`; // Mock CID
```

#### Check Pinata Status
Visit: https://status.pinata.cloud/

---

### 3. WalletConnect Warning

**Warning Message:**
```
WalletConnect Core is already initialized. This is probably a mistake and can lead to unexpected behavior. Init() was called 3 times.
```

**Impact:** Non-critical warning, doesn't break functionality.

**Cause:** WalletConnect being initialized multiple times during hot reloading.

**Solution:** Ignore during development. For production, ensure proper cleanup:
```typescript
useEffect(() => {
  // Initialize wallet
  return () => {
    // Cleanup on unmount
  };
}, []);
```

---

### 4. AI Processing Taking Too Long

**Symptom:** Upload stuck at "Processing with AI..." for 40+ seconds.

**Cause:** Gemini API slow response or rate limiting.

**Solutions:**

#### Check Gemini API Key
Ensure valid API key in `.env.local`:
```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

#### Test Gemini API
Visit: https://makersuite.google.com/app/apikey

Check quota usage.

#### Reduce Mock Data Size
Edit `src/app/api/upload/route.ts` and shorten `MOCK_MEDICAL_TEXT`.

#### Use Faster Model
Change model in upload route:
```typescript
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
```

---

### 5. PDF Upload Fails

**Error:** "Only PDF files are allowed"

**Cause:** File type validation or incorrect file extension.

**Solution:**
- Ensure file has `.pdf` extension
- Check file is not corrupted
- Try different PDF file

---

### 6. Blockchain Transaction Fails

**Error:** "User rejected transaction" or Gas estimation failed

**Causes:**
1. MetaMask not connected
2. Insufficient gas
3. Wrong network
4. Contract not deployed

**Solutions:**

#### Connect MetaMask
- Click "Connect MetaMask" on home page
- Approve connection in popup

#### Check Network
Ensure connected to **Arbitrum** network in MetaMask.

#### Check Gas Balance
Need ETH for gas fees on Arbitrum.

#### Verify Contract Address
Check `src/utils/contract.ts` has correct contract address.

---

### 7. Records Not Displaying

**Symptom:** Uploaded records don't appear in "Records" tab.

**Causes:**
1. Blockchain transaction not confirmed
2. Wrong patient ID
3. Contract state not synced

**Solutions:**

#### Wait for Confirmation
Blockchain transactions need 1-2 block confirmations (10-30 seconds).

#### Check Patient ID
Open browser console:
```javascript
localStorage.getItem("patient_id")
```

Should match format: `PAT_XXXX`

#### Refresh Page
```
F5 or Ctrl+R
```

#### Clear Cache and Reload
```javascript
localStorage.clear()
// Reload page
```

---

### 8. Doctor Portal Search Fails

**Error:** "No records found"

**Causes:**
1. Patient hasn't uploaded records
2. Access not granted
3. Wrong patient ID format

**Solutions:**

#### Verify Patient ID Format
Must be exact match: `PAT_XXXX`

#### Check Access Grants
Patient must grant access first in "Access Control" tab.

#### Test with Your Own Patient ID
As patient, grant access to your doctor ID, then search.

---

## Environment Setup Checklist

Before running the application, ensure:

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` created with all required variables:
  - [ ] `NEXT_PUBLIC_GEMINI_API_KEY`
  - [ ] `PINATA_JWT`
  - [ ] `NEXT_PUBLIC_PINATA_GATEWAY`
  - [ ] `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
  - [ ] `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
  - [ ] `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`
- [ ] MetaMask extension installed
- [ ] Connected to Arbitrum network
- [ ] Have test ETH for gas
- [ ] Internet connection stable

---

## Debug Mode

### Enable Verbose Logging

Add to any component:
```typescript
useEffect(() => {
  console.log("Patient ID:", patientId);
  console.log("Records:", records);
  console.log("Wallet Connected:", isWalletConnected());
}, [patientId, records]);
```

### Check localStorage
```javascript
// Browser console
console.log(localStorage);
console.log("Wallet:", localStorage.getItem("wallet_address"));
console.log("Patient ID:", localStorage.getItem("patient_id"));
console.log("Doctor ID:", localStorage.getItem("doctor_id"));
```

### Test API Endpoints

**Test Upload API:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.pdf"
```

**Test IPFS API:**
```bash
curl -X POST http://localhost:3000/api/ipfs \
  -F "file=@test.pdf" \
  -F 'metadata={"fileName":"test.pdf"}'
```

---

## Getting Help

If issues persist:

1. **Check Logs:**
   - Browser console (F12)
   - Terminal where `npm run dev` is running

2. **Review Documentation:**
   - [DEMO_MODE.md](./DEMO_MODE.md)
   - [PINATA_SETUP.md](./PINATA_SETUP.md)
   - [IPFS_IMPLEMENTATION.md](./IPFS_IMPLEMENTATION.md)

3. **Common Fixes:**
   - Restart dev server
   - Clear browser cache
   - Clear localStorage
   - Reinstall dependencies: `rm -rf node_modules && npm install`

4. **Report Issue:**
   - Include error message
   - Include browser console output
   - Include terminal output
   - Note what you were doing when error occurred

---

## Quick Fixes Summary

| Issue | Quick Fix |
|-------|-----------|
| localStorage error | ✅ Fixed - restart dev server |
| IPFS network error | Check internet, test Pinata API |
| WalletConnect warning | Ignore in development |
| Slow AI processing | Normal (30-40s), check Gemini quota |
| No records displaying | Wait for blockchain confirmation |
| MetaMask not connecting | Refresh page, check extension |
| Wrong network | Switch to Arbitrum in MetaMask |
