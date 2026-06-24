-- PelliGallery PostgreSQL Database Schema
-- Database Name: pelligallery

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Gallery Categories Table
CREATE TABLE IF NOT EXISTS gallery_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL
);

-- 3. Gallery Images Table
CREATE TABLE IF NOT EXISTS gallery_images (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES gallery_categories(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  public_id VARCHAR(255) NOT NULL,
  title VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Packages Table
CREATE TABLE IF NOT EXISTS packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  inclusions TEXT[] NOT NULL,
  customization_options JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(100) NOT NULL,
  event_date DATE NOT NULL,
  event_location TEXT NOT NULL,
  special_requirements TEXT,
  total_price DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending', -- Pending, Confirmed, Cancelled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Booking Packages Table
CREATE TABLE IF NOT EXISTS booking_packages (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  package_id INTEGER REFERENCES packages(id) ON DELETE SET NULL,
  package_name VARCHAR(100) NOT NULL,
  package_price DECIMAL(12, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  selected_customizations JSONB DEFAULT '[]'::jsonb
);
