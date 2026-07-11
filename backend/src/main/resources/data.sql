-- Seed data for Fashion E-Commerce Website

-- Insert Categories
INSERT INTO categories (name, description, slug) VALUES 
('Men', 'Premium clothing and apparel for men', 'men'),
('Women', 'Trendy and stylish clothing for women', 'women'),
('Accessories', 'Bags, watches, sunglasses and more', 'accessories'),
('Footwear', 'Sneakers, formal shoes, and boots', 'footwear');

-- Insert Brands
INSERT INTO brands (name, logo_url) VALUES 
('Zara', 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=200'),
('H&M', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=200'),
('Nike', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'),
('Adidas', 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=200');

-- Insert Users (Password: password123 for all seeded users)
-- Hash: $2a$10$qh/ask6/.1DMZNAl6.lpRe4kqqKTBLPe079iK4jMmpv4fPFx5muvG
INSERT INTO users (id, email, password, first_name, last_name, phone, role, enabled, agency_id) VALUES 
(1, 'admin@fashionstore.com', '$2a$10$qh/ask6/.1DMZNAl6.lpRe4kqqKTBLPe079iK4jMmpv4fPFx5muvG', 'Store', 'Admin', '+1234567890', 'ADMIN', true, NULL),
(2, 'customer@fashionstore.com', '$2a$10$qh/ask6/.1DMZNAl6.lpRe4kqqKTBLPe079iK4jMmpv4fPFx5muvG', 'John', 'Doe', '+1987654321', 'CUSTOMER', true, NULL),
(3, 'jane.smith@fashionstore.com', '$2a$10$qh/ask6/.1DMZNAl6.lpRe4kqqKTBLPe079iK4jMmpv4fPFx5muvG', 'Jane', 'Smith', '+1555555555', 'CUSTOMER', true, NULL),
(4, 'agency1@fashionstore.com', '$2a$10$qh/ask6/.1DMZNAl6.lpRe4kqqKTBLPe079iK4jMmpv4fPFx5muvG', 'Express', 'Agency', '+1777777777', 'AGENCY', true, NULL),
(5, 'delivery1@fashionstore.com', '$2a$10$qh/ask6/.1DMZNAl6.lpRe4kqqKTBLPe079iK4jMmpv4fPFx5muvG', 'Delivery1', 'Person', '+1555555555', 'DELIVERY_PERSON', true, 4),
(6, 'delivery@fashionstore.com', '$2a$10$qh/ask6/.1DMZNAl6.lpRe4kqqKTBLPe079iK4jMmpv4fPFx5muvG', 'Delivery', 'Person', '+1000000000', 'DELIVERY_PERSON', true, 4);

-- Insert Addresses
INSERT INTO addresses (user_id, street, city, state, zip_code, country, is_default) VALUES 
(2, '123 Fashion Ave', 'New York', 'NY', '10001', 'United States', true),
(2, '456 Trend Blvd', 'Brooklyn', 'NY', '11201', 'United States', false),
(3, '789 Couture Rd', 'Los Angeles', 'CA', '90001', 'United States', true);

-- Insert Products
INSERT INTO products (name, description, price, stock_quantity, category_id, brand_id, sku, image_url, active) VALUES 
('Classic Leather Jacket', 'Premium black leather jacket featuring silver hardware and a comfortable lining. Perfect for style and warmth.', 129.99, 15, 1, 1, 'M-JCK-LEA-001', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500', true),
('Slim Fit Denim Jeans', 'Classic blue slim fit jeans made of high-quality stretch denim. Comfortable for daily wear.', 49.99, 30, 1, 2, 'M-JNS-DEN-002', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', true),
('Floral Summer Dress', 'A beautiful, lightweight floral dress with adjustable straps and a flattering A-line silhouette.', 79.99, 20, 2, 2, 'W-DRS-FLR-003', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500', true),
('Casual Knit Sweater', 'Warm knit sweater in cream color. Relaxed fit, perfect for autumn and winter layers.', 59.99, 25, 2, 1, 'W-SWT-KNT-004', 'https://images.unsplash.com/photo-1608063615781-e2ef8c73d114?w=500', true),
('Air Max Sneakers', 'Comfortable athletic sneakers featuring transparent air cushion sole. High performance and fashion-forward.', 119.99, 10, 4, 3, 'F-SNK-AMX-005', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', true),
('Classic Running Shoes', 'Lightweight running shoes built for speed and endurance, featuring breathable mesh upper.', 89.99, 18, 4, 4, 'F-SHO-RUN-006', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500', true),
('Minimalist Silver Watch', 'Elegant analog watch with a stainless steel mesh strap and a minimalist black dial.', 149.99, 12, 3, 1, 'A-WTC-MIN-007', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', true),
('Classic Aviator Sunglasses', 'Polarized aviator sunglasses with gold frames and dark green lenses. 100% UV protection.', 35.00, 40, 3, 2, 'A-SUN-AVT-008', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', true);

-- Insert Product Additional Images
INSERT INTO product_images (product_id, image_url) VALUES 
(1, 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=500'),
(1, 'https://images.unsplash.com/photo-1481912284790-2568c3778e1e?w=500'),
(3, 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=500'),
(5, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500'),
(7, 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500');

-- Insert Coupons
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, expiry_date, active) VALUES 
('WELCOME10', 'PERCENTAGE', 10.00, 50.00, '2027-12-31', true),
('SAVE20', 'FLAT', 20.00, 100.00, '2027-12-31', true),
('FREESHIP', 'PERCENTAGE', 100.00, 20.00, '2027-12-31', false); -- Inactive coupon

-- Insert Reviews
INSERT INTO reviews (user_id, product_id, rating, comment) VALUES 
(2, 1, 5, 'Absolutely love this leather jacket! High quality material and fits perfectly.'),
(3, 1, 4, 'Very nice jacket, though a bit tight around the shoulders. Warm and stylish!'),
(2, 3, 5, 'Wore this to a summer wedding and got so many compliments. Highly recommended.'),
(3, 5, 4, 'Super comfortable shoes for running and daily errands. True to size.'),
(2, 7, 5, 'A beautiful timepiece that matches everything. Simple, clean, and classic.');

-- Insert default product sizes
INSERT INTO product_sizes (product_id, size) VALUES
(1, 'S'), (1, 'M'), (1, 'L'), (1, 'XL'),
(2, 'S'), (2, 'M'), (2, 'L'), (2, 'XL'),
(3, 'S'), (3, 'M'), (3, 'L'),
(4, 'S'), (4, 'M'), (4, 'L'),
(5, '8'), (5, '9'), (5, '10'), (5, '11'),
(6, '8'), (6, '9'), (6, '10'), (6, '11'),
(7, 'O/S'),
(8, 'O/S');

