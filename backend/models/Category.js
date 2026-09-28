const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true, // e.g., "fresh-fruits"
  },
  description: {
    type: String,
    required: true,
  },
   image: {  
    type: String,
    default: '', 
  },
  productCount: {
    type: Number,
    default: 0, // can be updated whenever products are added/removed
  },
  type: {
    type: String,
    default: 'product', // always 'product'
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
