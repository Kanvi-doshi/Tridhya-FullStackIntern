import { NextResponse } from "next/server";
import { connectDB } from "@/database/db";
import Expense from "@/models/Expense";

export async function GET() {
  try {
    await connectDB();

    const expenses = await Expense.find().sort({
      createdAt: -1,
    });

    return NextResponse.json(
      {
        success: true,
        expenses,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error);

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
