# Firestore Index Creation Script

This document contains all the necessary Firestore composite indexes required for the Let's Ride application to prevent index errors.

## Required Indexes

Based on the filtering and sorting combinations in the application, here are all the composite indexes needed:

### 1. General Product Filtering (All Products Page)

```bash
# Category + Sort combinations
gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=rating,order=descending

gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=name,order=ascending

gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=price,order=ascending

gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=price,order=descending

# Brand + Sort combinations
gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=brand,order=ascending \
  --field-config=field-path=rating,order=descending

gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=brand,order=ascending \
  --field-config=field-path=name,order=ascending

gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=brand,order=ascending \
  --field-config=field-path=price,order=ascending

gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=brand,order=ascending \
  --field-config=field-path=price,order=descending

# Price range + Sort combinations
gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=price,order=ascending \
  --field-config=field-path=rating,order=descending

gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=price,order=ascending \
  --field-config=field-path=name,order=ascending

# Category + Brand + Sort combinations
gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=brand,order=ascending \
  --field-config=field-path=rating,order=descending

gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=brand,order=ascending \
  --field-config=field-path=name,order=ascending

gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=brand,order=ascending \
  --field-config=field-path=price,order=ascending

gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=brand,order=ascending \
  --field-config=field-path=price,order=descending

# Category + Price Range + Sort combinations
gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=price,order=ascending \
  --field-config=field-path=rating,order=descending

gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=price,order=ascending \
  --field-config=field-path=name,order=ascending

# Brand + Price Range + Sort combinations
gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=brand,order=ascending \
  --field-config=field-path=price,order=ascending \
  --field-config=field-path=rating,order=descending

gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=brand,order=ascending \
  --field-config=field-path=price,order=ascending \
  --field-config=field-path=name,order=ascending

# Complex combinations: Category + Brand + Price Range + Sort
gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=brand,order=ascending \
  --field-config=field-path=price,order=ascending \
  --field-config=field-path=rating,order=descending

gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=brand,order=ascending \
  --field-config=field-path=price,order=ascending \
  --field-config=field-path=name,order=ascending
```

### 2. Category-Specific Filtering (Category/Subcategory Pages)

```bash
# Category + Subcategory + Sort combinations
gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=subCategory,order=ascending \
  --field-config=field-path=rating,order=descending

gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=subCategory,order=ascending \
  --field-config=field-path=name,order=ascending

gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=subCategory,order=ascending \
  --field-config=field-path=price,order=ascending

gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=subCategory,order=ascending \
  --field-config=field-path=price,order=descending

# Category + Subcategory + Brand + Sort combinations
gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=subCategory,order=ascending \
  --field-config=field-path=brand,order=ascending \
  --field-config=field-path=rating,order=descending

gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=subCategory,order=ascending \
  --field-config=field-path=brand,order=ascending \
  --field-config=field-path=name,order=ascending

gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=subCategory,order=ascending \
  --field-config=field-path=brand,order=ascending \
  --field-config=field-path=price,order=ascending

gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=subCategory,order=ascending \
  --field-config=field-path=brand,order=ascending \
  --field-config=field-path=price,order=descending

# Category + Subcategory + Price Range + Sort combinations
gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=subCategory,order=ascending \
  --field-config=field-path=price,order=ascending \
  --field-config=field-path=rating,order=descending

gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=subCategory,order=ascending \
  --field-config=field-path=price,order=ascending \
  --field-config=field-path=name,order=ascending

# Category + Subcategory + Brand + Price Range + Sort combinations
gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=subCategory,order=ascending \
  --field-config=field-path=brand,order=ascending \
  --field-config=field-path=price,order=ascending \
  --field-config=field-path=rating,order=descending

gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=category,order=ascending \
  --field-config=field-path=subCategory,order=ascending \
  --field-config=field-path=brand,order=ascending \
  --field-config=field-path=price,order=ascending \
  --field-config=field-path=name,order=ascending
```

### 3. Recommended Products

```bash
# For recommended products query
gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=isRecommended,order=ascending \
  --field-config=field-path=rating,order=descending
```

## Quick Setup Script

Create and run this bash script to create all indexes at once:

```bash
#!/bin/bash

# Create firestore-indexes.sh file
echo "Creating all Firestore composite indexes..."

# Set your project ID
PROJECT_ID="letsridecycles"  # Replace with your actual project ID
gcloud config set project $PROJECT_ID

# Single field indexes (if not already created)
echo "Creating single field indexes..."

# Array of all index creation commands
indexes=(
  # General filtering indexes
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=rating,order=descending"
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=name,order=ascending"
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=price,order=ascending"
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=price,order=descending"
  
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=brand,order=ascending --field-config=field-path=rating,order=descending"
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=brand,order=ascending --field-config=field-path=name,order=ascending"
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending"
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=descending"
  
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=price,order=ascending --field-config=field-path=rating,order=descending"
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=price,order=ascending --field-config=field-path=name,order=ascending"
  
  # Category + Brand combinations
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=rating,order=descending"
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=name,order=ascending"
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending"
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=descending"
  
  # Category + Price combinations
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=rating,order=descending"
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=name,order=ascending"
  
  # Brand + Price combinations
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=rating,order=descending"
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=name,order=ascending"
  
  # Complex combinations
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=rating,order=descending"
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=name,order=ascending"
  
  # Category-specific indexes
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=rating,order=descending"
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=name,order=ascending"
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=price,order=ascending"
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=price,order=descending"
  
  # Category + Subcategory + Brand combinations
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=rating,order=descending"
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=name,order=ascending"
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending"
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=descending"
  
  # Category + Subcategory + Price combinations
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=rating,order=descending"
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=name,order=ascending"
  
  # Most complex combinations
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=rating,order=descending"
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=category,order=ascending --field-config=field-path=subCategory,order=ascending --field-config=field-path=brand,order=ascending --field-config=field-path=price,order=ascending --field-config=field-path=name,order=ascending"
  
  # Recommended products
  "gcloud firestore indexes composite create --collection-group=products --field-config=field-path=isRecommended,order=ascending --field-config=field-path=rating,order=descending"
)

# Execute each index creation command
for cmd in "${indexes[@]}"; do
  echo "Running: $cmd"
  eval $cmd
  if [ $? -eq 0 ]; then
    echo "✅ Index created successfully"
  else
    echo "⚠️ Index creation failed or already exists"
  fi
  echo "---"
done

echo "All index creation commands have been executed!"
echo "Note: Index creation is asynchronous and may take several minutes to complete."
echo "You can check the status in the Firebase Console under Firestore > Indexes"
```

## Usage Instructions

1. **Save the script**: Copy the bash script above to a file called `create-firestore-indexes.sh`

2. **Make it executable**:
   ```bash
   chmod +x create-firestore-indexes.sh
   ```

3. **Update the project ID**: Edit the script and replace `"letsridecycles"` with your actual Firebase project ID

4. **Run the script**:
   ```bash
   ./create-firestore-indexes.sh
   ```

5. **Monitor progress**: Check the Firebase Console under Firestore > Indexes to see the creation progress

## Alternative: Use Firebase CLI

If you prefer using the Firebase CLI, you can also create a `firestore.indexes.json` file and deploy it:

```json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "rating", "order": "DESCENDING" }
      ]
    },
    // ... (add all other index configurations)
  ],
  "fieldOverrides": []
}
```

Then deploy with:
```bash
firebase deploy --only firestore:indexes
```

## Expected Results

After running this script:
- ✅ No more "index not found" errors when filtering/sorting
- ✅ All filter combinations will work immediately
- ✅ Query performance will be optimal
- ✅ Users can apply any combination of filters and sorts without errors

The index creation process is asynchronous and may take 5-15 minutes to complete for all indexes.