// Likely missing something like this:
import mongoose from "mongoose";
import dns from "dns"; // ADD THIS LINE

dns.setServers(["8.8.8.8", "1.1.1.1"]);  
const MONGODB_URI = process.env.DB_URL;

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false, // fail fast instead of hanging
      })
      .then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // reset on failure so next call retries
    throw e;
  }

  return cached.conn;
}
