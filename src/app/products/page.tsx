import ClientProducts from './ClientProducts';

export default function StorePage() {
  // Page loads instantly, products are fetched on the client side
  return <ClientProducts />;
}