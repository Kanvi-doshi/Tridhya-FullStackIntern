import {
  createRental,
  findCarById,
  checkRentalOverlap,
  getUserRentals,
  getAllRentals,
  getRentalHistory,
  updateRentalStatus,
  updateCarStatus,
  cancelRental,
  getCustomerDashboardStats,
} from "../service/rental.service.js";


export const create = async (req, res) => {
  try {
    const { car_id, start_date, end_date } = req.body;

    const user_id = req.user.user_id;

    if (!car_id || !start_date || !end_date) {
      return res.status(400).json({
        message: "Car, start date and end date are required",
      });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    if (startDate >= endDate) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    const car = await findCarById(car_id);

    if (!car) {
      return res.status(404).json({
        message: "Car not found",
      });
    }

    if (car.status !== "Available") {
      return res.status(400).json({
        message: "Car is currently not available",
      });
    }

    const hasOverlap = await checkRentalOverlap(car_id, start_date, end_date);

    if (hasOverlap) {
      return res.status(409).json({
        message: "Car is already booked for the selected dates",
      });
    }

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const numberOfDays = Math.ceil((endDate - startDate) / millisecondsPerDay);

    const total_amount = Number(car.daily_rate) * numberOfDays;

    const rentalId = await createRental({
      user_id,
      car_id,
      start_date,
      end_date,
      total_amount,
    });

    await updateCarStatus(car_id, "Rented");

    res.status(201).json({
      message: "Rental created successfully",

      rental: {
        rental_id: rentalId,
        user_id,
        car_id,
        start_date,
        end_date,
        number_of_days: numberOfDays,
        daily_rate: car.daily_rate,
        total_amount,
        status: "Pending",
      },
    });
  } catch (error) {
    console.error("Create rental error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// GET MY RENTALS
export const getMyRentals = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const rentals = await getUserRentals(user_id);

    res.status(200).json({
      message: "Your rentals fetched successfully",
      rentals,
    });
  } catch (error) {
    console.error("Get user rentals error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// GET ALL RENTALS
// ADMIN / STAFF
export const getRentals = async (req, res) => {
  try {
    const rentals = await getAllRentals();

    res.status(200).json({
      message: "Rentals fetched successfully",
      rentals,
    });
  } catch (error) {
    console.error("Get all rentals error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// GET RENTAL HISTORY
export const getHistory = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const { status } = req.query;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Active",
      "Completed",
      "Cancelled",
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid rental status",
      });
    }

    const rentals = await getRentalHistory(userId, status);

    res.status(200).json({
      message: "Rental history fetched successfully",
      count: rentals.length,
      rentals,
    });
  } catch (error) {
    console.error("Get rental history error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// UPDATE RENTAL STATUS
// ADMIN / STAFF
export const changeRentalStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Active",
      "Completed",
      "Cancelled",
    ];

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid rental status",
      });
    }

    await updateRentalStatus(id, status);

    res.status(200).json({
      message: "Rental status updated successfully",

      rental_id: Number(id),
      status,
    });
  } catch (error) {
    console.error("Update rental status error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// CUSTOMER
// dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const stats = await getCustomerDashboardStats(userId);

    res.status(200).json({
      message: "Customer dashboard stats fetched successfully",
      stats,
    });
  } catch (error) {
    console.error("Customer dashboard stats error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
// CANCEL RENTAL
export const cancel = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user.user_id;

    const rentals = await getUserRentals(userId);

    const rental = rentals.find((item) => item.rental_id === Number(id));

    if (!rental) {
      return res.status(404).json({
        message: "Rental not found",
      });
    }

    if (rental.status === "Completed") {
      return res.status(400).json({
        message: "Completed rental cannot be cancelled",
      });
    }

    if (rental.status === "Cancelled") {
      return res.status(400).json({
        message: "Rental is already cancelled",
      });
    }

    await cancelRental(id);

    await updateCarStatus(rental.car_id, "Available");

    res.status(200).json({
      message: "Rental cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel rental error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
