import pool from "../components/config/db.js";

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

// FIND CAR
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

// CHECK RENTAL OVERLAP
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

// GET MY RENTALS

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
      c.registration_number,

      p.payment_method,
      COALESCE(p.payment_status, 'Pending') AS payment_status,
      p.paid_at

    FROM rentals r

    JOIN cars c
      ON r.car_id = c.car_id
    
    LEFT JOIN payments p
      ON r.rental_id = p.rental_id

    WHERE r.user_id = ?

    ORDER BY r.created_at DESC
    `,
    [userId],
  );

  return rentals;
};

// GET ALL RENTALS
// ADMIN / STAFF

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
      u.phone,

      c.car_id,
      c.brand,
      c.model,
      c.registration_number,

      p.payment_method,
      COALESCE(p.payment_status, 'Pending') AS payment_status,
      p.paid_at

    FROM rentals r

    JOIN users u
      ON r.user_id = u.user_id

    JOIN cars c
      ON r.car_id = c.car_id

    LEFT JOIN payments p
      ON r.rental_id = p.rental_id


    ORDER BY r.created_at DESC
    `,
  );

  return rentals;
};

// GET RENTAL HISTORY
// CUSTOMER

export const getRentalHistory = async (userId, status) => {
  let query = `
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
      c.registration_number,

      p.payment_method,
      COALESCE(p.payment_status, 'Pending') AS payment_status,
      p.paid_at

    FROM rentals r

    JOIN cars c
      ON r.car_id = c.car_id

    LEFT JOIN payments p
      ON r.rental_id = p.rental_id

    WHERE r.user_id = ?
  `;

  const params = [userId];

  if (status) {
    query += ` AND r.status = ?`;
    params.push(status);
  }

  query += ` ORDER BY r.created_at DESC`;

  const [rentals] = await pool.query(query, params);

  return rentals;
};

// UPDATE RENTAL STATUS
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

// UPDATE CAR STATUS
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

// CANCEL RENTAL
export const cancelRental = async (rentalId) => {
  // Check payment status
  const [payments] = await pool.query(
    `
    SELECT payment_status
    FROM payments
    WHERE rental_id = ?
    `,
    [rentalId],
  );

  // Prevent cancellation if payment is completed
  if (payments.length > 0 && payments[0].payment_status === "Completed") {
    throw new Error("Cannot cancel rental after payment is completed");
  }

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

// CUSTOMER DASHBOARD STATS
export const getCustomerDashboardStats = async (userId) => {
  const [stats] = await pool.query(
    `
    SELECT
      SUM(r.status = 'Active') AS active_rentals,

      SUM(
        r.status IN ('Pending', 'Confirmed')
        AND r.start_date > NOW()
      ) AS upcoming_rentals,

      SUM(r.status = 'Pending') AS pending_rentals

    FROM rentals r
    WHERE r.user_id = ?
    `,
    [userId],
  );

  const [payments] = await pool.query(
    `
    SELECT
      COALESCE(SUM(p.amount), 0) AS total_payments

    FROM payments p

    JOIN rentals r
      ON p.rental_id = r.rental_id

    WHERE r.user_id = ?
      AND p.payment_status = 'Completed'
    `,
    [userId],
  );

  return {
    activeRentals: Number(stats[0].active_rentals || 0),
    upcomingRentals: Number(stats[0].upcoming_rentals || 0),
    pendingRentals: Number(stats[0].pending_rentals || 0),
    totalPayments: Number(payments[0].total_payments || 0),
  };
};
