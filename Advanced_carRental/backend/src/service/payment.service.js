import pool from "../components/config/db.js";

// FIND RENTAL
export const findRentalById = async (rentalId) => {
  const [rentals] = await pool.query(
    `
    SELECT
      rental_id,
      user_id,
      car_id,
      total_amount,
      status
    FROM rentals
    WHERE rental_id = ?
    `,
    [rentalId],
  );

  return rentals[0];
};

// CHECK EXISTING PAYMENT
export const findPaymentByRentalId = async (rentalId) => {
  const [payments] = await pool.query(
    `
    SELECT *
    FROM payments
    WHERE rental_id = ?
    `,
    [rentalId],
  );

  return payments[0];
};

// CREATE PAYMENT
export const createPayment = async ({
  rental_id,
  amount,
  payment_method,
  payment_status,
}) => {
  const paidAt = payment_status === "Completed" ? new Date() : null;

  const [result] = await pool.query(
    `
    INSERT INTO payments
    (
      rental_id,
      amount,
      payment_method,
      payment_status,
      paid_at
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [rental_id, amount, payment_method, payment_status, paidAt],
  );

  return result.insertId;
};

// GET PAYMENT BY ID
export const getPaymentById = async (paymentId) => {
  const [payments] = await pool.query(
    `
    SELECT
      p.payment_id,
      p.rental_id,
      p.amount,
      p.payment_method,
      p.payment_status,
      p.paid_at,
      p.created_at,

      r.user_id,
      r.car_id,
      r.start_date,
      r.end_date

    FROM payments p

    JOIN rentals r
      ON p.rental_id = r.rental_id

    WHERE p.payment_id = ?
    `,
    [paymentId],
  );

  return payments[0];
};

// GET USER PAYMENTS
export const getUserPayments = async (userId) => {
  const [payments] = await pool.query(
    `
    SELECT
      p.payment_id,
      p.rental_id,
      p.amount,
      p.payment_method,
      p.payment_status,
      p.paid_at,
      p.created_at,

      r.start_date,
      r.end_date,
      r.status AS rental_status,

      c.brand,
      c.model

    FROM payments p

    JOIN rentals r
      ON p.rental_id = r.rental_id

    JOIN cars c
      ON r.car_id = c.car_id

    WHERE r.user_id = ?

    ORDER BY p.created_at DESC
    `,
    [userId],
  );

  return payments;
};

// GET ALL PAYMENTS
export const getAllPayments = async () => {
  const [payments] = await pool.query(
    `
    SELECT
      p.payment_id,
      p.rental_id,
      p.amount,
      p.payment_method,
      p.payment_status,
      p.paid_at,
      p.created_at,

      u.user_id,
      u.first_name,
      u.last_name,
      u.email,
      u.phone,

      c.car_id,
      c.brand,
      c.model,
      c.registration_number

    FROM payments p

    JOIN rentals r
      ON p.rental_id = r.rental_id

    JOIN users u
      ON r.user_id = u.user_id

    JOIN cars c
      ON r.car_id = c.car_id

    ORDER BY p.created_at DESC
    `,
  );

  return payments;
};

// UPDATE PAYMENT STATUS
export const updatePaymentStatus = async (paymentId, status) => {
  const paidAt = status === "Completed" ? new Date() : null;

  const [result] = await pool.query(
    `
    UPDATE payments
    SET
      payment_status = ?,
      paid_at = ?
    WHERE payment_id = ?
    `,
    [status, paidAt, paymentId],
  );

  return result;
};

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
