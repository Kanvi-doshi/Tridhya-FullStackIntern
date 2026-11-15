CREATE TABLE roles (
  role_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
  user_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  role_id    INT NOT NULL REFERENCES roles(role_id),
  first_name VARCHAR(50)  NOT NULL,
  last_name  VARCHAR(50)  NOT NULL,
  email      VARCHAR(100) NOT NULL,
  password   VARCHAR(255) NOT NULL,
  phone      VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uq_users_email_lower ON users (LOWER(email));

CREATE TABLE cars (
  car_id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  brand               VARCHAR(50) NOT NULL,
  model               VARCHAR(50) NOT NULL,
  year                INT NOT NULL,
  registration_number VARCHAR(50) NOT NULL UNIQUE,
  color               VARCHAR(30),
  daily_rate          NUMERIC(10,2) NOT NULL CHECK (daily_rate > 0),
  status              VARCHAR(20) NOT NULL DEFAULT 'Available'
                      CHECK (status IN ('Available','Rented','Maintenance')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rentals (
  rental_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      INT NOT NULL REFERENCES users(user_id),
  car_id       INT NOT NULL REFERENCES cars(car_id),
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'Pending'
               CHECK (status IN ('Pending','Confirmed','Active','Completed','Cancelled')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date > start_date)
);

CREATE TABLE payments (
  payment_id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  rental_id      INT NOT NULL UNIQUE REFERENCES rentals(rental_id),
  amount         NUMERIC(10,2) NOT NULL,
  payment_method VARCHAR(10) NOT NULL CHECK (payment_method IN ('Cash','Card','UPI')),
  payment_status VARCHAR(10) NOT NULL DEFAULT 'Pending'
                 CHECK (payment_status IN ('Pending','Completed','Failed')),
  paid_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role_id        ON users(role_id);
CREATE INDEX idx_cars_status          ON cars(status);
CREATE INDEX idx_rentals_user_id      ON rentals(user_id);
CREATE INDEX idx_rentals_car_id       ON rentals(car_id);
CREATE INDEX idx_rentals_availability ON rentals(car_id, status, start_date, end_date);