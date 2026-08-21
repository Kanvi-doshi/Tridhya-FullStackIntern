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
