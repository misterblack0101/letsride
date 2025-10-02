/////////////////////////////////////
// admin panel
// - generate UI from claude based on the final product page UI
// - Create admin UI for uploading/searching/editing products
// - Create admin UI for uploading/editing brands
// - form with fields from the product model
// - add category and brand dropdowns in the product form
// - add image upload functionality
// - add validation
// - compress images before uploading
/// create a new image field for every images array add/edit, using images[0]
/// save the price from admin panel

//////////////////////////////
// - add items in model:
//   - inventory/stock count -  show out of stock label if <1 stock in single product page and gridview/listview
//   - isFeatured boolean for home page products / highest rated products on homepage

//////////////////////////////
// cart page
// - add remove items
// - add quantity change
// - add total price calculation
// - add checkout button w/whatsapp link



//////////////////////////////
// misc
// - secure firebase firestore rules
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