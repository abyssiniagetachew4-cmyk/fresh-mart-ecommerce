import axios from "axios";

/* ================================
   AXIOS INSTANCE (DEFAULT EXPORT)
================================ */
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

/* ================================
   CATEGORY APIs
================================ */
export const getCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await api.post("/categories", categoryData);
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  const response = await api.put(`/categories/${id}`, categoryData);
  return response.data;
};

/* ================================
   PRODUCT APIs
================================ */
export const getProducts = async (category) => {
  try {
    const url = category
      ? `/products?category=${category}&debug=true`
      : `/products?debug=true`;

    console.log("📡 API Call:", url);

    const response = await api.get(url);

    // 🔥 VERY IMPORTANT FIX
    // Backend returns: { count, products }
    const products = Array.isArray(response.data.products)
      ? response.data.products
      : [];

    console.log(`✅ Received ${products.length} products`);

    return products;
  } catch (error) {
    console.error("❌ Error fetching products:", error.message);
    return []; // NEVER crash the UI
  }
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

/* ================================
   DEFAULT EXPORT (THIS FIXES ERROR)
================================ */
export default api;
