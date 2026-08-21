import pool from "../components/config/db.js";

/*Create a rental*/
export const createRental = async ({
  user_id,
  car_id,
  start_date,
  end_date,
  total_amount,
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO rentals
    (
      user_id,
      car_id,
      start_date,
      end_date,
      total_amount
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [user_id, car_id, start_date, end_date, total_amount],
  );

  return result.insertId;
};

/*Find car by ID*/
export const findCarById = async (carId) => {
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

/*Check whether the car has an overlapping rental*/
export const checkRentalOverlap = async (carId, startDate, endDate) => {
  const [rentals] = await pool.query(
    `
    SELECT rental_id
    FROM rentals
    WHERE car_id = ?
      AND status IN ('Pending', 'Confirmed', 'Active')
      AND start_date <= ?
      AND end_date >= ?
    `,
    [carId, endDate, startDate],
  );

  return rentals.length > 0;
};

/* Get all rentals of a particular user*/
export const getUserRentals = async (userId) => {
  const [rentals] = await pool.query(
    `
    SELECT
      r.rental_id,
      r.start_date,
      r.end_date,
      r.total_amount,
      r.status,
      r.created_at,

      c.car_id,
      c.brand,
      c.model,
      c.registration_number

    FROM rentals r

    JOIN cars c
      ON r.car_id = c.car_id

    WHERE r.user_id = ?

    ORDER BY r.created_at DESC
    `,
    [userId],
  );

  return rentals;
};

/* Get rental by ID*/
export const getRentalById = async (rentalId) => {
  const [rentals] = await pool.query(
    `
    SELECT
      r.rental_id,
      r.user_id,
      r.car_id,
      r.start_date,
      r.end_date,
      r.total_amount,
      r.status,
      r.created_at,

      u.first_name,
      u.last_name,
      u.email,

      c.brand,
      c.model,
      c.registration_number

    FROM rentals r

    JOIN users u
      ON r.user_id = u.user_id

    JOIN cars c
      ON r.car_id = c.car_id

    WHERE r.rental_id = ?
    `,
    [rentalId],
  );

  return rentals[0];
};

/* Get all rentals
  Admin / Staff*/

export const getAllRentals = async () => {
  const [rentals] = await pool.query(
    `
    SELECT
      r.rental_id,
      r.start_date,
      r.end_date,
      r.total_amount,
      r.status,
      r.created_at,

      u.user_id,
      u.first_name,
      u.last_name,
      u.email,

      c.car_id,
      c.brand,
      c.model,
      c.registration_number

    FROM rentals r

    JOIN users u
      ON r.user_id = u.user_id

    JOIN cars c
      ON r.car_id = c.car_id

    ORDER BY r.created_at DESC
    `,
  );

  return rentals;
};

/* Update rental status*/
export const updateRentalStatus = async (rentalId, status) => {
  const [result] = await pool.query(
    `
    UPDATE rentals
    SET status = ?
    WHERE rental_id = ?
    `,
    [status, rentalId],
  );

  return result;
};

/*Update car status*/
export const updateCarStatus = async (carId, status) => {
  const [result] = await pool.query(
    `
    UPDATE cars
    SET status = ?
    WHERE car_id = ?
    `,
    [status, carId],
  );

  return result;
};

/*Cancel rental*/
export const cancelRental = async (rentalId) => {
  const [result] = await pool.query(
    `
    UPDATE rentals
    SET status = 'Cancelled'
    WHERE rental_id = ?
    `,
    [rentalId],
  );

  return result;
};
