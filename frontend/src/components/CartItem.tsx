import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;

  // Calculate item total
  const itemTotal = product.price * quantity;

  // Support both image and thumbnail
  const imageSource = product.image || product.thumbnail;

  const productImage = imageSource
    ? imageSource.startsWith('/')
      ? imageSource
      : `/${imageSource}`
    : '/placeholder-product.jpg';

  return (
    <div className="flex gap-4 py-4 border-b border-border last:border-0">
      {/* Product Image */}
      <Link
        to={`/products/${product.slug}`}
        className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-secondary"
      >
        <img
          src={productImage}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-product.jpg';
          }}
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/products/${product.slug}`}
          className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
        >
          {product.name}
        </Link>

        <p className="text-sm text-muted-foreground mb-2">
          ETB {product.price.toFixed(2)} / {product.unit || 'each'}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateQuantity(product._id, quantity - 1)}
          >
            <Minus className="w-3 h-3" />
          </Button>

          <span className="w-10 text-center font-medium">
            {quantity}
          </span>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateQuantity(product._id, quantity + 1)}
            disabled={quantity >= product.stock}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Price & Remove */}
      <div className="flex flex-col items-end justify-between">
        <span className="font-semibold text-primary">
          ETB {itemTotal.toFixed(2)}
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => removeFromCart(product._id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CartItem;