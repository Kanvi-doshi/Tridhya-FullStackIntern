import { NextResponse } from "next/server";
import { connectDB } from "@/database/db";
import User from "@/models/User";
import Expense from "@/models/Expense";

export async function GET() {
  try {
    await connectDB();

    const totalUsers = await User.countDocuments();

    const totalEmployees = await User.countDocuments({
      role: "Employee",
    });

    const totalManagers = await User.countDocuments({
      role: "Manager",
    });

    const totalAdmins = await User.countDocuments({
      role: "Admin",
    });

    const totalExpenses = await Expense.countDocuments();

    const pendingExpenses = await Expense.countDocuments({
      status: "Pending",
    });

    const approvedExpenses = await Expense.countDocuments({
      status: "Approved",
    });

    const rejectedExpenses = await Expense.countDocuments({
      status: "Rejected",
    });

    const totalAmountResult = await Expense.aggregate([
      {
        $match: {
          status: "Approved",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const totalAmount =
      totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;

    return NextResponse.json({
      success: true,
      report: {
        totalUsers,
        totalEmployees,
        totalManagers,
        totalAdmins,
        totalExpenses,
        pendingExpenses,
        approvedExpenses,
        rejectedExpenses,
        totalAmount,
      },
    });
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
