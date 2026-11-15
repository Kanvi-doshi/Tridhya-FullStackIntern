import {
  findRentalById,
  findPaymentByRentalId,
  createPayment,
  getPaymentById,
  getUserPayments,
  getAllPayments,
  updatePaymentStatus,
  updateRentalStatus,
} from "../service/payment.service.js";

// CREATE PAYMENT
export const create = async (req, res) => {
  try {
    const { rental_id, payment_method } = req.body;

    const user_id = req.user.user_id;

    // Validate required fields
    if (!rental_id || !payment_method) {
      return res.status(400).json({
        message: "Rental ID and payment method are required",
      });
    }

    // Validate payment method
    const allowedMethods = ["Cash", "Card", "UPI"];

    if (!allowedMethods.includes(payment_method)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    // Find rental
    const rental = await findRentalById(rental_id);

    if (!rental) {
      return res.status(404).json({
        message: "Rental not found",
      });
    }

    // Customer can pay only for their own rental
    if (rental.user_id !== user_id) {
      return res.status(403).json({
        message: "You are not allowed to pay for this rental",
      });
    }

    // Check existing payment
    const existingPayment = await findPaymentByRentalId(rental_id);

    if (existingPayment) {
      return res.status(409).json({
        message: "Payment already exists for this rental",
      });
    }

    // Rental must be pending
    if (rental.status !== "Pending") {
      return res.status(400).json({
        message: "Payment can only be made for a pending rental",
      });
    }

    // Create payment
    const paymentId = await createPayment({
      rental_id,
      amount: rental.total_amount,
      payment_method,
      payment_status: "Completed",
    });

    // Update rental status
    await updateRentalStatus(rental_id, "Confirmed");

    res.status(201).json({
      message: "Payment completed successfully",
      payment: {
        payment_id: paymentId,
        rental_id,
        amount: rental.total_amount,
        payment_method,
        payment_status: "Completed",
      },
    });
  } catch (error) {
    console.error("Create payment error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// GET MY PAYMENTS
export const getMyPayments = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const payments = await getUserPayments(user_id);

    res.status(200).json({
      message: "Payments fetched successfully",
      payments,
    });
  } catch (error) {
    console.error("Get user payments error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// GET SINGLE PAYMENT
export const getPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await getPaymentById(id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    // Customer can view only their payment
    if (
      req.user.role_name === "Customer" &&
      payment.user_id !== req.user.user_id
    ) {
      return res.status(403).json({
        message: "You are not allowed to view this payment",
      });
    }

    res.status(200).json({
      message: "Payment fetched successfully",
      payment,
    });
  } catch (error) {
    console.error("Get payment error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// GET ALL PAYMENTS
export const getPayments = async (req, res) => {
  try {
    const payments = await getAllPayments();

    res.status(200).json({
      message: "Payments fetched successfully",
      payments,
    });
  } catch (error) {
    console.error("Get all payments error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// UPDATE PAYMENT STATUS
export const changePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Completed", "Failed"];

    if (!status) {
      return res.status(400).json({
        message: "Payment status is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid payment status",
      });
    }

    const payment = await getPaymentById(id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    await updatePaymentStatus(id, status);

    // Successful payment confirms rental
    if (status === "Completed") {
      await updateRentalStatus(payment.rental_id, "Confirmed");
    }

    res.status(200).json({
      message: "Payment status updated successfully",
      payment_id: Number(id),
      payment_status: status,
    });
  } catch (error) {
    console.error("Update payment status error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
