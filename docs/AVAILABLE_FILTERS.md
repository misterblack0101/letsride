# Available Filters and Values Documentation

## Overview
This document provides a comprehensive list of all available filters in the Let's Ride e-commerce platform and their possible values.

## Filter Types

### 1. Category Filter
**Parameter**: `category`  
**Type**: Multiple selection (array)  
**URL Example**: `/products?category=Bikes&category=Accessories`

**Available Categories:**
- **Bikes** - Mountain, Hybrid, Road, Gravel
- **Accessories** - Bags, Lights, Fenders, Phone Case/Mount  
- **Apparels** - Topwear, Bottomwear, Footwear, Helmet, Eyewear, Gloves
- **Kids** - Tricycles, Electric Car/Bike, Ride-Ons, Prams, Baby Swing, Baby Essentials
- **Spares** - Braking System, Tyres & Tubes, Pedals, Saddles, Grips, Gear systems

### 2. Brand Filter
**Parameter**: `brand`  
**Type**: Multiple selection (array)  
**URL Example**: `/products?brand=Trek&brand=Giant`

**Note**: Available brands are dynamically populated from the product database. Common brands include:

### 3. Price Range Filter  
**Parameters**: `minPrice`, `maxPrice`  
**Type**: Number (Indian Rupees)  
**Range**: ₹0 - ₹120,000  
**Step**: ₹1,000  
**URL Example**: `/products?minPrice=5000&maxPrice=50000`

**Default Values:**
- Minimum: ₹0
- Maximum: ₹120,000

### 4. Sort Filter
**Parameter**: `sort`  
**Type**: Single selection  
**URL Example**: `/products?sort=price_low`

**Available Sort Options:**
- `popularity` (default) - Sorted by rating (highest first)
- `name` - Alphabetical (A-Z)
- `price_low` - Price: Low to High
- `price_high` - Price: High to Low  
- `rating` - Rating: Highest first

### 5. Size Filter
**Parameter**: `size`  
**Type**: Multiple selection (array)  
**URL Example**: `/products?size=M&size=L`

**Available Sizes by Category:**

#### Apparels (Topwear, Bottomwear, Footwear, Helmet, Eyewear, Gloves)
- `XS` - Extra Small
- `S` - Small  
- `M` - Medium
- `L` - Large
- `XL` - Extra Large

#### Kids Cycles (Tricycles, Electric Car/Bike)
- `12"` - 12 inch wheels
- `14"` - 14 inch wheels
- `16"` - 16 inch wheels
- `20"` - 20 inch wheels

#### Adult Cycles (Mountain, Hybrid, Road, Gravel)
- `24"` - 24 inch wheels
- `26"` - 26 inch wheels
- `27.5"` - 27.5 inch wheels
- `29"` - 29 inch wheels
- `700CC` - 700C wheels (road bikes)

**Note**: Size filter is context-aware and only shows relevant sizes based on selected categories.

### 6. View Mode Filter
**Parameter**: `view`  
**Type**: Single selection  
**URL Example**: `/products?view=list`

**Available Views:**
- `grid` (default) - Grid layout
- `list` - List layout

## Filter Implementation

### Server-Side Filtering
- All filters are processed server-side for better performance
- Firestore queries optimized for single category/brand filters
- Multiple categories/brands handled client-side after initial query
- Price range filtering done in-memory after database fetch

### URL State Management
- All filter states are reflected in URL parameters
- Shareable URLs with filter combinations
- Browser back/forward navigation support
- Bookmark-friendly filter states

### Filter Persistence
- Filter states persist across page navigation
- URL parameters maintain filter selections
- Clear all filters resets to `/products` base route

## Technical Details

### Filter Interface (TypeScript)
```typescript
export interface ProductFilterOptions {
  categories?: string[];
  brands?: string[];
  sizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price_low' | 'price_high' | 'rating' | 'popularity';
}
```

### URL Parameter Processing
- Categories, brands, and sizes support multiple values via repeated parameters
- Price values are parsed as integers
- Size values are validated against category-specific allowed sizes
- Invalid or missing parameters fall back to defaults
- URL encoding/decoding handles special characters in category names and size values (quotes, etc.)

### Performance Optimizations
- Single category/brand filters use Firestore's native WHERE clauses
- Multiple filters processed client-side to reduce query complexity
- React caching for category data from Realtime Database
- Debounced price range updates to prevent excessive URL changes

## Filter Combinations

### Common Filter Patterns
```
# Single category
/products?category=Bikes

# Multiple categories with price range
/products?category=Bikes&category=Accessories&minPrice=5000&maxPrice=25000

# Category with specific brands and sorting
/products?category=Bikes&brand=Trek&brand=Giant&sort=price_low

# Price range with specific view mode
/products?minPrice=1000&maxPrice=10000&view=list&sort=rating

# Apparels with specific sizes
/products?category=Apparels&size=M&size=L&size=XL

# Kids cycles with size and brand
/products?category=Kids&size=16"&size=20"&brand=Trek

# Adult bikes with wheel sizes
/products?category=Bikes&size=26"&size=29"&sort=price_low
```

### Category-Specific Routes
Special routing for category/subcategory combinations:
```
/products/[category]/[subcategory]
```
Example: `/products/Bikes/Mountain`

These routes bypass the general filter system and use optimized Firestore queries with compound WHERE clauses.

## Mobile vs Desktop Implementation

### Mobile
- Filters displayed in a slide-out sheet (drawer)
- Filter button shows active filter count
- Compact layout with scrollable brand list

### Desktop  
- Sidebar layout with sticky positioning
- Full filter options always visible
- More spacious layout for better usability

## Data Sources

### Categories
- Stored in Firebase Realtime Database as CSV strings
- Parsed and cached using React's `cache()` function
- Structure: `{ "Bikes": "Mountain,Hybrid,Road,Gravel" }`

### Brands  
- Dynamically extracted from Firestore product collection
- Filtered to remove null/undefined values
- Alphabetically sorted in UI

### Price Ranges
- Hardcoded min/max values based on product catalog analysis
- Step size optimized for cycling product price ranges
- Indian Rupee formatting with locale-specific number display

## Error Handling

### Invalid Filters
- Invalid category names are ignored
- Invalid brand names are filtered out
- Invalid size values are filtered out based on category context
- Out-of-range prices are clamped to valid bounds
- Malformed sort parameters fall back to 'popularity'

### Empty Results
- No special handling - empty product grid displayed
- Filter combinations that yield no results show empty state
- All filters remain selectable regardless of result count
