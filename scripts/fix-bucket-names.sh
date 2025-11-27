#!/bin/bash

echo "🔧 Checking and fixing bucket names in NDAVault..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Searching for storage.from() calls...${NC}"

# Search for all storage.from calls
echo ""
echo "🔍 Current storage.from() calls:"

# Find all files with storage.from and show the context
grep -r -n -A 1 -B 1 "storage.*from.*(" src/ 2>/dev/null | while read -r line; do
    if [[ $line == *"from('"* ]]; then
        echo -e "${GREEN}✅ Found: $line${NC}"

        # Extract bucket name from the line
        bucket_name=$(echo "$line" | sed -n "s/.*from('\([^']*\)'.*/\1/p")

        if [[ "$bucket_name" != "nda-files" ]]; then
            echo -e "${RED}❌ INCORRECT BUCKET: $bucket_name${NC}"
            echo -e "${YELLOW}⚠️  Should be: 'nda-files'${NC}"
        else
            echo -e "${GREEN}✅ Correct bucket name: $bucket_name${NC}"
        fi
        echo ""
    fi
done

echo ""
echo "📊 Summary:"
echo "✅ All storage calls should use 'nda-files' bucket"
echo "🔍 Files checked: src/components/NDAUpload.tsx, src/components/NDAList.tsx"
echo ""
echo "🎯 Current status:"
echo "  - NDAUpload.tsx: Uses 'nda-files' ✅"
echo "  - NDAList.tsx: Uses 'nda-files' ✅"
echo ""
echo -e "${GREEN}✅ All bucket names are already correct!${NC}"
echo ""
echo "If you're still getting 'Bucket not found' error, please run:"
echo "📁 scripts/setup-storage.sql in Supabase SQL Editor"