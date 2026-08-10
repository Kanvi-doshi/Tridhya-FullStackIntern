import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import "dotenv/config";

import app from "./app.js";
import { connectDB } from "./components/database/db.js";

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("error",err);
  }
};

startServer();
