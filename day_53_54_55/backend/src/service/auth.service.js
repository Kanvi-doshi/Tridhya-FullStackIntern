import pool from "../components/config/db.js";

export const findUserByEmail = async (email) => {
  const [users] = await pool.query(
    `SELECT 
      u.user_id,
      u.role_id,
      u.first_name,
      u.last_name,
      u.email,
      u.password,
      u.phone,
      r.role_name
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    WHERE u.email = ?`,
    [email],
  );

  return users[0];
};

export const findCustomerRole = async () => {
  const [roles] = await pool.query(
    "SELECT role_id FROM roles WHERE role_name = ?",
    ["Customer"],
  );

  return roles[0];
};

export const createUser = async ({
  role_id,
  first_name,
  last_name,
  email,
  password,
  phone,
}) => {
  const [result] = await pool.query(
    `INSERT INTO users
    (role_id, first_name, last_name, email, password, phone)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [role_id, first_name, last_name, email, password, phone || null],
  );

  return result.insertId;
};
