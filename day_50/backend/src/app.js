import express from "express";
import path from "path";
import cors from "cors";
import categoryRoutes from "./route/category.route.js";
import productRoutes from "./route/product.route.js";
import cartRoutes from "./route/cart.route.js";
import authRoutes from "./route/auth.route.js";
import orderRoutes from "./route/order.route.js";
import adminRoutes from "./route/admin.route.js";

import errorHandler from "./components/middleware/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Shopping Cart API is running",
  });
});

app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/admin", adminRoutes);


app.use(errorHandler);

export default app;
