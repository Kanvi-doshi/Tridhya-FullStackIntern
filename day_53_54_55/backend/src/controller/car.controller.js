import {
  getAllCars,
  getAvailableCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  findCarByRegistration,
} from "../service/car.service.js";

export const getCars = async (req, res) => {
  try {
    const cars = await getAllCars();

    res.status(200).json({
      message: "Cars fetched successfully",
      cars,
    });
  } catch (error) {
    console.error("Get cars error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getAvailable = async (req, res) => {
  try {
    const cars = await getAvailableCars();

    res.status(200).json({
      message: "Available cars fetched successfully",
      cars,
    });
  } catch (error) {
    console.error("Get available cars error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getCar = async (req, res) => {
  try {
    const { id } = req.params;

    const car = await getCarById(id);

    if (!car) {
      return res.status(404).json({
        message: "Car not found",
      });
    }

    res.status(200).json({
      message: "Car fetched successfully",
      car,
    });
  } catch (error) {
    console.error("Get car error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const addCar = async (req, res) => {
  try {
    const { brand, model, year, registration_number, color, daily_rate } =
      req.body;

    if (!brand || !model || !year || !registration_number || !daily_rate) {
      return res.status(400).json({
        message:
          "Brand, model, year, registration number and daily rate are required",
      });
    }

    const existingCar = await findCarByRegistration(registration_number);

    if (existingCar) {
      return res.status(409).json({
        message: "Registration number already exists",
      });
    }

    const carId = await createCar({
      brand,
      model,
      year,
      registration_number,
      color,
      daily_rate,
    });

    res.status(201).json({
      message: "Car created successfully",
      car_id: carId,
    });
  } catch (error) {
    console.error("Create car error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const editCar = async (req, res) => {
  try {
    const { id } = req.params;

    const car = await getCarById(id);

    if (!car) {
      return res.status(404).json({
        message: "Car not found",
      });
    }

    const {
      brand,
      model,
      year,
      registration_number,
      color,
      daily_rate,
      status,
    } = req.body;

    await updateCar(id, {
      brand,
      model,
      year,
      registration_number,
      color,
      daily_rate,
      status,
    });

    res.status(200).json({
      message: "Car updated successfully",
    });
  } catch (error) {
    console.error("Update car error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const removeCar = async (req, res) => {
  try {
    const { id } = req.params;

    const car = await getCarById(id);

    if (!car) {
      return res.status(404).json({
        message: "Car not found",
      });
    }

    await deleteCar(id);

    res.status(200).json({
      message: "Car deleted successfully",
    });
  } catch (error) {
    console.error("Delete car error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
