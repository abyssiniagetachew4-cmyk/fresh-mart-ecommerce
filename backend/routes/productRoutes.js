
const express = require('express');
const router = express.Router();
const multer = require('multer');

// Product and Category models
const Product = require('../models/Product');
const Category = require('../models/Category');

const {
  createProduct,
  getProductById,
  getAllProductsAdmin,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  toggleFeaturedProduct,
  bulkImportProducts,
  exportProducts,
  bulkUpdateProducts,
  bulkDeleteProducts
} = require('../controllers/productController');

/* =====================================================
   MULTER CONFIG (CSV UPLOAD)
===================================================== */
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'text/csv' ||
      file.originalname.endsWith('.csv')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

/* ===============================
   ADMIN ROUTES
================================ */

// Get all products (admin)
router.get('/admin/all', getAllProductsAdmin);

// Create product
router.post('/admin', createProduct);

// Update product
router.put('/admin/:id', updateProduct);

// Delete product
router.delete('/admin/:id', deleteProduct);

// Low stock alerts
router.get('/admin/low-stock', getLowStockProducts);

// Toggle featured product
router.patch('/admin/:id/featured', toggleFeaturedProduct);

// Bulk import products (CSV)
router.post('/admin/import', upload.single('file'), bulkImportProducts);

// Export products (CSV)
router.get('/admin/export', exportProducts);

// Bulk update products
router.put('/admin/bulk-update', bulkUpdateProducts);

// Bulk delete products
router.post('/admin/bulk-delete', bulkDeleteProducts);

/* ===============================
   PUBLIC ROUTES
================================ */

/**
 * GET /api/products
 *
 * Supports:
 *   /api/products
 *   /api/products?category=slug
 *
 * Returns all products or products
 * belonging to a specific category.
 */
router.get('/', async (req, res) => {
  try {
    const { category, debug } = req.query;

    console.log(
      '📡 Public products route called with category:',
      category || 'ALL'
    );

    // Start with an empty filter.
    // No "status" filter because the Product model
    // does not contain a status field.
    let filter = {};

    // If category slug is provided,
    // find the corresponding category.
    if (category) {
      const categoryDoc = await Category.findOne({
        slug: category.toLowerCase()
      });

      if (!categoryDoc) {
        console.log('❌ Category not found:', category);

        return res.json({
          count: 0,
          products: []
        });
      }

      filter.category = categoryDoc._id;

      console.log(
        '✅ Category found:',
        categoryDoc.name
      );
    }

    // Get products from MongoDB
    const products = await Product.find(filter)
      .populate('category', 'name slug _id')
      .sort({ createdAt: -1 });

    console.log(
      `✅ Found ${products.length} products`
    );

    // Debug response
    if (debug === 'true') {
      return res.json({
        count: products.length,
        products
      });
    }

    // Normal response
    res.json({
      count: products.length,
      products
    });

  } catch (error) {
    console.error(
      '❌ Error fetching products:',
      error
    );

    console.error(
      '❌ Error stack:',
      error.stack
    );

    res.status(500).json({
      message: 'Server error: ' + error.message,
      error:
        process.env.NODE_ENV === 'development'
          ? error.stack
          : undefined
    });
  }
});

/* ===============================
   GET SINGLE PRODUCT
================================ */

router.get('/:id', getProductById);

/* ===============================
   DEBUG ROUTE
================================ */

router.get('/debug/categories', async (req, res) => {
  try {
    const categories = await Category.find(
      {},
      'name slug _id'
    );

    const products = await Product.find({})
      .populate('category', 'name slug _id')
      .limit(5);

    res.json({
      categories,

      sampleProducts: products.map((p) => ({
        _id: p._id,
        name: p.name,

        category: p.category
          ? {
              _id: p.category._id,
              name: p.category.name,
              slug: p.category.slug
            }
          : null,

        // Your Product model does not use status.
        // This simply reports that the product exists.
        isActive: true
      }))
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;
