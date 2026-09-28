
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";

import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  thumbnail?: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
  } | string;
}

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH ALL PRODUCTS
  // =========================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const data = await getProducts();

        setProducts(
          Array.isArray(data) ? data : data.products || []
        );
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // =========================
  // FETCH CATEGORIES
  // =========================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // =========================
  // FILTER PRODUCTS
  // SEARCH + CATEGORY
  // =========================
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // -------------------------
      // CATEGORY FILTER
      // -------------------------
      if (activeCategory !== "all") {
        if (!product.category) {
          return false;
        }

        // Category is an object
        if (typeof product.category === "object") {
          if (product.category.slug !== activeCategory) {
            return false;
          }
        }

        // Category is a string
        else {
          if (product.category !== activeCategory) {
            return false;
          }
        }
      }

      // -------------------------
      // SEARCH FILTER
      // -------------------------
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();

        const productName = product.name.toLowerCase();

        if (!productName.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [products, activeCategory, searchQuery]);

  // =========================
  // CATEGORY SELECTION
  // =========================
  const handleCategoryChange = (category: string) => {
    if (category === "all") {
      // Keep search if one exists
      if (searchQuery) {
        setSearchParams({
          search: searchQuery,
        });
      } else {
        setSearchParams({});
      }
    } else {
      // Keep search if one exists
      if (searchQuery) {
        setSearchParams({
          category,
          search: searchQuery,
        });
      } else {
        setSearchParams({
          category,
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">

        {/* =========================
            PAGE TITLE
        ========================= */}
        <h1 className="text-3xl font-bold mb-6 capitalize">
          {searchQuery
            ? `Search Results for "${searchQuery}"`
            : activeCategory === "all"
            ? "All Products"
            : activeCategory.replace("-", " ")}
        </h1>

        {/* =========================
            CATEGORY FILTER
        ========================= */}
        <div className="flex flex-wrap gap-3 mb-8">

          {/* ALL BUTTON */}
          <button
            onClick={() => handleCategoryChange("all")}
            className={`px-4 py-2 rounded ${
              activeCategory === "all"
                ? "bg-primary text-white"
                : "bg-gray-200"
            }`}
          >
            All
          </button>

          {/* CATEGORY BUTTONS */}
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-4 py-2 rounded ${
                activeCategory === cat.slug
                  ? "bg-primary text-white"
                  : "bg-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* =========================
            SEARCH INFORMATION
        ========================= */}
        {searchQuery && !loading && (
          <div className="mb-6 text-sm text-muted-foreground">
            Found {filteredProducts.length}{" "}
            {filteredProducts.length === 1
              ? "product"
              : "products"}{" "}
            matching "{searchQuery}"
          </div>
        )}

        {/* =========================
            LOADING
        ========================= */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Loading products...
            </p>
          </div>
        )}

        {/* =========================
            NO PRODUCTS
        ========================= */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg font-medium text-gray-700">
              {searchQuery
                ? `No products found for "${searchQuery}".`
                : "No products found in this category."}
            </p>

            {searchQuery && (
              <button
                onClick={() => {
                  if (activeCategory !== "all") {
                    setSearchParams({
                      category: activeCategory,
                    });
                  } else {
                    setSearchParams({});
                  }
                }}
                className="mt-4 px-4 py-2 rounded bg-primary text-white hover:opacity-90"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* =========================
            PRODUCTS GRID
        ========================= */}
        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductsPage;
