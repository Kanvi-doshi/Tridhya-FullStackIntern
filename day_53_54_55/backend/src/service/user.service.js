import pool from "../components/config/db.js";

export const updateMyProfile = async (
  userId,
  { first_name, last_name, phone },
) => {
  const [result] = await pool.query(
    `
    UPDATE users
    SET
      first_name = ?,
      last_name = ?,
      phone = ?
    WHERE user_id = ?
    `,
    [first_name, last_name, phone || null, userId],
  );

  return result;
};
