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
          message: "Manager email is required",
        },
        {
          status: 400,
        },
      );
    }

    const manager = await User.findOne({ email, role: "Manager" });
    if (!manager) {
      return NextResponse.json(
        {
          success: false,
          message: "Manager not found",
        },
        {
          status: 404,
        },
      );
    }

    // Get all expenses
    const expenses = await Expense.find().sort({
      createdAt: -1,
    });

    // Dashboard Counts
    const pendingExpenses = expenses.filter(
      (expense) => expense.status === "Pending",
    );

    const approvedExpenses = expenses.filter(
      (expense) => expense.status === "Approved",
    );

    const rejectedExpenses = expenses.filter(
      (expense) => expense.status === "Rejected",
    );

    const totalEmployees = await User.countDocuments({
      role: "Employee",
    });

    return NextResponse.json(
      {
        success: true,

        user: {
          id: manager._id,
          name: manager.name,
          email: manager.email,
          role: manager.role,
        },

        pendingCount: pendingExpenses.length,
        approvedCount: approvedExpenses.length,
        rejectedCount: rejectedExpenses.length,
        totalEmployees,

        recentPendingExpenses: pendingExpenses.slice(0, 5),
        pendingExpenses,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log("Manager Dashboard Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(request) {
  try {
    await connectDB();

    const { expenseId, status } = await request.json();

    if (!expenseId || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "Expense ID and status are required",
        },
        {
          status: 400,
        },
      );
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status",
        },
        {
          status: 400,
        },
      );
    }

    const expense = await Expense.findByIdAndUpdate(
      expenseId,
      {
        status,
      },
      {
        new: true,
      },
    );

    if (!expense) {
      return NextResponse.json(
        {
          success: false,
          message: "Expense not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Expense ${status} successfully`,
        expense,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log("Review Expense Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
