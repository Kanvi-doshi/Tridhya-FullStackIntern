import { NextResponse } from "next/server";
import { connectDB } from "@/database/db";
import User from "@/models/User";
import Expense from "@/models/Expense";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin email is required",
        },
        { status: 400 },
      );
    }

    const admin = await User.findOne({
      email,
      role: "Admin",
    });

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin not found",
        },
        { status: 404 },
      );
    }

    const users = await User.find().sort({ createdAt: -1 });
    const expenses = await Expense.find().sort({ createdAt: -1 });

    const employees = users.filter((user) => user.role === "Employee");
    const managers = users.filter((user) => user.role === "Manager");

    return NextResponse.json(
      {
        success: true,
        user: admin,

        totalUsers: users.length,
        totalEmployees: employees.length,
        totalManagers: managers.length,
        totalExpenses: expenses.length,

        recentUsers: users.slice(0, 5),
        recentExpenses: expenses.slice(0, 5),
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
