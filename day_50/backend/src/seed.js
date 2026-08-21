import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import "dotenv/config";

import Category from "./models/category.js";
import Product from "./models/product.js";
import connectDB from "./components/config/db.js";

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Latest electronic devices and gadgets",
  },
  {
    name: "Clothing",
    slug: "clothing",
    description: "Fashionable clothing for everyday wear",
  },
  {
    name: "Shoes",
    slug: "shoes",
    description: "Comfortable and stylish footwear",
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Useful and stylish accessories",
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    description: "Products for your home and kitchen",
  },
];

const products = [
  {
    name: "Wireless Headphones",
    description: "Premium wireless headphones with noise cancellation.",
    price: 2499,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    stock: 25,
    rating: 4.5,
  },
  {
    name: "Smart Watch",
    description: "Smart watch with fitness tracking and heart-rate monitoring.",
    price: 3999,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
    stock: 18,
    rating: 4.3,
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable Bluetooth speaker with powerful sound.",
    price: 1799,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800",
    stock: 30,
    rating: 4.4,
  },
  {
    name: "USB-C Fast Charger",
    description: "Fast charging USB-C adapter for compatible devices.",
    price: 899,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800",
    stock: 50,
    rating: 4.2,
  },

  {
    name: "Classic Cotton T-Shirt",
    description: "Comfortable regular-fit cotton t-shirt.",
    price: 699,
    category: "clothing",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
    stock: 40,
    rating: 4.1,
  },
  {
    name: "Denim Jacket",
    description: "Classic denim jacket suitable for casual outfits.",
    price: 1999,
    category: "clothing",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
    stock: 15,
    rating: 4.6,
  },
  {
    name: "Hooded Sweatshirt",
    description: "Soft and warm hoodie for everyday comfort.",
    price: 1499,
    category: "clothing",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
    stock: 22,
    rating: 4.4,
  },
  {
    name: "Casual Joggers",
    description: "Comfortable joggers with an adjustable waistband.",
    price: 999,
    category: "clothing",
    image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800",
    stock: 35,
    rating: 4.2,
  },

  {
    name: "Running Shoes",
    description: "Lightweight running shoes designed for daily workouts.",
    price: 2499,
    category: "shoes",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    stock: 20,
    rating: 4.5,
  },
  {
    name: "Casual Sneakers",
    description: "Stylish sneakers for everyday casual wear.",
    price: 2199,
    category: "shoes",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
    stock: 28,
    rating: 4.3,
  },
  {
    name: "Formal Shoes",
    description: "Classic formal shoes suitable for office and events.",
    price: 2999,
    category: "shoes",
    image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800",
    stock: 12,
    rating: 4.4,
  },

  {
    name: "Leather Wallet",
    description: "Compact wallet made with premium leather.",
    price: 799,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800",
    stock: 45,
    rating: 4.2,
  },
  {
    name: "Classic Backpack",
    description: "Spacious backpack suitable for work, college and travel.",
    price: 1299,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
    stock: 25,
    rating: 4.5,
  },
  {
    name: "Sunglasses",
    description: "Classic sunglasses with UV protection.",
    price: 999,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800",
    stock: 30,
    rating: 4.1,
  },

  {
    name: "Coffee Maker",
    description: "Compact coffee maker for making fresh coffee at home.",
    price: 3499,
    category: "home-kitchen",
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800",
    stock: 10,
    rating: 4.6,
  },
  {
    name: "Non-Stick Cookware Set",
    description: "Durable non-stick cookware set for everyday cooking.",
    price: 2799,
    category: "home-kitchen",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800",
    stock: 14,
    rating: 4.4,
  },
];

const seedDatabase = async () => {
  try {
    console.log("DB_URL:", process.env.DB_URL);

    await connectDB();

    console.log("MongoDB connected");

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});

    console.log("Existing products deleted");
    console.log("Existing categories deleted");

    // Seed categories
    const createdCategories = await Category.create(categories);

    console.log("Categories seeded");

    // Create category map
    const categoryMap = {};

    createdCategories.forEach((category) => {
      categoryMap[category.slug] = category._id;
    });

    // Prepare products
    const productsToCreate = products.map((product) => ({
      ...product,
      category: categoryMap[product.category],
    }));

    // Seed products
    await Product.create(productsToCreate);

    console.log("Products seeded");

    console.log(`Categories: ${createdCategories.length}`);
    console.log(`Products: ${productsToCreate.length}`);

    await mongoose.connection.close();

    console.log("Database connection closed");
  } catch (error) {
    console.error("Seeding failed:", error);

    await mongoose.connection.close();

    process.exit(1);
  }
};

seedDatabase();
