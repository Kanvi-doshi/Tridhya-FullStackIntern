import { NextResponse } from "next/server";
import { connectDB } from "@/database/db";
import Expense from "@/models/Expense";

// GET all expenses
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee ID is required",
        },
        { status: 400 },
      );
    }
    const expenses = await Expense.find({
      employeeId,
    }).sort({
      createdAt: -1,
    });

    return NextResponse.json(
      {
        success: true,
        expenses,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET Expenses Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch expenses",
      },
      { status: 500 },
    );
  }
}

// ADD new expense
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const expense = await Expense.create({
      employeeId: body.employeeId,
      employeeName: body.employeeName,
      category: body.category,
      amount: body.amount,
      description: body.description,
      date: body.date,
      status: body.status || "Pending",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Expense added successfully",
        expense,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST Expense Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add expense",
      },
      { status: 500 },
    );
  }
}
