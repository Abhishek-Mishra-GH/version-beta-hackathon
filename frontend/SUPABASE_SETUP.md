# Supabase Database Setup Guide

This guide will help you set up a PostgreSQL database using Supabase for HealthChain.

## Step 1: Create Supabase Account

1. Go to [https://supabase.com/](https://supabase.com/)
2. Click "Start your project" and sign up with GitHub
3. Verify your email address

## Step 2: Create a New Project

1. Click "New Project"
2. Fill in the details:
   - **Name**: `healthchain-db` (or your preferred name)
   - **Database Password**: Generate a strong password (SAVE THIS!)
   - **Region**: Choose closest to your location
   - **Plan**: Start with Free tier
3. Click "Create new project"
4. Wait 2-3 minutes for provisioning

## Step 3: Get Database Connection String

1. In your Supabase project, go to **Settings** (gear icon in sidebar)
2. Click **Database** in the left menu
3. Scroll to **Connection String** section
4. Select **Connection pooling** tab
5. Copy the **Connection string** in **Transaction mode**
6. Replace `[YOUR-PASSWORD]` with your database password

Example format:
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

## Step 4: Configure Environment Variables

1. Open your `.env.local` file (create if it doesn't exist)
2. Add the DATABASE_URL:

```bash
# Supabase Database
DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

3. Generate a random secret for SIWE:
```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

4. Add to `.env.local`:
```bash
SIWE_SECRET="your_generated_secret_here"
```

## Step 5: Run Database Migrations

Now that your database is configured, run the migrations to create tables:

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

## Step 6: Verify Setup

1. Check that migrations completed successfully
2. In Supabase dashboard, go to **Table Editor**
3. You should see these tables:
   - `User`
   - `PatientProfile`
   - `DoctorProfile`
   - `_prisma_migrations`

## Troubleshooting

### Connection Failed
- Verify your database password is correct
- Check that you're using the **Connection pooling** string (not Direct connection)
- Ensure you selected **Transaction mode**

### Migration Errors
- Delete the `prisma/migrations` folder if you have errors
- Run `npx prisma migrate reset` to reset the database (development only!)
- Try `npx prisma db push` as an alternative

### SSL Certificate Issues
Add `?sslmode=require` to the end of your DATABASE_URL if needed:
```
DATABASE_URL="postgresql://...postgres?sslmode=require"
```

## Security Notes

⚠️ **Never commit `.env.local` to git!**

- It's already in `.gitignore`
- Never share your database password
- Rotate your SIWE_SECRET regularly in production

## Next Steps

After setup is complete:
1. Test authentication by connecting your wallet
2. Complete the onboarding flow
3. Create patient/doctor profiles
4. Verify data appears in Supabase Table Editor

---

Need help? Check the [Supabase Documentation](https://supabase.com/docs/guides/database)
