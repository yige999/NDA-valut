# 🚨 Quick Storage Fix - 2 Minute Solution

## Problem
"Bucket not found" error when uploading NDAs

## Solution

### Option 1: Automatic (Recommended)
1. Go to: https://supabase.com/dashboard/project/yhnudmekuviaaydoxztn/sql
2. Copy contents of `scripts/setup-storage.sql`
3. Paste and run

### Option 2: Manual (2 clicks)
1. Go to: https://supabase.com/dashboard/project/yhnudmekuviaaydoxztn/storage
2. Click **"Create a new bucket"**
3. Enter:
   - **Name**: `nda-files`
   - **Public bucket**: ❌ unchecked
   - **File size limit**: `10485760` (10MB)
   - **Allowed MIME types**: `application/pdf`
4. Click **"Save"**

### Step 3: Set Policies (Critical!)
After creating the bucket, go to **Policies** tab in Storage and add:

**Policy 1 - Upload:**
```sql
CREATE POLICY "Users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'nda-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 2 - Read:**
```sql
CREATE POLICY "Users can read" ON storage.objects
FOR SELECT USING (
  bucket_id = 'nda-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 🎯 Test It
Try uploading a PDF in your app - should work now!

## 📁 File Structure
Your files will be stored as: `{user-id}/{filename}`

Example: `12345678/my-contract.pdf`

---

**Done!** 🎉 Your NDA upload should work now.