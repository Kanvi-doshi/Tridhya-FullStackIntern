import pool from "../components/config/db.js";

export const getAllUsers = async () => {
  const [users] = await pool.query(`
    SELECT
      u.user_id,
      u.first_name,
      u.last_name,
      u.email,
      u.phone,
      u.created_at,
      r.role_id,
      r.role_name
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    ORDER BY u.created_at DESC
  `);

  return users;
};

export const getUserById = async (userId) => {
  const [users] = await pool.query(
    `
    SELECT
      u.user_id,
      u.first_name,
      u.last_name,
      u.email,
      u.phone,
      u.created_at,
      r.role_id,
      r.role_name
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    WHERE u.user_id = ?
    `,
    [userId],
  );

  return users[0];
};

export const findRoleById = async (roleId) => {
  const [roles] = await pool.query(
    "SELECT role_id, role_name FROM roles WHERE role_id = ?",
    [roleId],
  );

  return roles[0];
};

export const updateUserRole = async (userId, roleId) => {
  const [result] = await pool.query(
    `
    UPDATE users
    SET role_id = ?
    WHERE user_id = ?
    `,
    [roleId, userId],
  );

  return result;
};

export const deleteUser = async (userId) => {
  const [result] = await pool.query("DELETE FROM users WHERE user_id = ?", [
    userId,
  ]);

  return result;
};

export const getDashboardStats = async () => {
  const [users] = await pool.query(`
    SELECT COUNT(*) AS total_users
    FROM users
  `);

  const [cars] = await pool.query(`
    SELECT
      COUNT(*) AS total_cars,
      SUM(status = 'Available') AS available_cars,
      SUM(status = 'Rented') AS rented_cars
    FROM cars
  `);

  const [mostRented] = await pool.query(`
    SELECT
      c.car_id,
      c.brand,
      c.model,
      c.registration_number,
      COUNT(
      CASE
        WHEN r.status <> 'Cancelled'
        THEN r.rental_id
      END
    ) AS rental_count
     
    FROM cars c
    LEFT JOIN rentals r
      ON c.car_id = r.car_id
    GROUP BY
      c.car_id,
      c.brand,
      c.model,
      c.registration_number
    ORDER BY rental_count DESC
    LIMIT 1
  `);

  const [rentals] = await pool.query(`
    SELECT
      COUNT(*) AS total_rentals,
      SUM(status = 'Pending') AS pending_rentals,
      SUM(status = 'Confirmed') AS confirmed_rentals,
      SUM(status = 'Active') AS active_rentals,
      SUM(status = 'Completed') AS completed_rentals,
      SUM(status = 'Cancelled') AS cancelled_rentals
    FROM rentals
  `);

  const [revenue] = await pool.query(`
    SELECT
      COALESCE(SUM(total_amount), 0) AS total_revenue
    FROM rentals
    WHERE status = 'Completed'
  `);

  const [bookedSlots] = await pool.query(`
    SELECT COUNT(*) AS booked_slots
    FROM rentals
    WHERE status IN ('Pending', 'Confirmed', 'Active')
  `);

  const [payments] = await pool.query(`
    SELECT
      COUNT(*) AS total_payments
    FROM payments
    WHERE payment_status = 'Completed'
  `);

  return {
    users: users[0],
    cars: cars[0],
    rentals: rentals[0],
    revenue: revenue[0],
    payments: payments[0],
    bookedSlots: Number(bookedSlots[0].booked_slots || 0),
    mostRentedCar: mostRented[0] || null,
  };
};

export const getRentalAnalytics = async () => {
  // Rentals grouped by status
  const [rentalsByStatus] = await pool.query(`
    SELECT
      status,
      COUNT(*) AS total
    FROM rentals
    GROUP BY status
  `);

  // Revenue by rental status
  const [revenueByStatus] = await pool.query(`
    SELECT
      status,
      COUNT(*) AS total_rentals,
      COALESCE(SUM(total_amount), 0) AS total_revenue
    FROM rentals
    GROUP BY status
  `);

  // Most rented cars
  const [popularCars] = await pool.query(`
    SELECT
      c.car_id,
      c.brand,
      c.model,
      c.registration_number,
      COUNT(r.rental_id) AS total_rentals,
      COALESCE(SUM(r.total_amount), 0) AS total_revenue

    FROM cars c

    LEFT JOIN rentals r
      ON c.car_id = r.car_id

    GROUP BY
      c.car_id,
      c.brand,
      c.model,
      c.registration_number

    ORDER BY total_rentals DESC
  `);

  // Revenue by payment method
  const [paymentMethods] = await pool.query(`
    SELECT
      payment_method,
      COUNT(*) AS total_payments,
      COALESCE(SUM(amount), 0) AS total_amount

    FROM payments
    WHERE payment_status = 'Completed'
    GROUP BY payment_method
    ORDER BY total_amount DESC
  `);

  return {
    rentals_by_status: rentalsByStatus,
    revenue_by_status: revenueByStatus,
    popular_cars: popularCars,
    payment_methods: paymentMethods,
  };
};
