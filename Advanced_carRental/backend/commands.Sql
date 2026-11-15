-- creating Indexes
-- INDEXING & OPTIMIZATION

-- 1. CHECK EXISTING INDEXES

SHOW INDEX FROM users;
SHOW INDEX FROM roles;
SHOW INDEX FROM cars;
SHOW INDEX FROM rentals;

-- 2. CREATE INDEXES

CREATE INDEX idx_users_role_id
ON users(role_id);

CREATE INDEX idx_cars_status
ON cars(status);

CREATE INDEX idx_rentals_user_id
ON rentals(user_id);

CREATE INDEX idx_rentals_car_id
ON rentals(car_id);

CREATE INDEX idx_rentals_availability
ON rentals(car_id, status, start_date, end_date);

-- 3. CHECK AVAILABLE CARS

EXPLAIN
SELECT
    car_id,
    brand,
    model,
    year,
    color,
    daily_rate
FROM cars
WHERE status = 'Available';

-- 4. CHECK RENTAL AVAILABILITY

EXPLAIN
SELECT rental_id
FROM rentals
WHERE car_id = 1
  AND status IN ('Pending', 'Confirmed', 'Active')
  AND start_date <= '2026-08-28'
  AND end_date >= '2026-08-25';

-- 5. USER RENTAL HISTORY

EXPLAIN
SELECT
    r.rental_id,
    r.start_date,
    r.end_date,
    r.total_amount,
    r.status
FROM rentals r
WHERE r.user_id = 1
ORDER BY r.created_at DESC;

-- 6. RENTAL + USER + CAR JOIN

EXPLAIN
SELECT
    r.rental_id,
    u.first_name,
    u.last_name,
    u.email,
    c.brand,
    c.model,
    r.start_date,
    r.end_date,
    r.total_amount,
    r.status
FROM rentals r
JOIN users u
    ON r.user_id = u.user_id
JOIN cars c
    ON r.car_id = c.car_id
ORDER BY r.created_at DESC;

-- 7. ADMIN USERS

EXPLAIN
SELECT
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    r.role_name
FROM users u
JOIN roles r
    ON u.role_id = r.role_id
WHERE u.role_id = 3
ORDER BY u.created_at DESC;