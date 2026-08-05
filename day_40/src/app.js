import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import authRoutes from "./route/auth.routes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EventHub API",
      version: "1.0.0",
      description: "API documentation for EventHub",
    },
    servers: [
      {
        url: "http://localhost:4000",
      },
    ],
  },
  apis: ["./src/route/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to EventHub API ",
    documentation: "http://localhost:4000/api",
  });
});


app.use("/api/auth", authRoutes);

app.use(errorHandler);

export default app;
