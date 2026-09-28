/**
 * ProductCard Component
 * Prices shown in ETB
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: any;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };
const imageSource = product.image || product.thumbnail;

const productImage = imageSource
  ? imageSource.startsWith('/')
    ? imageSource
    : `/${imageSource}`
  : '/placeholder-product.jpg';
  return (
    <Link to={`/products/${product._id}`}>
      <article className="group bg-card rounded-2xl overflow-hidden shadow-soft border border-border/50">
        <div className="relative aspect-square overflow-hidden bg-secondary/30">
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />

          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="rounded-full"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="font-medium px-4 py-2 bg-muted rounded-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs text-muted-foreground uppercase mb-1">
            {product.category?.name || 'Category'}
          </p>

          <h3 className="font-medium line-clamp-1 mb-2 group-hover:text-primary">
            {product.name}
          </h3>

          <div className="flex items-end justify-between">
            <div>
              <span className="text-lg font-bold text-primary">
                {Number(product.price || 0).toFixed(2)} ETB
              </span>
              <div className="text-xs text-muted-foreground">
                Stock: {product.stock}
              </div>
            </div>

            <Button
              size="sm"
              variant="secondary"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="lg:hidden"
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ProductCard;
