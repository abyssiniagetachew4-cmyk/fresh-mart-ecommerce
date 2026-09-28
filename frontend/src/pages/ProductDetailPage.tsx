/**
 * Product Detail Page
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Minus, Plus, ShoppingCart, Star, ArrowLeft } from 'lucide-react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: any;
  categoryName?: string;

  // Product image fields
  image?: string;
  thumbnail?: string;

  description: string;
  rating?: number;
  reviewCount?: number;
  unit?: string;
  createdAt: string;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setImageError(false);

        const productRes = await axios.get(
          `http://localhost:5000/api/products/${id}`
        );

        const productData: Product = productRes.data;
        setProduct(productData);

        let categorySlug = '';

        if (productData.category) {
          if (typeof productData.category === 'string') {
            const catRes = await axios.get(
              'http://localhost:5000/api/categories'
            );

            const found = catRes.data.find(
              (c: any) => c._id === productData.category
            );

            categorySlug = found?.slug || '';
          } else {
            categorySlug = productData.category.slug || '';
          }
        }

        if (categorySlug) {
          const relatedRes = await axios.get(
            `http://localhost:5000/api/products?category=${categorySlug}`
          );

          const list = Array.isArray(relatedRes.data)
            ? relatedRes.data
            : relatedRes.data.products || [];

          setRelatedProducts(
            list
              .filter((p: Product) => p._id !== productData._id)
              .slice(0, 4)
          );
        }
      } catch (err) {
        console.error('❌ Product fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product, quantity);
    setQuantity(1);
  };

  const getCategoryName = () => {
    if (!product) return '';

    if (typeof product.category === 'object') {
      return product.category?.name || '';
    }

    return product.categoryName || '';
  };

  // Use image first, then thumbnail
const productImage =
  imageError
    ? '/placeholder-product.jpg'
    : product?.thumbnail
      ? `/${product.thumbnail}`
      : product?.image
        ? `/${product.image}`
        : '/placeholder-product.jpg';
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              Product Not Found
            </h1>

            <Link to="/products">
              <Button>
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Products
              </Button>
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">

          {/* Back to Products */}
          <nav className="mb-6">
            <Link
              to="/products"
              className="text-muted-foreground hover:text-primary flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Link>
          </nav>

          {/* Product Details */}
          <div className="grid md:grid-cols-2 gap-10 mb-16">

            {/* Product Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-secondary">
              <img
                src={productImage}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            </div>

            {/* Product Information */}
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground mb-2">
                {getCategoryName()}
              </p>

              <h1 className="text-3xl font-bold mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 fill-accent text-accent" />

                <span>
                  {product.rating || 0}
                </span>

                <span className="text-muted-foreground">
                  ({product.reviewCount || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="text-3xl font-bold text-primary mb-6">
                {product.price.toFixed(2)} ETB

                <span className="text-base font-normal text-muted-foreground">
                  {' '} / {product.unit || 'each'}
                </span>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6">
                {product.description}
              </p>

              {/* Stock */}
              <p className="mb-6">
                <span
                  className={
                    product.stock > 10
                      ? 'text-green-600'
                      : 'text-amber-600'
                  }
                >
                  {product.stock > 10
                    ? 'In Stock'
                    : product.stock > 0
                    ? `Only ${product.stock} left`
                    : 'Out of Stock'}
                </span>
              </p>

              {/* Quantity + Add to Cart */}
              <div className="flex gap-4">

                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setQuantity(Math.max(1, quantity - 1))
                    }
                    disabled={product.stock === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>

                  <span className="w-10 text-center">
                    {quantity}
                  </span>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setQuantity(
                        Math.min(product.stock, quantity + 1)
                      )
                    }
                    disabled={product.stock === 0}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="mr-2 w-5 h-5" />

                  {product.stock === 0
                    ? 'Out of Stock'
                    : 'Add to Cart'}
                </Button>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">
                Related Products
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;