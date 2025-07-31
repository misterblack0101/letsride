// - secure firebase firestore rules
// - add domain to cloudflare https://dash.cloudflare.com/login
// - add domain to firebase hosting
// - checkout firebase admin sdk
// - Create admin UI for uploading products

// Structure:

// brandFilters/
//   laptops/
//     macbook-series/
//       { brands: ['apple', 'hp', 'dell'] }

// Use a Cloud Function that triggers on products onCreate/onDelete

// ✅ Hybrid: Best of Both Worlds
// You can:

// Use SSR for initial product load

// Use /api/products for dynamic filters, infinite scroll, etc.


// show loader using default loader mechanism in nextjs api routes
