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
          message: "Employee email required",
        },
        {
          status: 400,
        },
      );
    }
    const employee = await User.findOne({
      email,
      role: "Employee",
    });

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        {
          status: 404,
        },
      );
    }

    const expenses = await Expense.find({
      employeeId: employee._id,
    }).sort({
      createdAt: -1,
    });

    const totalExpenses = expenses.length;

    const pendingExpenses = expenses.filter(
      (expense) => expense.status === "Pending",
    ).length;

    const approvedExpenses = expenses.filter(
      (expense) => expense.status === "Approved",
    ).length;

    const rejectedExpenses = expenses.filter(
      (expense) => expense.status === "Rejected",
    ).length;

    return NextResponse.json(
      {
        success: true,

        user: {
          id: employee._id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
        },
        totalExpenses,
        pendingExpenses,
        approvedExpenses,
        rejectedExpenses,
        recentExpenses: expenses.slice(0, 5),
      },

      {
        status: 200,
      },
    );
  } catch (error) {
    console.log("Employee API Error:", error);

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
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const employee = await User.findById(body.employeeId);

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        {
          status: 404,
        },
      );
    }

    const expense = await Expense.create({
      employeeId: body.employeeId,
      employeeName: body.employeeName,
      title: body.title,
      category: body.category,
      amount: body.amount,
      date: body.date,
      status: "Pending",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Expense created successfully",
        expense,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.log("Add Expense Error:", error);

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
