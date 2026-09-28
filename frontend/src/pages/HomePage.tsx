/**
 * Home Page - Main landing page with hero, categories, and featured products
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Leaf, Clock } from 'lucide-react';

import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';

import { getProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  category?: any;
}

interface Category {
  _id: string;
  name: string;
  slug?: string;
}

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await getProducts();

        // Handle array or { products: [...] } response
        const productList: Product[] = Array.isArray(response)
          ? response
          : response.products || [];

        setProducts(productList);
      } catch (err) {
        console.error('Product error:', err);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await getCategories();
        const categoryList: Category[] = Array.isArray(response)
          ? response
          : response.categories || [];
        setCategories(categoryList);
      } catch (err) {
        console.error('Category error:', err);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Featured products
  const featuredProducts = Array.isArray(products) ? products.slice(0, 8) : [];

  // Optional: fallback categories if API fails
  const defaultCategories = [
    { _id: 'all', name: 'All' },
    { _id: 'vegetables', name: 'Vegetables' },
    { _id: 'dairy', name: 'Dairy & Eggs' },
    { _id: 'beverage', name: 'Beverage' },
    { _id: 'bakery', name: 'Bakery' },
    { _id: 'meat', name: 'Meat-and-Seafood' },
    { _id: 'fruit', name: 'Fresh-Fruits' },
  ];

  const displayedCategories =
    categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="hero-gradient text-primary-foreground py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <span className="inline-block px-4 py-1 bg-primary-foreground/20 rounded-full text-sm font-medium mb-4">
                Free delivery on orders over 500 Birr
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Fresh Groceries Delivered to Your Door
              </h1>
              <p className="text-lg mb-8">
                Shop the freshest fruits, vegetables, dairy, and more.
              </p>
              <div className="flex gap-4">
                <Link to="/products">
                  <Button size="lg">
                    Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Delivery', desc: 'Orders over 500 Birr' },
              { icon: Leaf, title: 'Fresh & Organic', desc: 'Quality products' },
              { icon: Shield, title: 'Secure Payment', desc: 'Safe checkout' },
              { icon: Clock, title: 'Fast Delivery', desc: 'Same day' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <f.icon className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-medium">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between mb-8">
              <h2 className="text-3xl font-bold">Shop by Category</h2>
              <Link to="/products" className="text-primary">
                View All <ArrowRight className="inline w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedCategories.map(category => {
  const productCount = products.filter(product => {
    const productCategory = product.category;

    if (!productCategory) return false;

    // If category is an object populated by the backend
    if (typeof productCategory === 'object') {
      return productCategory._id === category._id;
    }

    // If category is just a category ID
    return productCategory === category._id;
  }).length;

  return (
    <CategoryCard
      key={category._id}
      category={{
        ...category,
        productCount,
      }}
    />
  );
})}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between mb-8">
              <h2 className="text-3xl font-bold">Featured Products</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
