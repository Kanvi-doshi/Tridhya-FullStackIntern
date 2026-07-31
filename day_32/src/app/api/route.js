import { connectDB } from "@/database/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    await User.deleteMany({});

    await User.insertMany([
      {
        name: "Admin",
        email: "admin@gmail.com",
        password: "123",
        role: "admin",
      },

      {
        name: "John",
        email: "manager@gmail.com",
        password: "123",
        role: "manager",
      },

      {
        name: "Kanvi",
        email: "employee@gmail.com",
        password: "123",
        role: "employee",
      },
    ]);

    return Response.json({
      success: true,
      message: "Users Seeded Successfully!",
    });
  } catch (error) {
    return Response.json({
      success: false,
      message: error.message,
    });
  }
}
