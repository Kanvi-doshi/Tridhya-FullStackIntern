import pool from "../components/config/db.js";

export const getAllCars = async ({
  page,
  limit,
  search,
  brand,
  status,
  minPrice,
  maxPrice,
  sort,
}) => {
  let query = `SELECT * FROM cars WHERE 1=1`;
  let countQuery = `SELECT COUNT (*) AS total FROM cars WHERE 1=1`;
  const values = [];
  const countValues = [];

  if (search) {
    query += `AND ( brand LIKE ? OR model LIKE? OR registration_number LIKE?)`;
    countQuery += `AND ( brand LIKE ? OR model LIKE? OR registration_number LIKE?) `;
    const keyword = `%${search}%`;

    values.push(keyword, keyword, keyword);
    countValues.push(keyword, keyword, keyword);
  }
  if (brand) {
    query += `AND brand = ?`;
    countQuery += `AND brand =?`;
    values.push(brand);
    countValues.push(brand);
  }
  if (status) {
    query += `AND status = ?`;
    countQuery += `AND status =?`;
    values.push(status);
    countValues.push(status);
  }
  if (minPrice) {
    query += ` AND daily_rate >= ?`;
    countQuery += ` AND daily_rate >= ?`;

    values.push(minPrice);
    countValues.push(minPrice);
  }

  if (maxPrice) {
    query += ` AND daily_rate <= ?`;
    countQuery += ` AND daily_rate <= ?`;

    values.push(maxPrice);
    countValues.push(maxPrice);
  }
  const sortOptions = {
    price_asc: "daily_rate ASC",
    price_desc: "daily_rate DESC",
    brand_asc: "brand ASC",
    brand_desc: "brand DESC",
    year_asc: "year ASC",
    year_desc: "year DESC",
  };

  query += ` ORDER BY ${sortOptions[sort] || "created_at DESC"}`;

  const offset = (page - 1) * limit;
  query += ` LIMIT ? OFFSET ?`;
  values.push(limit, offset);

  const [cars] = await pool.query(query, values);
  const [[{ total }]] = await pool.query(countQuery, countValues);

  return {
    cars,
    pagination: {
      page,
      limit,
      totalCars: total,
      totalPages: Math.ceil(total / limit),
    },
  };
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
