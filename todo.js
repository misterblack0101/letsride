/////////////////////////////////////
// admin panel
// - Create admin UI for uploading/searching/editing products
// - form with fields from the product model
// - add category and brand dropdowns in the product form
// - add image upload functionality
// - add validation
// - compress images before uploading
/// create a new image field for every images array add/edit, using images[0]
/// save the price from admin panel
// - add delete functionality for brands and products
// subcategory is not selected by default in product form
// - protect the admin routes, redirect anything after /admin to homepage if not logged in


//////////////////////////////
// - add items in model:
//   - inventory/stock count -  show out of stock label if <1 stock in single product page and gridview/listview
//   - isFeatured boolean for home page products / highest rated products on homepage
// - use the image instead of images[0] in gridview/listview, since its thumbnail. need to add it to product model first

//////////////////////////////
// cart page
// - add remove items
// - add quantity change
// - add total price calculation
// - add checkout button w/whatsapp link



//////////////////////////////
// misc
// - secure firebase firestore, rtdb and storage rules
// - add rate limits
// - add seo tags
// - add meta description tags
// - sitemap?
// - top rated products in 404 page / redirect 404 to homepage

/////////////////////////////
// nice to have
// - update the searchbar UI
// - add stock/inventory count to products
// - add out of stock label to products that have no inventory
// - add the cycle loader lottie wherever applicable
// - check code quality/optimization
// - db throttling/debouncing to avoid excessive reads/writes
// - Fix the infinite scroll sort/filter issue



// 1. toast on success
// 2.upload progress bar/loader in a dialog in screen center, so it cannot be skipped
// 3. admin verify api being called twice each time. you fixed a similar issue with admin page being called twice, use similar implementation
//  GET /api/admin/verify/ 200 in 14ms
//  GET /api/admin/verify/ 200 in 15ms
//  GET /api/products/?pageSize=24 200 in 115


// brandLogo field in brand model: https://yourcdn.com/brands/cannondale.png
// move brandLogo from product model to brandmodel
