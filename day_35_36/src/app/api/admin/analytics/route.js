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
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const statusData = [
      {
        name: "Pending",
        value: pendingExpenses,
      },
      {
        name: "Approved",
        value: approvedExpenses,
      },
      {
        name: "Rejected",
        value: rejectedExpenses,
      },
    ];

    const categoryAggregation = await Expense.aggregate([
      {
        $group: {
          _id: "$category",
          amount: {
            $sum: "$amount",
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    const categoryData = categoryAggregation.map((item) => ({
      category: item._id,
      amount: item.amount,
    }));

    const monthlyAggregation = await Expense.aggregate([
      {
        $match: {
          status: "Approved",
        },
      },
      {
        $group: {
          _id: {
            $substr: ["$date", 0, 7],
          },
          amount: {
            $sum: "$amount",
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    const monthlyData = monthlyAggregation.map((item) => ({
      month: item._id,
      amount: item.amount,
    }));

    return NextResponse.json({
      success: true,

      analytics: {
        totalUsers,
        totalEmployees,
        totalManagers,
        totalAdmins,
        totalExpenses,
        pendingExpenses,
        approvedExpenses,
        rejectedExpenses,
        totalAmount:
          totalAmountResult.length > 0 ? totalAmountResult[0].total : 0,
      },

      statusData,
      categoryData,
      monthlyData,
    });
  } catch (error) {
    console.log("Analytics Error:", error);

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
