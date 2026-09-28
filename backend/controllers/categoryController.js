const Category = require('../models/Category');
const slugify = require('slugify'); // make sure to npm install slugify

// Create new category (Admin only)
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Generate slug from name
    const slug = slugify(name, { lower: true, strict: true });

    // Initialize productCount with 0
    const category = new Category({
      name,
      slug,
      description: description || '',
       image: image || '',
      productCount: 0,
    });

    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error(err);

    // Handle duplicate category name error
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Category name must be unique' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
