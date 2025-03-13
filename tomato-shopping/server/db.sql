-- Create Database
DROP DATABASE IF EXISTS SHOPPING;
CREATE DATABASE SHOPPING;
USE SHOPPING;

-- Create Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    isAdmin BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Insert admin and user
INSERT INTO users (email, password, isAdmin) VALUES
('admin@example.com', '$2b$12$1JNR0nXhymr5MIM2Vln69eUDjwxbggrcYAP3DI.LNYBMNDG1UWC9q', TRUE),
('user@example.com', '$2b$12$q8ql97OhwRzYGmrvwFID1ONm9bdNdiCKL5TFeRFXgTIp835xMYAC6', false);

-- Create sessions table for secure session management
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(128) NOT NULL,
    user_id INT NOT NULL,
    expires TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create csrf token table
CREATE TABLE csrf_tokens (
    token VARCHAR(128) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires TIMESTAMP NOT NULL,
    INDEX idx_expires (expires)
);

-- Create Categories Table
CREATE TABLE `categories` (
  `cateid` int NOT NULL AUTO_INCREMENT,
  `name` varchar(512) NOT NULL,
  PRIMARY KEY (`cateid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO categories (name) VALUES 
    ('All'),
    ('Electronics'),
    ('Home Appliances'),
    ('Clothing'),
    ('Shoes'),
    ('Bags'),
    ('Cosmetics'),
    ('Jewelry'),
    ('Baby Products'),
    ('Toys'),
    ('Books'),
    ('Office Supplies'),
    ('Sports Equipment'),
    ('Outdoor Gear'),
    ('Car Accessories'),
    ('Food'),
    ('Beverages'),
    ('Pet Supplies'),
    ('Furniture'),
    ('Home Improvement'),
    ('Health Products');
    
LOCK TABLES `categories` WRITE;
UNLOCK TABLES;

-- Create Products Table
CREATE TABLE `products` (
  `pid` int NOT NULL AUTO_INCREMENT,
  `cateid` int DEFAULT NULL,
  `name` varchar(512) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int DEFAULT NULL,
  `imageUrl` LONGTEXT NOT NULL,
  `description` text NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`pid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci AUTO_INCREMENT=1;

-- Electronics
INSERT INTO products SET 
    cateid = 1,
    name = 'Wireless Earbuds',
    price = 99.99,
    stock = 15,
    imageUrl = 'https://images.unsplash.com/photo-1590658006821-04f4008d5717',
    description = 'True wireless earbuds with noise cancellation';

INSERT INTO products SET 
    cateid = 1,
    name = 'Smartwatch',
    price = 199.99,
    stock = 10,
    imageUrl = 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg',
    description = 'Fitness tracker with heart rate monitoring';

-- Home Appliances
INSERT INTO products SET 
    cateid = 2,
    name = 'Air Purifier',
    price = 149.99,
    stock = 8,
    imageUrl = 'https://images.unsplash.com/photo-1617103996702-96ff29b1c467',
    description = 'HEPA air purifier for clean indoor air';

INSERT INTO products SET 
    cateid = 2,
    name = 'Blender',
    price = 79.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/4397919/pexels-photo-4397919.jpeg',
    description = 'High-speed blender for smoothies and soups';

-- Clothing
INSERT INTO products SET 
    cateid = 3,
    name = 'Men\'s Hoodie',
    price = 49.99,
    stock = 20,
    imageUrl = 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf',
    description = 'Soft and warm hoodie for men';

INSERT INTO products SET 
    cateid = 3,
    name = 'Women\'s Jacket',
    price = 89.99,
    stock = 15,
    imageUrl = 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg',
    description = 'Stylish jacket for women';

-- Shoes
INSERT INTO products SET 
    cateid = 4,
    name = 'Running Shoes',
    price = 89.99,
    stock = 10,
    imageUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    description = 'Lightweight running shoes for athletes';

INSERT INTO products SET 
    cateid = 4,
    name = 'Casual Sneakers',
    price = 59.99,
    stock = 18,
    imageUrl = 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
    description = 'Comfortable sneakers for everyday wear';

-- Bags
INSERT INTO products SET 
    cateid = 5,
    name = 'Leather Tote Bag',
    price = 129.99,
    stock = 12,
    imageUrl = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
    description = 'Elegant leather tote bag for women';

INSERT INTO products SET 
    cateid = 5,
    name = 'Backpack',
    price = 79.99,
    stock = 15,
    imageUrl = 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg',
    description = 'Durable backpack for travel and work';

-- Cosmetics
INSERT INTO products SET 
    cateid = 6,
    name = 'Lipstick Set',
    price = 29.99,
    stock = 25,
    imageUrl = 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137',
    description = 'Matte lipstick set in 6 shades';

INSERT INTO products SET 
    cateid = 6,
    name = 'Moisturizing Cream',
    price = 39.99,
    stock = 20,
    imageUrl = 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg',
    description = 'Hydrating cream for all skin types';

-- Jewelry
INSERT INTO products SET 
    cateid = 7,
    name = 'Gold Bracelet',
    price = 199.99,
    stock = 8,
    imageUrl = 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a',
    description = 'Elegant gold bracelet for women';

INSERT INTO products SET 
    cateid = 7,
    name = 'Silver Earrings',
    price = 89.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/965981/pexels-photo-965981.jpeg',
    description = 'Classic silver earrings for any occasion';

-- Baby Products
INSERT INTO products SET 
    cateid = 8,
    name = 'Baby Stroller',
    price = 199.99,
    stock = 10,
    imageUrl = 'https://images.unsplash.com/photo-1595578379391-648d4d962c8b',
    description = 'Lightweight and foldable baby stroller';

INSERT INTO products SET 
    cateid = 8,
    name = 'Baby Onesies',
    price = 19.99,
    stock = 30,
    imageUrl = 'https://images.pexels.com/photos-4599767/pexels-photo-4599767.jpeg',
    description = 'Soft and comfortable baby onesies';

-- Toys
INSERT INTO products SET 
    cateid = 9,
    name = 'Remote Control Car',
    price = 49.99,
    stock = 15,
    imageUrl = 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1',
    description = 'High-speed remote control car for kids';

INSERT INTO products SET 
    cateid = 9,
    name = 'Building Blocks',
    price = 29.99,
    stock = 20,
    imageUrl = 'https://images.pexels.com/photos/4700383/pexels-photo-4700383.jpeg',
    description = 'Creative building blocks for children';

-- Books
INSERT INTO products SET 
    cateid = 10,
    name = 'Bestseller Novel',
    price = 14.99,
    stock = 25,
    imageUrl = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
    description = 'Award-winning novel by a renowned author';

INSERT INTO products SET 
    cateid = 10,
    name = 'Cookbook',
    price = 24.99,
    stock = 15,
    imageUrl = 'https://images.pexels.com/photos/904616/pexels-photo-904616.jpeg',
    description = 'Collection of delicious recipes';

-- Office Supplies
INSERT INTO products SET 
    cateid = 11,
    name = 'Desk Organizer',
    price = 19.99,
    stock = 20,
    imageUrl = 'https://images.unsplash.com/photo-1505798577917-a65157d3320a',
    description = 'Compact organizer for desk essentials';

INSERT INTO products SET 
    cateid = 11,
    name = 'Notebook Set',
    price = 9.99,
    stock = 30,
    imageUrl = 'https://images.pexels.com/photos/590041/pexels-photo-590041.jpeg',
    description = 'High-quality notebooks for work and study';

-- Sports Equipment
INSERT INTO products SET 
    cateid = 12,
    name = 'Yoga Mat',
    price = 29.99,
    stock = 15,
    imageUrl = 'https://images.unsplash.com/photo-1576678927484-cc907957088c',
    description = 'Eco-friendly and non-slip yoga mat';

INSERT INTO products SET 
    cateid = 12,
    name = 'Dumbbell Set',
    price = 89.99,
    stock = 10,
    imageUrl = 'https://images.pexels.com/photos/221247/pexels-photo-221247.jpeg',
    description = 'Adjustable dumbbell set for home workouts';

-- Outdoor Gear
INSERT INTO products SET 
    cateid = 13,
    name = 'Camping Tent',
    price = 149.99,
    stock = 8,
    imageUrl = 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7',
    description = 'Waterproof and lightweight camping tent';

INSERT INTO products SET 
    cateid = 13,
    name = 'Hiking Backpack',
    price = 79.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/2668314/pexels-photo-2668314.jpeg',
    description = 'Durable backpack for outdoor adventures';

-- Car Accessories
INSERT INTO products SET 
    cateid = 14,
    name = 'Car Phone Holder',
    price = 19.99,
    stock = 25,
    imageUrl = 'https://images.unsplash.com/photo-1586232702172-fc3d81a97c6f',
    description = 'Adjustable phone holder for your car';

INSERT INTO products SET 
    cateid = 14,
    name = 'Car Seat Covers',
    price = 49.99,
    stock = 15,
    imageUrl = 'https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg',
    description = 'Comfortable and stylish car seat covers';