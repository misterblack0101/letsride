# Loading State and Out-of-Range Page Number Handling

This document explains the handling of loading states during pagination and how out-of-range page numbers are handled in the Let's Ride e-commerce platform.

## Loading States

When navigating between pages, we've implemented several loading indicators to provide feedback to users:

### 1. Pagination Button Loading

- Each pagination button shows a spinner when it is clicked
- The clicked button will display a spinning loader icon
- All navigation buttons are disabled during page transitions
- Loading state is tracked using React's `useTransition` hook

### 2. Product Grid Loading

- When navigating between pages, the product grid shows a shimmer loading effect
- The loading state is implemented in the `ProductGrid` component
- The skeleton UI gives visual feedback that content is loading

## Out-of-Range Page Number Handling

We've implemented handling for out-of-range page numbers to prevent empty results:

### Handling Strategy

1. When a user enters a page number that exceeds the total number of pages (e.g., `/products?page=987`):
   - The application redirects to page 1
   - All filters are preserved
   - The user can continue browsing from a valid page

2. Implementation:
   - Page number validation happens server-side
   - Page calculations use the formula: `Math.ceil(totalCount / pageSize)`
   - If requested page > totalPages, the system defaults to page 1

### Code Implementation

```typescript
// Calculate total pages and ensure page number is within valid range
const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
const page = requestedPage > totalPages ? 1 : requestedPage;
```

## Benefits

1. **Better User Experience**: Users always get visual feedback during page transitions
2. **Error Prevention**: Users can't reach empty pages with no products
3. **Performance Perception**: Shimmer loading gives the impression of faster loading times
4. **Accessibility**: Loading states are properly announced to screen readers