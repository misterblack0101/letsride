"use client";

import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart } from 'lucide-react';
import GearRecommendation from '@/components/gear-recommendation';

export default function ProductDetails({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold font-headline text-center mb-12">{product.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <Card className="overflow-hidden">
          <div className="aspect-square">
            <Image
              src={product.image}
              alt={product.name}
              width={800}
              height={800}
              className="w-full h-full object-cover"
              data-ai-hint={product.dataAiHint}
            />
          </div>
        </Card>
        
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <Badge variant="secondary" className="w-fit mb-2">{product.type}</Badge>
              <CardDescription className="flex items-center gap-4 pt-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold">{product.rating}</span>
                  <span className="text-muted-foreground">({product.popularity} reviews)</span>
                </div>
                <span className="text-muted-foreground hidden sm:inline">&middot;</span>
                <span className="text-foreground font-medium">{product.brand}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">{product.description}</p>
              
              {product.details && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Specifications:</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{product.details.replace(/, /g, '\n')}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-4xl font-bold font-headline text-primary">${product.price.toFixed(2)}</div>
                <Button size="lg" variant="accent" className="w-full sm:w-auto" onClick={() => addItem(product)}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>

          {product.type === 'Cycle' && product.details && (
            <GearRecommendation cycleDetails={`${product.name} - ${product.details}`} />
          )}
        </div>
      </div>
    </div>
  );
}
