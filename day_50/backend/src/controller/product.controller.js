import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import Product from "../models/product.js";
import Category from "../models/category.js";

const deleteImage = async (imagePath) => {
  if (!imagePath) return;

  const filePath = path.join(process.cwd(), imagePath);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    // Ignore if file doesn't exist
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock, rating } = req.body;

    const categoryExists = await Category.findOne({
      slug: category.toLowerCase(),
    });

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category: categoryExists._id,
      image: req.file ? `/uploads/products/${req.file.filename}` : "",
      stock,
      rating,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      isActive: true,
    };

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    if (category) {
      const categoryExists = await Category.findOne({
        slug: category.toLowerCase(),
      });

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      filter.category = categoryExists._id;
    }

    const sortOptions = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating_desc: { rating: -1 },
      name_asc: { name: 1 },
    };

    const sortOption = sortOptions[sort] || {
      createdAt: -1,
    };

    const currentPage = Math.max(parseInt(page) || 1, 1);
    const itemsPerPage = Math.max(parseInt(limit) || 10, 1);
    const skip = (currentPage - 1) * itemsPerPage;

    const products = await Product.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },

      {
        $unwind: "$category",
      },

      {
        $sort: sortOption,
      },

      {
        $skip: skip,
      },

      {
        $limit: itemsPerPage,
      },
      {
        $project: {
          name: 1,
          description: 1,
          price: 1,
          stock: 1,
          rating: 1,
          image: 1,
          category: {
            _id: "$category._id",
            name: "$category.name",
            slug: "$category.slug",
          },
        },
      },
    ]);
    const totalProducts = await Product.countDocuments(filter);

    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    res.status(200).json({
      success: true,

      pagination: {
        currentPage,
        itemsPerPage,
        totalProducts,
        totalPages,
      },

      products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findOne({
      _id: id,
      isActive: true,
    }).populate("category");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const { name, description, price, category, stock, rating, isActive } =
      req.body;

    if (category) {
      const categoryExists = await Category.findOne({
        slug: category.toLowerCase(),
      });

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      product.category = categoryExists._id;
    }

    if (req.file) {
      await deleteImage(product.image);

      product.image = `/uploads/products/${req.file.filename}`;
    }

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.stock = stock ?? product.stock;
    product.rating = rating ?? product.rating;
    product.isActive = isActive ?? product.isActive;

    await product.save();

    const updatedProduct = await Product.findById(product._id).populate(
      "category",
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await deleteImage(product.image);
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
