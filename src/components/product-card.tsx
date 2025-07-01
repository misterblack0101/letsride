import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import type { Product } from '@/lib/types';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className="block group">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:border-primary/50">
        <CardHeader className="p-0">
          <div className="aspect-video overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              width={600}
              height={400}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={product.dataAiHint}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex flex-col flex-grow">
          <div className="flex-grow">
            <Badge variant="secondary" className="mb-2">{product.type}</Badge>
            <CardTitle className="font-headline text-lg mb-2 group-hover:text-primary transition-colors">{product.name}</CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>{product.rating}</span>
              <span>&middot;</span>
              <span>{product.brand}</span>
            </div>
          </div>
          <div className="text-2xl font-bold font-headline text-right mt-4 text-foreground">
            ${product.price.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
