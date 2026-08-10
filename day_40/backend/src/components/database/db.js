import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);

    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database Connection Failed");
    console.error("error:- ",error.message);
    process.exit(1);
  }
};
