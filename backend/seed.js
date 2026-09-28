const mongoose = require("mongoose");
const Product = require("./models/Product");
const Category = require("./models/Category");

require("dotenv").config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const freshFruit = await Category.findOne({ name: "Fresh Fruit" });
    const vegetables = await Category.findOne({ name: "Vegetables" });
    const dairyEggs = await Category.findOne({ name: "Dairy & Eggs" });
    const beverages = await Category.findOne({ name: "Beverages" });
    const bakery = await Category.findOne({ name: "Bakery" });
    const meatSeafood = await Category.findOne({ name: "Meat & Seafood" });

    if (
      !freshFruit ||
      !vegetables ||
      !dairyEggs ||
      !beverages ||
      !bakery ||
      !meatSeafood
    ) {
      console.log("❌ Some categories are missing. Please check your database.");
      return;
    }

    const products = [
      // Fresh Fruit
      {
        name: "Apple",
        slug: "apple",
        category: freshFruit._id,
        price: 2,
        stock: 50,
        description: "Red apples",
        thumbnail: "apples.jpg",
      },
      {
        name: "Banana",
        slug: "banana",
        category: freshFruit._id,
        price: 1,
        stock: 50,
        description: "Yellow bananas",
        thumbnail: "banana.jpg",
      },
      {
        name: "Orange",
        slug: "orange",
        category: freshFruit._id,
        price: 2,
        stock: 50,
        description: "Juicy oranges",
        thumbnail: "orange.jpg",
      },
      {
        name: "Mango",
        slug: "mango",
        category: freshFruit._id,
        price: 3,
        stock: 40,
        description: "Sweet mangoes",
        thumbnail: "mango.jpg",
      },
      {
        name: "Strawberry",
        slug: "strawberry",
        category: freshFruit._id,
        price: 4,
        stock: 30,
        description: "Fresh strawberries",
        thumbnail: "strawberry.jpg",
      },

      // Vegetables
      {
        name: "Tomato",
        slug: "tomato",
        category: vegetables._id,
        price: 1,
        stock: 50,
        description: "Fresh tomatoes",
        thumbnail: "tomato.jpg",
      },
      {
        name: "Cucumber",
        slug: "cucumber",
        category: vegetables._id,
        price: 1,
        stock: 50,
        description: "Green cucumber",
        thumbnail: "cucumber.jpg",
      },
      {
        name: "Carrot",
        slug: "carrot",
        category: vegetables._id,
        price: 2,
        stock: 50,
        description: "Orange carrots",
        thumbnail: "carrot.jpg",
      },
      {
        name: "Lettuce",
        slug: "lettuce",
        category: vegetables._id,
        price: 2,
        stock: 40,
        description: "Fresh lettuce",
        thumbnail: "lettuce.jpg",
      },
      {
        name: "Pepper",
        slug: "pepper",
        category: vegetables._id,
        price: 3,
        stock: 40,
        description: "Bell peppers",
        thumbnail: "bell_pepper.jpg",
      },

      // Dairy & Eggs
      {
        name: "Milk",
        slug: "milk",
        category: dairyEggs._id,
        price: 2,
        stock: 40,
        description: "Fresh milk",
        thumbnail: "milk.jpg",
      },
      {
        name: "Cheese",
        slug: "cheese",
        category: dairyEggs._id,
        price: 5,
        stock: 30,
        description: "Cheddar cheese",
        thumbnail: "cheese.jpg",
      },
      {
        name: "Eggs",
        slug: "eggs",
        category: dairyEggs._id,
        price: 3,
        stock: 60,
        description: "Farm eggs",
        thumbnail: "eggs.jpg",
      },
      {
        name: "Butter",
        slug: "butter",
        category: dairyEggs._id,
        price: 4,
        stock: 30,
        description: "Creamy butter",
        thumbnail: "butter.jpg",
      },
      {
        name: "Yogurt",
        slug: "yogurt",
        category: dairyEggs._id,
        price: 2,
        stock: 40,
        description: "Natural yogurt",
        thumbnail: "yogurt.jpg",
      },

      // Beverages
      {
        name: "Coca Cola",
        slug: "coca-cola",
        category: beverages._id,
        price: 2,
        stock: 50,
        description: "Cold soda",
        thumbnail: "cola.jpg",
      },
      {
        name: "Orange Juice",
        slug: "orange-juice",
        category: beverages._id,
        price: 3,
        stock: 40,
        description: "Fresh juice",
        thumbnail: "orange-juice.jpg",
      },
      {
        name: "Coffee",
        slug: "coffee",
        category: beverages._id,
        price: 5,
        stock: 30,
        description: "Ground coffee",
        thumbnail: "coffee.jpg",
      },
      {
        name: "Tea",
        slug: "tea",
        category: beverages._id,
        price: 4,
        stock: 40,
        description: "Green tea",
        thumbnail: "tea.jpg",
      },
      {
        name: "Water Bottle",
        slug: "water-bottle",
        category: beverages._id,
        price: 1,
        stock: 100,
        description: "Mineral water",
        thumbnail: "water.jpg",
      },

      // Bakery
      {
        name: "Bread",
        slug: "bread",
        category: bakery._id,
        price: 2,
        stock: 40,
        description: "Fresh bread",
        thumbnail: "bread.jpg",
      },
      {
        name: "Croissant",
        slug: "croissant",
        category: bakery._id,
        price: 3,
        stock: 30,
        description: "Butter croissant",
        thumbnail: "croissant.jpg",
      },
      {
        name: "Muffin",
        slug: "muffin",
        category: bakery._id,
        price: 2,
        stock: 30,
        description: "Blueberry muffin",
        thumbnail: "muffin.jpg",
      },
      {
        name: "Cake",
        slug: "cake",
        category: bakery._id,
        price: 5,
        stock: 20,
        description: "Chocolate cake",
        thumbnail: "cake.jpg",
      },
      {
        name: "Donut",
        slug: "donut",
        category: bakery._id,
        price: 1,
        stock: 40,
        description: "Glazed donut",
        thumbnail: "donut.jpg",
      },

      // Meat & Seafood
      {
        name: "Chicken Breast",
        slug: "chicken-breast",
        category: meatSeafood._id,
        price: 5,
        stock: 30,
        description: "Fresh chicken",
        thumbnail: "chicken-breast.jpg",
      },
      {
        name: "Beef",
        slug: "beef",
        category: meatSeafood._id,
        price: 8,
        stock: 25,
        description: "Beef meat",
        thumbnail: "beef-steak.jpg",
      },
      {
        name: "Fish",
        slug: "fish",
        category: meatSeafood._id,
        price: 6,
        stock: 25,
        description: "Fresh fish",
        thumbnail: "fish.jpg",
      },
      {
        name: "Shrimp",
        slug: "shrimp",
        category: meatSeafood._id,
        price: 10,
        stock: 20,
        description: "Fresh shrimp",
        thumbnail: "shrimp.jpg",
      },
      {
        name: "Lamb",
        slug: "lamb",
        category: meatSeafood._id,
        price: 12,
        stock: 20,
        description: "Lamb meat",
        thumbnail: "lamb-meat.jpg",
      },
    ];

    await Product.deleteMany({});
    await Product.insertMany(products);

    console.log("✅ Products added successfully!");
    console.log(`✅ Total products: ${products.length}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error:", err);
    await mongoose.disconnect();
  }
};

seed();