import {
  createRental,
  findCarById,
  checkRentalOverlap,
  getUserRentals,
  getRentalById,
  getAllRentals,
  updateRentalStatus,
  updateCarStatus,
  cancelRental,
} from "../service/rental.service.js";

// CREATE RENTAL

export const create = async (req, res) => {
  try {
    const { car_id, start_date, end_date } = req.body;

    const user_id = req.user.user_id;

    // Validate required fields
    if (!car_id || !start_date || !end_date) {
      return res.status(400).json({
        message: "Car, start date and end date are required",
      });
    }

    // Validate dates
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

    // Find car
    const car = await findCarById(car_id);

    if (!car) {
      return res.status(404).json({
        message: "Car not found",
      });
    }

    // Check car status
    if (car.status !== "Available") {
      return res.status(400).json({
        message: "Car is currently not available",
      });
    }

    // Check overlapping rentals
    const hasOverlap = await checkRentalOverlap(car_id, start_date, end_date);

    if (hasOverlap) {
      return res.status(409).json({
        message: "Car is already booked for the selected dates",
      });
    }

    // Calculate number of days
    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const numberOfDays = Math.ceil((endDate - startDate) / millisecondsPerDay);

    // Calculate total amount
    const total_amount = Number(car.daily_rate) * numberOfDays;

    // Create rental
    const rentalId = await createRental({
      user_id,
      car_id,
      start_date,
      end_date,
      total_amount,
    });

    // Update car status
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

// GET SINGLE RENTAL

export const getRental = async (req, res) => {
  try {
    const { id } = req.params;

    const rental = await getRentalById(id);

    if (!rental) {
      return res.status(404).json({
        message: "Rental not found",
      });
    }

    // Customer can only view their own rental
    if (
      req.user.role_name === "Customer" &&
      rental.user_id !== req.user.user_id
    ) {
      return res.status(403).json({
        message: "You are not allowed to view this rental",
      });
    }

    res.status(200).json({
      message: "Rental fetched successfully",
      rental,
    });
  } catch (error) {
    console.error("Get rental error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// GET ALL RENTALS

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

// UPDATE RENTAL STATUS

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

    const rental = await getRentalById(id);

    if (!rental) {
      return res.status(404).json({
        message: "Rental not found",
      });
    }

    await updateRentalStatus(id, status);

    // If rental is completed or cancelled,
    // make the car available again.
    if (status === "Completed" || status === "Cancelled") {
      await updateCarStatus(rental.car_id, "Available");
    }

    // If rental becomes active, mark car as rented
    if (status === "Active") {
      await updateCarStatus(rental.car_id, "Rented");
    }

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

// CANCEL RENTAL

export const cancel = async (req, res) => {
  try {
    const { id } = req.params;

    const rental = await getRentalById(id);

    if (!rental) {
      return res.status(404).json({
        message: "Rental not found",
      });
    }

    // Customer can cancel only their own rental
    if (
      req.user.role_name === "Customer" &&
      rental.user_id !== req.user.user_id
    ) {
      return res.status(403).json({
        message: "You are not allowed to cancel this rental",
      });
    }

    // Don't cancel already completed rental
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
