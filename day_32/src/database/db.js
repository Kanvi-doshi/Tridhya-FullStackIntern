import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    console.log("Already Connected");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.DB_URL);

    isConnected = db.connections[0].readyState;

    console.log("MongoDB Connected!");
  } catch (error) {
    console.log(error);
  }
}
