const mongoose = require("mongoose");
const Category = require("./models/Category");

require("dotenv").config();

const categories = [
  {
    name: "Fresh Fruit",
    description: "Fresh and delicious fruits for your everyday needs.",
    slug: "fresh-fruit",
  },
  {
    name: "Vegetables",
    description: "Fresh vegetables for healthy meals.",
    slug: "vegetables",
  },
  {
    name: "Dairy & Eggs",
    description: "Fresh dairy products and farm eggs.",
    slug: "dairy-eggs",
  },
  {
    name: "Beverages",
    description: "Refreshing drinks, juices, coffee, tea, and water.",
    slug: "beverages",
  },
  {
    name: "Bakery",
    description: "Fresh bread, pastries, cakes, and baked goods.",
    slug: "bakery",
  },
  {
    name: "Meat & Seafood",
    description: "Fresh meat and seafood products.",
    slug: "meat-seafood",
  },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Category.deleteMany({});
    await Category.insertMany(categories);

    console.log("✅ Categories added successfully!");

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

seedCategories();