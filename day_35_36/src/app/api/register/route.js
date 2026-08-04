import { connectDB } from "@/database/db";
import User from "@/models/User";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    await connectDB();

    const { name, email, password, role } = await request.json();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return Response.json(
        {
          success: false,
          message: "Email already exists",
        },
        {
          status: 400,
        },
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return Response.json(
      {
        success: true,
        message: "User registered successfully",
        user: newUser,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
