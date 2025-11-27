# Storage Setup Guide for NDAVault

## 🚨 Problem: "Bucket not found" Error

The error occurs because the `nda-files` storage bucket doesn't exist in Supabase.

## ✅ Quick Fix (5 minutes)

### Step 1: Run SQL Script
1. Open your Supabase dashboard: https://supabase.com/dashboard/project/yhnudmekuviaaydoxztn
2. Go to **SQL Editor** → **New query**
3. Copy and paste the entire content of `scripts/setup-storage.sql`
4. Click **Run** to execute

### Step 2: Verify Setup
1. Go to **Storage** in the left sidebar
2. You should now see the `nda-files` bucket
3. Test file upload functionality

## 🔧 What the Script Does

- ✅ Creates `nda-files` bucket with 10MB limit
- ✅ Restricts uploads to PDF files only
- ✅ Sets up Row Level Security (RLS)
- ✅ Users can only access their own files (organized by user_id)
- ✅ Adds helper functions for file management

## 📁 File Structure

Files are stored as: `{user_id}/{filename}`

Example: `550e8400-e29b-41d4-a716-446655440000/my-nda.pdf`

## 🛡️ Security Features

- **Authentication Required**: Only logged-in users can upload
- **User Isolation**: Users can only see their own files
- **File Type Restriction**: Only PDF files allowed
- **Size Limit**: Maximum 10MB per file
- **RLS Policies**: Database-level security enforcement

## 🧪 Testing After Setup

1. Go to your app and try uploading a PDF
2. Check that the file appears in the Storage section
3. Verify you can view and delete the file

## 🐛 If Issues Persist

1. Check Supabase logs: https://supabase.com/dashboard/project/yhnudmekuviaaydoxztn/logs
2. Verify environment variables in `.env.local`
3. Make sure RLS is enabled but policies are correctly set

## 📞 Support

- Supabase Docs: https://supabase.com/docs
- Storage Reference: https://supabase.com/docs/guides/storage