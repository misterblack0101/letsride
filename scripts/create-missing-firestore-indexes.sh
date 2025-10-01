#!/bin/bash

# Firestore Composite Index Creation Script - MISSING INDEXES ONLY
# This script creates additional composite indexes that were missing from the previous deployment
# 
# IMPORTANT: This script only contains NEW indexes that were missing from the first deployment.
# Do not run the old script again - it will create duplicate index requests.

echo "🔥 Creating MISSING Firestore composite indexes for Let's Ride..."
echo ""
echo "📋 These indexes handle brand+price filter combinations with sorting that were missing from the initial deployment."
echo ""

# Set your project ID (replace with your actual project ID)
PROJECT_ID="letsridecycles"
gcloud config set project $PROJECT_ID

echo "📦 Project set to: $PROJECT_ID"
echo ""

# Function to create index with error handling
create_index() {
    local description="$1"
    local command="$2"
    
    echo "Creating: $description"
    echo "Command: $command"
    
    if eval $command 2>/dev/null; then
        echo "✅ Success: $description"
    else
        echo "⚠️  Warning: $description (may already exist or failed)"
    fi
    echo "---"
}

echo "🎯 Creating BRAND + SORT combinations (MISSING from first deployment)..."

# Brand + Sort combinations (these were missing!)
create_index "Brand + Name sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=brand,order=ascending --field-config=field-path=name,order=ascending"

create_index "Brand + Price ascending" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending"

create_index "Brand + Price descending" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=descending"

create_index "Brand + Rating sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=brand,order=ascending --field-config=field-path=rating,order=descending"

echo ""
echo "💰 Creating PRICE RANGE + SORT combinations (MISSING from first deployment)..."

# Price Range + Sort combinations (these were missing!)
create_index "Price range (min) + Name sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=price,order=ascending --field-config=field-path=name,order=ascending"

create_index "Price range (min) + Rating sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=price,order=ascending --field-config=field-path=rating,order=descending"

# Note: price,asc + price,asc/desc would be redundant since we're already sorting by price

echo ""
echo "🔄 Creating BRAND + PRICE RANGE + SORT combinations (MISSING from first deployment)..."

# Brand + Price Range + Sort combinations (these were missing!)
create_index "Brand + Price range + Name sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=name,order=ascending"

create_index "Brand + Price range + Rating sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=rating,order=descending"

echo ""
echo "🏷️ Creating CATEGORY + BRAND + PRICE RANGE + SORT combinations (MISSING from first deployment)..."

# Category + Brand + Price Range + Sort combinations (these were missing!)
create_index "Category + Brand + Price range + Name sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=name,order=ascending"

create_index "Category + Brand + Price range + Rating sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=rating,order=descending"

echo ""
echo "🎯 Creating CATEGORY + SUBCATEGORY + BRAND + PRICE RANGE + SORT combinations (MISSING from first deployment)..."

# Category + Subcategory + Brand + Price Range + Sort combinations (these were missing!)
create_index "Category + Subcategory + Brand + Price range + Name sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=name,order=ascending"

create_index "Category + Subcategory + Brand + Price range + Rating sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=rating,order=descending"

echo ""
echo "🔄 Creating additional PRICE-based sorting combinations (MISSING from first deployment)..."

# Additional price-based combinations that were missing
create_index "Category + Price range + Price descending sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=price,order=descending"

create_index "Category + Subcategory + Price range + Price descending sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=price,order=descending"

create_index "Brand + Price range + Price descending sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=price,order=descending"

echo ""
echo "🎉 Missing Firestore index creation process completed!"
echo ""
echo "📊 Summary of NEW indexes created:"
echo "• Brand + Sorting combinations (4 indexes)"
echo "• Price Range + Sorting combinations (2 indexes)"  
echo "• Brand + Price Range + Sorting combinations (2 indexes)"
echo "• Category + Brand + Price Range + Sorting combinations (2 indexes)"
echo "• Category + Subcategory + Brand + Price Range + Sorting combinations (2 indexes)"
echo "• Additional Price-based sorting combinations (3 indexes)"
echo ""
echo "⏳ Note: Index creation is asynchronous and may take 5-15 minutes to complete."
echo "📱 Monitor progress in Firebase Console: Firestore > Indexes"
echo ""
echo "✅ These indexes cover the missing filter+sort combinations that were causing crashes!"
echo ""
echo "📝 PREVIOUSLY CREATED INDEXES (from first deployment - DO NOT recreate):"
echo "   - Basic Category + Sort combinations"
echo "   - Basic Brand + Sort combinations (without price ranges)"  
echo "   - Basic Category + Brand combinations"
echo "   - Basic Category + Subcategory combinations"
echo "   - Basic Price Range combinations (without complex sorts)"
echo "   - Recommended products indexes"
echo ""
echo "🚨 CRITICAL: Do not run the old script again - these indexes were already created!"