# 🚀 Database & Authentication Setup Guide

This guide will walk you through setting up the database and authentication for HealthChain.

## Prerequisites

- Node.js and npm installed
- Git repository cloned
- Dependencies installed (`npm install`)

---

## 📦 Step 1: Supabase Setup

### 1.1 Create Supabase Account & Project

Follow the detailed instructions in **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**

**Quick summary:**
1. Go to [https://supabase.com/](https://supabase.com/) and sign up
2. Create a new project (name it `healthchain-db`)
3. Save your database password securely
4. Get your connection string from **Settings → Database → Connection pooling (Transaction mode)**

### 1.2 Configure Environment Variables

Create or update `.env.local` in the frontend directory:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Add your Supabase database URL:

```bash
DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

### 1.3 Generate SIWE Secret

**On Mac/Linux:**
```bash
openssl rand -base64 32
```

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Add to `.env.local`:
```bash
SIWE_SECRET="your_generated_secret_here"
```

---

## 🗄️ Step 2: Initialize Database

### 2.1 Generate Prisma Client

```bash
npx prisma generate
```

This creates the TypeScript types for your database models.

### 2.2 Run Database Migrations

```bash
npx prisma migrate dev --name init
```

This will:
- Create all tables (User, PatientProfile, DoctorProfile)
- Apply indexes for better performance
- Generate migration files in `prisma/migrations/`

### 2.3 Verify Database Setup

**Option 1: Prisma Studio (Recommended)**
```bash
npx prisma studio
```

Opens a GUI at `http://localhost:5555` where you can view/edit your database.

**Option 2: Supabase Dashboard**
1. Go to your Supabase project
2. Click **Table Editor** in the sidebar
3. Verify these tables exist:
   - `User`
   - `PatientProfile`
   - `DoctorProfile`
   - `_prisma_migrations`

---

## 🔐 Step 3: Test Authentication Flow

### 3.1 Start Development Server

```bash
npm run dev
```

### 3.2 Test SIWE Authentication

1. Open `http://localhost:3000`
2. Click **Connect Wallet** (make sure MetaMask is installed)
3. You should see a signature request popup
4. Sign the message
5. You'll be redirected to onboarding (first time) or your dashboard (returning user)

### 3.3 Complete Onboarding

**As a Patient:**
1. Select "Patient" role
2. Fill in your details:
   - Full Name (required)
   - Date of Birth
   - Blood Type
   - Email & Phone
   - Emergency Contact
   - Allergies (comma-separated)
   - Chronic Conditions
3. Click "Complete Registration"
4. You'll be redirected to Patient Dashboard

**As a Doctor:**
1. Select "Doctor" role
2. Fill in your details:
   - Full Name (required)
   - Specialty (required, e.g., "Cardiology")
   - License Number (required)
   - Hospital/Clinic
   - Years of Experience
   - Email & Phone
   - Credentials (comma-separated, e.g., "MD, FACC")
3. Click "Complete Registration"
4. You'll be redirected to Doctor Portal

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] DATABASE_URL added to `.env.local`
- [ ] SIWE_SECRET generated and added
- [ ] `npx prisma generate` completed successfully
- [ ] `npx prisma migrate dev` completed successfully
- [ ] Tables visible in Supabase or Prisma Studio
- [ ] Can connect wallet and sign SIWE message
- [ ] Onboarding form loads correctly
- [ ] Profile registration works
- [ ] Redirected to correct dashboard after registration
- [ ] Profile data visible in database

---

## 🐛 Troubleshooting

### "Can't reach database server"
- Check your DATABASE_URL is correct
- Verify your Supabase project is running (not paused)
- Try using Connection Pooling URL instead of Direct Connection

### "Invalid signature" during SIWE
- Make sure you're signing the message in MetaMask
- Check SIWE_SECRET is set in `.env.local`
- Try disconnecting and reconnecting your wallet

### "User already exists" error
- Another wallet address may already be registered with that license number
- Check the database in Prisma Studio
- Clear localStorage and try again

### Migration errors
```bash
# Reset database (development only!)
npx prisma migrate reset

# Or push schema without migrations
npx prisma db push
```

### "Prisma Client is not generated"
```bash
npx prisma generate
```

---

## 📊 Database Schema Overview

### User Table
- `id`: Unique identifier (CUID)
- `walletAddress`: Ethereum address (unique, indexed)
- `userType`: PATIENT or DOCTOR
- `createdAt`, `updatedAt`: Timestamps

### PatientProfile Table
- Personal info: name, DOB, email, phone, emergency contact
- Medical info: blood type, allergies, chronic conditions
- Profile: picture (IPFS CID), bio
- Linked to User via `userId`

### DoctorProfile Table
- Personal info: name, email, phone
- Professional info: specialty, license number, hospital, credentials
- Verification: status (auto-approved to VERIFIED), documents
- Profile: picture (IPFS CID), bio
- Linked to User via `userId`

---

## 🎯 Next Steps

After completing this setup:

1. **Phase 3: Discovery System** (Coming next)
   - Search for doctors by name/specialty
   - Search for patients (public profiles)
   - Display profile cards

2. **Phase 4: Access Request Flow** (Coming next)
   - Doctor requests access to patient
   - Patient approves/rejects in dashboard
   - Automatic smart contract integration

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [SIWE Specification](https://docs.login.xyz/)
- [WalletConnect Documentation](https://docs.walletconnect.com/)

---

**Need Help?** Check existing issues or create a new one in the repository.
