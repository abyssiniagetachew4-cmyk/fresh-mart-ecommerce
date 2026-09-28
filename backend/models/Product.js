const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Category
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    subcategory: {
      type: String,
      default: '',
    },

    brand: {
      type: String,
      default: '',
    },

    // Pricing
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    comparePrice: {
      type: Number,
      default: 0,
    },

    costPrice: {
      type: Number,
      default: 0,
    },

    taxRate: {
      type: Number,
      default: 0,
    },

    // Inventory
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },

    barcode: {
      type: String,
      default: '',
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    lowStockThreshold: {
      type: Number,
      default: 10,
    },

    manageStock: {
      type: Boolean,
      default: true,
    },

    allowBackorders: {
      type: Boolean,
      default: false,
    },

    stockStatus: {
      type: String,
      enum: ['in_stock', 'out_of_stock', 'on_backorder', 'discontinued'],
      default: 'in_stock',
    },

    // Descriptions
    description: {
      type: String,
      required: true,
    },

    shortDescription: {
      type: String,
      maxlength: 200,
    },

    specifications: [
      {
        key: String,
        value: String,
      },
    ],

    tags: [String],

    // Media
    images: [
      {
        url: String,
        alt: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],

    thumbnail: {
      type: String,
      default: '',
    },

    videoUrl: {
      type: String,
      default: '',
    },

    // Shipping
    requiresShipping: {
      type: Boolean,
      default: true,
    },

    shippingWeight: Number,

    // Reviews
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    // Product Features (REMOVED STATUS FIELD - Your existing products don't have it)
    isFeatured: {
      type: Boolean,
      default: false,
    },

    isNewProduct: {
      type: Boolean,
      default: true,
    },

    isBestSeller: {
      type: Boolean,
      default: false,
    },

    // SEO
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],

    // Analytics
    totalSold: {
      type: Number,
      default: 0,
    },

    views: {
      type: Number,
      default: 0,
    },

    publishedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ totalSold: -1 });

// Virtuals
productSchema.virtual('discountPercentage').get(function () {
  if (this.comparePrice > this.price) {
    return Math.round(
      ((this.comparePrice - this.price) / this.comparePrice) * 100
    );
  }
  return 0;
});

productSchema.virtual('inStock').get(function () {
  return this.stock > 0 || this.allowBackorders;
});

// Stock status middleware
// Stock status middleware (FIXED - NO next)
productSchema.pre('save', function () {
  if (this.stock <= 0 && !this.allowBackorders) {
    this.stockStatus = 'out_of_stock';
  } else if (this.stock <= 0 && this.allowBackorders) {
    this.stockStatus = 'on_backorder';
  } else {
    this.stockStatus = 'in_stock';
  }
});


module.exports = mongoose.model('Product', productSchema);