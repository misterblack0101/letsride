#!/bin/bash

# Firestore Composite Index Creation Script
# This script creates all necessary composite indexes for the Let's Ride e-commerce platform

echo "🚀 Creating Firestore composite indexes for Let's Ride..."

# Set your project ID (replace with your actual project ID)
PROJECT_ID="letsridecycles"
gcloud config set project $PROJECT_ID

echo "📋 Project set to: $PROJECT_ID"
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
        echo "⚠️  Warning: $description (may already exist)"
    fi
    echo "---"
}

echo "📦 Creating basic filtering indexes..."

# Category + Sort combinations
create_index "Category + Rating sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=rating,order=descending"

create_index "Category + Name sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=name,order=ascending"

create_index "Category + Price ascending" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=price,order=ascending"

create_index "Category + Price descending" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=price,order=descending"

# Brand + Sort combinations
create_index "Brand + Rating sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=brand,order=ascending --field-config=field-path=rating,order=descending"

create_index "Brand + Name sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=brand,order=ascending --field-config=field-path=name,order=ascending"

create_index "Brand + Price ascending" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending"

create_index "Brand + Price descending" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=descending"

# Price range + Sort combinations
create_index "Price range + Rating sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=price,order=ascending --field-config=field-path=rating,order=descending"

create_index "Price range + Name sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=price,order=ascending --field-config=field-path=name,order=ascending"

echo ""
echo "🔄 Creating combination filtering indexes..."

# Category + Brand + Sort combinations
create_index "Category + Brand + Rating sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=rating,order=descending"

create_index "Category + Brand + Name sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=name,order=ascending"

create_index "Category + Brand + Price ascending" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending"

create_index "Category + Brand + Price descending" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=descending"

# Category + Price Range + Sort combinations
create_index "Category + Price range + Rating sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=rating,order=descending"

create_index "Category + Price range + Name sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=name,order=ascending"

# Brand + Price Range + Sort combinations
create_index "Brand + Price range + Rating sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=rating,order=descending"

create_index "Brand + Price range + Name sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=name,order=ascending"

# Complex combinations: Category + Brand + Price Range + Sort
create_index "Category + Brand + Price range + Rating sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=rating,order=descending"

create_index "Category + Brand + Price range + Name sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=name,order=ascending"

echo ""
echo "🎯 Creating category-specific indexes..."

# Category + Subcategory + Sort combinations
create_index "Category + Subcategory + Rating sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=rating,order=descending"

create_index "Category + Subcategory + Name sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=name,order=ascending"

create_index "Category + Subcategory + Price ascending" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=price,order=ascending"

create_index "Category + Subcategory + Price descending" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=price,order=descending"

# Category + Subcategory + Brand + Sort combinations
create_index "Category + Subcategory + Brand + Rating sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=rating,order=descending"

create_index "Category + Subcategory + Brand + Name sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=name,order=ascending"

create_index "Category + Subcategory + Brand + Price ascending" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending"

create_index "Category + Subcategory + Brand + Price descending" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=descending"

# Category + Subcategory + Price Range + Sort combinations
create_index "Category + Subcategory + Price range + Rating sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=rating,order=descending"

create_index "Category + Subcategory + Price range + Name sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=name,order=ascending"

# Most complex combinations
create_index "Category + Subcategory + Brand + Price range + Rating sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=rating,order=descending"

create_index "Category + Subcategory + Brand + Price range + Name sort" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=name,order=ascending"

echo ""
echo "⭐ Creating recommended products indexes..."

# Recommended products
create_index "Recommended products" \
"gcloud firestore indexes composite create --collection-group=products --field-config=field-path=isRecommended,order=ascending --field-config=field-path=rating,order=descending"

echo ""
echo "🎉 Firestore index creation process completed!"
echo ""
echo "📊 Summary:"
echo "• Created indexes for all filter combinations"
echo "• Covered all sorting options (name, price, rating)"
echo "• Included both general and category-specific queries"
echo "• Added recommended products support"
echo ""
echo "⏳ Note: Index creation is asynchronous and may take 5-15 minutes to complete."
echo "📱 Monitor progress in Firebase Console: Firestore > Indexes"
echo ""
echo "✅ Once complete, you should no longer see index creation errors!"