-- Create Database
CREATE DATABASE IF NOT EXISTS SHOPPING;
USE SHOPPING;

-- Create Categories Table
DROP TABLE IF EXISTS `categories`;
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
DROP TABLE IF EXISTS `products`;
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
    name = 'Professional DSLR Camera',
    price = 1299.99,
    stock = 12,
    imageUrl = 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39',
    description = 'High-end digital camera with 24.2MP sensor, 4K video recording, and advanced autofocus system';

INSERT INTO products SET 
    cateid = 1,
    name = 'Wireless Noise-Cancelling Headphones',
    price = 299.99,
    stock = 12,
    imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    description = 'Premium wireless headphones with active noise cancellation and 30-hour battery life';

INSERT INTO products SET 
    cateid = 1,
    name = 'Smartphone with 128GB Storage',
    price = 699.99,
    stock = 12,
    imageUrl = 'https://images.unsplash.com/photo-1598327105666-5b89351aff97',
    description = 'Latest smartphone with 6.5-inch display and triple camera setup';

-- Home Appliances
INSERT INTO products SET 
    cateid = 2,
    name = 'Smart Refrigerator',
    price = 1499.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/2635038/pexels-photo-2635038.jpeg',
    description = 'Energy-efficient refrigerator with Wi-Fi connectivity and touchscreen display';

INSERT INTO products SET 
    cateid = 2,
    name = 'Robot Vacuum Cleaner',
    price = 399.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/5083408/pexels-photo-5083408.jpeg',
    description = 'Automatic vacuum cleaner with smart mapping and app control';

-- Clothing
INSERT INTO products SET 
    cateid = 3,
    name = 'Men\'s Casual Shirt',
    price = 49.99,
    stock = 12,
    imageUrl = 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990',
    description = 'Comfortable cotton shirt for casual wear';

INSERT INTO products SET 
    cateid = 3,
    name = 'Women\'s Summer Dress',
    price = 79.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg',
    description = 'Lightweight and breathable dress for summer';

-- Shoes
INSERT INTO products SET 
    cateid = 4,
    name = 'Running Shoes',
    price = 89.99,
    stock = 12,
    imageUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    description = 'High-performance running shoes with cushioned soles';

INSERT INTO products SET 
    cateid = 4,
    name = 'Men\'s Leather Boots',
    price = 129.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/19090/pexels-photo.jpg',
    description = 'Durable leather boots for outdoor activities';

-- Bags
INSERT INTO products SET 
    cateid = 5,
    name = 'Leather Backpack',
    price = 99.99,
    stock = 12,
    imageUrl = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
    description = 'Stylish and functional leather backpack';

INSERT INTO products SET 
    cateid = 5,
    name = 'Travel Duffel Bag',
    price = 69.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg',
    description = 'Spacious duffel bag for travel and gym';

-- Cosmetics
INSERT INTO products SET 
    cateid = 6,
    name = 'Matte Lipstick Set',
    price = 29.99,
    stock = 12,
    imageUrl = 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137',
    description = 'Long-lasting matte lipstick in 6 shades';

INSERT INTO products SET 
    cateid = 6,
    name = 'Anti-Aging Cream',
    price = 59.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg',
    description = 'Moisturizing cream with anti-aging properties';

-- Jewelry
INSERT INTO products SET 
    cateid = 7,
    name = 'Silver Necklace',
    price = 89.99,
    stock = 12,
    imageUrl = 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a',
    description = 'Elegant silver necklace with pendant';

INSERT INTO products SET 
    cateid = 7,
    name = 'Gold Earrings',
    price = 129.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/965981/pexels-photo-965981.jpeg',
    description = 'Classic gold earrings for any occasion';

-- Baby Products
INSERT INTO products SET 
    cateid = 8,
    name = 'Baby Stroller',
    price = 199.99,
    stock = 12,
    imageUrl = 'https://images.unsplash.com/photo-1595578379391-648d4d962c8b',
    description = 'Lightweight and foldable baby stroller';

INSERT INTO products SET 
    cateid = 8,
    name = 'Baby Onesies Pack',
    price = 39.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/4599767/pexels-photo-4599767.jpeg',
    description = 'Soft and comfortable baby onesies in a pack of 5';

-- Toys
INSERT INTO products SET 
    cateid = 9,
    name = 'Remote Control Car',
    price = 49.99,
    stock = 12,
    imageUrl = 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1',
    description = 'High-speed remote control car for kids';

INSERT INTO products SET 
    cateid = 9,
    name = 'Building Blocks Set',
    price = 29.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/4700383/pexels-photo-4700383.jpeg',
    description = 'Creative building blocks for children';

-- Books
INSERT INTO products SET 
    cateid = 10,
    name = 'Bestseller Novel',
    price = 19.99,
    stock = 12,
    imageUrl = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
    description = 'Award-winning novel by a renowned author';

INSERT INTO products SET 
    cateid = 10,
    name = 'Cookbook',
    price = 24.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/904616/pexels-photo-904616.jpeg',
    description = 'Collection of delicious recipes from around the world';

-- Office Supplies
INSERT INTO products SET 
    cateid = 11,
    name = 'Ergonomic Office Chair',
    price = 199.99,
    stock = 12,
    imageUrl = 'https://images.unsplash.com/photo-1505798577917-a65157d3320a',
    description = 'Comfortable and adjustable office chair';

INSERT INTO products SET 
    cateid = 11,
    name = 'Desk Organizer',
    price = 29.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/590041/pexels-photo-590041.jpeg',
    description = 'Compact organizer for your desk essentials';

-- Sports Equipment
INSERT INTO products SET 
    cateid = 12,
    name = 'Yoga Mat',
    price = 39.99,
    stock = 12,
    imageUrl = 'https://images.unsplash.com/photo-1576678927484-cc907957088c',
    description = 'Eco-friendly and non-slip yoga mat';

INSERT INTO products SET 
    cateid = 12,
    name = 'Dumbbell Set',
    price = 89.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/221247/pexels-photo-221247.jpeg',
    description = 'Adjustable dumbbell set for home workouts';

-- Outdoor Gear
INSERT INTO products SET 
    cateid = 13,
    name = 'Camping Tent',
    price = 149.99,
    stock = 12,
    imageUrl = 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7',
    description = 'Waterproof and lightweight camping tent';

INSERT INTO products SET 
    cateid = 13,
    name = 'Hiking Backpack',
    price = 79.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/2668314/pexels-photo-2668314.jpeg',
    description = 'Durable backpack for hiking and outdoor adventures';

-- Car Accessories
INSERT INTO products SET 
    cateid = 14,
    name = 'Car Phone Holder',
    price = 19.99,
    stock = 12,
    imageUrl = 'https://images.unsplash.com/photo-1586232702172-fc3d81a97c6f',
    description = 'Adjustable phone holder for your car';

INSERT INTO products SET 
    cateid = 14,
    name = 'Car Seat Covers',
    price = 49.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg',
    description = 'Comfortable and stylish car seat covers';

-- Food
INSERT INTO products SET 
    cateid = 15,
    name = 'Organic Honey',
    price = 14.99,
    stock = 12,
    imageUrl = 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
    description = 'Pure organic honey from local farms';

INSERT INTO products SET 
    cateid = 15,
    name = 'Gourmet Coffee Beans',
    price = 24.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg',
    description = 'Premium coffee beans for a rich flavor';

-- Beverages
INSERT INTO products SET 
    cateid = 16,
    name = 'Sparkling Water',
    price = 9.99,
    stock = 12,
    imageUrl = 'https://images.unsplash.com/photo-1554866585-cd94860890b7',
    description = 'Refreshing sparkling water in assorted flavors';

INSERT INTO products SET 
    cateid = 16,
    name = 'Energy Drink',
    price = 2.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg',
    description = 'High-energy drink for an instant boost';

-- Pet Supplies
INSERT INTO products SET 
    cateid = 17,
    name = 'Dog Food',
    price = 29.99,
    stock = 12,
    imageUrl = 'https://images.unsplash.com/photo-1589923188900-85dae523342b',
    description = 'Nutritious and delicious dog food';

INSERT INTO products SET 
    cateid = 17,
    name = 'Cat Litter',
    price = 19.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/4587993/pexels-photo-4587993.jpeg',
    description = 'Odor-control cat litter for a clean home';

-- Furniture
INSERT INTO products SET 
    cateid = 18,
    name = 'Modern Sofa',
    price = 799.99,
    stock = 12,
    imageUrl = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
    description = 'Stylish and comfortable modern sofa';

INSERT INTO products SET 
    cateid = 18,
    name = 'Wooden Dining Table',
    price = 499.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
    description = 'Elegant wooden dining table for your home';

-- Home Improvement
INSERT INTO products SET 
    cateid = 19,
    name = 'Power Drill',
    price = 89.99,
    stock = 12,
    imageUrl = 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e',
    description = 'Cordless power drill for DIY projects';

INSERT INTO products SET 
    cateid = 19,
    name = 'Paint Roller Set',
    price = 14.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg',
    description = 'Complete paint roller set for home improvement';

-- Health Products
INSERT INTO products SET 
    cateid = 20,
    name = 'Vitamin C Supplements',
    price = 19.99,
    stock = 12,
    imageUrl = 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375',
    description = 'Immune-boosting vitamin C supplements';

INSERT INTO products SET 
    cateid = 20,
    name = 'Foam Roller',
    price = 29.99,
    stock = 12,
    imageUrl = 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg',
    description = 'Foam roller for muscle recovery and relaxation';

