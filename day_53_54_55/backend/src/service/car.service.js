import pool from "../components/config/db.js";

export const getAllCars = async () => {
  const [cars] = await pool.query(`
    SELECT *
    FROM cars
    ORDER BY created_at DESC
  `);

  return cars;
};

export const getAvailableCars = async () => {
  const [cars] = await pool.query(`
    SELECT *
    FROM cars
    WHERE status = 'Available'
    ORDER BY created_at DESC
  `);

  return cars;
};

export const getCarById = async (carId) => {
  const [cars] = await pool.query(
    `
    SELECT *
    FROM cars
    WHERE car_id = ?
    `,
    [carId],
  );

  return cars[0];
};

export const createCar = async ({
  brand,
  model,
  year,
  registration_number,
  color,
  daily_rate,
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO cars
    (
      brand,
      model,
      year,
      registration_number,
      color,
      daily_rate
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [brand, model, year, registration_number, color || null, daily_rate],
  );

  return result.insertId;
};

export const updateCar = async (
  carId,
  { brand, model, year, registration_number, color, daily_rate, status },
) => {
  const [result] = await pool.query(
    `
    UPDATE cars
    SET
      brand = ?,
      model = ?,
      year = ?,
      registration_number = ?,
      color = ?,
      daily_rate = ?,
      status = ?
    WHERE car_id = ?
    `,
    [
      brand,
      model,
      year,
      registration_number,
      color || null,
      daily_rate,
      status,
      carId,
    ],
  );

  return result;
};

export const deleteCar = async (carId) => {
  const [result] = await pool.query(
    `
    DELETE FROM cars
    WHERE car_id = ?
    `,
    [carId],
  );

  return result;
};

export const findCarByRegistration = async (registrationNumber) => {
  const [cars] = await pool.query(
    `
    SELECT car_id
    FROM cars
    WHERE registration_number = ?
    `,
    [registrationNumber],
  );

  return cars[0];
};
