const Product = require('../models/Product');
const Category = require('../models/Category');
const csv = require('csvtojson');
const fs = require('fs');

/* =====================================================
   CREATE PRODUCT (ADMIN) - FIXED & SIMPLIFIED!
===================================================== */
exports.createProduct = async (req, res) => {
  try {
    console.log('📝 Creating product with data:', req.body);
    
    const {
      name,
      category,     // Frontend sends 'category'
      categoryId,   // Also accept 'categoryId' as fallback
      price,
      stock,
      description,
      brand,
      lowStockThreshold,
      isFeatured,
      weight,
      expiryDate,
      sku,
      isActive = true  // Frontend sends isActive, but we don't save it as status
    } = req.body;

    // Use either category or categoryId
    const categoryIdentifier = category || categoryId;
    
    if (!categoryIdentifier) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category ID is required' 
      });
    }

    console.log('🔍 Looking for category with ID:', categoryIdentifier);
    
    const foundCategory = await Category.findById(categoryIdentifier);
    
    if (!foundCategory) {
      console.log('❌ Category not found for ID:', categoryIdentifier);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid category ID' 
      });
    }

    console.log('✅ Found category:', foundCategory.name);
    
    // Generate slug
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

    // Create product - NO STATUS FIELD (your existing products don't have it)
    const productData = {
      name,
      slug,
      category: foundCategory._id,
      price,
      stock: stock || 0,
      description: description || '',
      brand: brand || '',
      sku: sku || '',
      weight: weight || 0,
      expiryDate: expiryDate || null,
      lowStockThreshold: lowStockThreshold || 10,
      isFeatured: !!isFeatured
      // NO status field - your existing products don't have it
    };

    console.log('📦 Creating product with data:', productData);
    
    const product = await Product.create(productData);

    // Populate category for response
    const populatedProduct = await Product.findById(product._id)
      .populate('category', '_id name slug');

    console.log('✅ Product created successfully:', populatedProduct._id);
    
    res.status(201).json({ 
      success: true, 
      product: {
        _id: populatedProduct._id,
        name: populatedProduct.name,
        price: populatedProduct.price,
        stock: populatedProduct.stock,
        category: populatedProduct.category ? {
          _id: populatedProduct.category._id,
          name: populatedProduct.category.name
        } : null,
        brand: populatedProduct.brand,
        sku: populatedProduct.sku,
        description: populatedProduct.description,
        isActive: true, // Always return true since we don't track active/inactive
        isFeatured: populatedProduct.isFeatured,
        lowStockThreshold: populatedProduct.lowStockThreshold,
        createdAt: populatedProduct.createdAt,
        updatedAt: populatedProduct.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Create product error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/* =====================================================
   UPDATE PRODUCT - FIXED!
===================================================== */
exports.updateProduct = async (req, res) => {
  try {
    console.log('🔄 Updating product:', req.params.id, 'with:', req.body);
    
    const updates = { ...req.body };
    
    // Handle category update
    if (updates.category) {
      const category = await Category.findById(updates.category);
      if (!category) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid category' 
        });
      }
      updates.category = category._id;
    }
    
    // Remove isActive - we don't have status field
    if (updates.isActive !== undefined) {
      delete updates.isActive; // Just ignore it, don't map to status
    }

    console.log('📝 Final updates:', updates);
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('category', '_id name slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    console.log('✅ Product updated successfully');
    
    res.json({ 
      success: true, 
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category ? {
          _id: product.category._id,
          name: product.category.name
        } : null,
        brand: product.brand,
        sku: product.sku,
        description: product.description,
        isActive: true, // Always true since no status field
        isFeatured: product.isFeatured,
        lowStockThreshold: product.lowStockThreshold,
        updatedAt: product.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Update product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   BULK UPDATE PRODUCTS - FIXED!
===================================================== */
exports.bulkUpdateProducts = async (req, res) => {
  try {
    const { productIds, updates } = req.body;
    
    console.log('🔄 Bulk updating products:', productIds.length, 'products');
    
    // Handle category update in bulk
    if (updates.category) {
      const category = await Category.findById(updates.category);
      if (!category) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid category' 
        });
      }
      updates.category = category._id;
    }
    
    // Remove isActive from bulk updates
    const updateData = { ...updates };
    if (updateData.isActive !== undefined) {
      delete updateData.isActive; // Just ignore it
    }
    
    console.log('📝 Bulk update data:', updateData);
    
    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      updateData
    );
    
    console.log(`✅ Bulk updated ${result.modifiedCount} products`);
    
    res.json({ 
      success: true, 
      message: `Updated ${result.modifiedCount} products` 
    });
  } catch (error) {
    console.error('❌ Bulk update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   BULK IMPORT PRODUCTS (CSV) - FIXED!
===================================================== */
exports.bulkImportProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'CSV file required' });
    }

    console.log('📥 Importing products from CSV...');
    
    const products = await csv().fromFile(req.file.path);

    const importResults = [];
    
    for (const item of products) {
      try {
        // Find category by ID or name
        let category;
        if (item.categoryId) {
          category = await Category.findById(item.categoryId);
        } else if (item.category) {
          category = await Category.findOne({ name: item.category });
        }
        
        if (!category) {
          console.log(`❌ Skipping ${item.name}: Category not found`);
          importResults.push({ name: item.name, status: 'failed', reason: 'Category not found' });
          continue;
        }

        const productData = {
          name: item.name,
          slug: `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
          category: category._id,
          price: Number(item.price) || 0,
          stock: Number(item.stock) || 0,
          description: item.description || '',
          brand: item.brand || '',
          sku: item.sku || '',
          lowStockThreshold: item.lowStockThreshold || 10,
          isFeatured: item.isFeatured === 'true' || false
          // No status field
        };

        const product = await Product.create(productData);
        importResults.push({ name: item.name, status: 'success', id: product._id });
        
      } catch (itemError) {
        console.error(`❌ Error importing ${item.name}:`, itemError.message);
        importResults.push({ name: item.name, status: 'failed', reason: itemError.message });
      }
    }

    fs.unlinkSync(req.file.path);
    
    console.log(`✅ Import complete: ${importResults.filter(r => r.status === 'success').length} successful, ${importResults.filter(r => r.status === 'failed').length} failed`);
    
    res.json({ 
      success: true, 
      message: 'Products imported successfully',
      results: importResults
    });
  } catch (error) {
    console.error('❌ Bulk import error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   GET ALL PRODUCTS ADMIN - SIMPLIFIED!
===================================================== */
exports.getAllProductsAdmin = async (req, res) => {
  try {
    console.log('📦 Fetching all products for admin...');
    
    const products = await Product.find()
      .populate('category', '_id name slug')
      .sort({ createdAt: -1 });

    console.log(`📦 Found ${products.length} products for admin`);
    
    // Transform products
    const transformedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock || 0,
      category: product.category ? {
        _id: product.category._id,
        name: product.category.name
      } : null,
      brand: product.brand || '',
      sku: product.sku || '',
      description: product.description || '',
      images: product.images || [],
      isActive: true, // All products are active since no status field
      isFeatured: product.isFeatured || false,
      lowStockThreshold: product.lowStockThreshold || 10,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));

    res.json({ 
      success: true, 
      products: transformedProducts
    });
  } catch (error) {
    console.error('❌ getAllProductsAdmin error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   PUBLIC: GET PRODUCTS - SIMPLIFIED!
===================================================== */
exports.getProducts = async (req, res) => {
  try {
    const { category: categorySlug, debug } = req.query;

    console.log('📡 API Called with category:', categorySlug || 'ALL');

    // SIMPLE FILTER: No status checking since no status field
    const filter = {};

    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug.toLowerCase() });

      if (category) {
        filter.category = category._id;
      } else {
        return res.json([]);
      }
    }

    console.log('🔍 Final filter:', JSON.stringify(filter));

    const products = await Product.find(filter)
      .populate('category', '_id name slug')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${products.length} products`);

    if (debug === 'true') {
      return res.json({
        count: products.length,
        products
      });
    }

    res.json(products);
  } catch (error) {
    console.error('❌ getProducts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* =====================================================
   GET SINGLE PRODUCT
===================================================== */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', '_id name slug');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   ADMIN: DELETE PRODUCT
===================================================== */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('❌ Delete product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   ADMIN: LOW STOCK PRODUCTS
===================================================== */
exports.getLowStockProducts = async (req, res) => {
  try {
    console.log('⚠️ Fetching low stock products...');
    
    const products = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    })
    .populate('category', '_id name')
    .sort({ stock: 1 });

    console.log(`⚠️ Found ${products.length} low stock products`);
    
    res.json({ 
      success: true, 
      products: products.map(p => ({
        _id: p._id,
        name: p.name,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        category: p.category ? {
          _id: p.category._id,
          name: p.category.name
        } : null
      }))
    });
  } catch (error) {
    console.error('❌ getLowStockProducts error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   ADMIN: TOGGLE FEATURED
===================================================== */
exports.toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.isFeatured = !product.isFeatured;
    await product.save();

    res.json({ success: true, isFeatured: product.isFeatured });
  } catch (error) {
    console.error('❌ Toggle featured error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   ADMIN: EXPORT PRODUCTS - UPDATED
===================================================== */
exports.exportProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'name');

    let csvData = 'Name,Category,Price,Stock,Brand,Featured\n';
    products.forEach(p => {
      csvData += `${p.name},${p.category?.name},${p.price},${p.stock},${p.brand},${p.isFeatured}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('products.csv');
    res.send(csvData);
  } catch (error) {
    console.error('❌ Export products error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   ADMIN: BULK DELETE PRODUCTS
===================================================== */
exports.bulkDeleteProducts = async (req, res) => {
  try {
    const { productIds } = req.body;
    
    console.log('🗑️ Bulk deleting products:', productIds.length, 'products');
    
    const result = await Product.deleteMany(
      { _id: { $in: productIds } }
    );
    
    console.log(`✅ Bulk deleted ${result.deletedCount} products`);
    
    res.json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} products` 
    });
  } catch (error) {
    console.error('❌ Bulk delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};