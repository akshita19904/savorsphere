USE savor2004;

INSERT INTO restaurants (name, cuisine, price_range, address, city, state, zipcode, phone, website, image_url, rating, review_count, features, distance, latitude, longitude) VALUES
('Pind Balluchi', 'North Indian', '₹₹₹', 'UB City, Vittal Mallya Road', 'Bangalore', 'Karnataka', '560001', '080-45678901', 'https://www.pindballuchi.com', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800', 4.5, 320, '{"takeout": true, "delivery": true, "reservations": true, "outdoor_seating": true}', 1.20, 12.97160000, 77.59460000),
('Dum Pukht', 'North Indian', '₹₹₹₹', 'ITC Gardenia, Residency Road', 'Bangalore', 'Karnataka', '560025', '080-22119898', 'https://www.itchotels.com/dumpukht', 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800', 4.8, 512, '{"takeout": false, "delivery": false, "reservations": true, "outdoor_seating": false}', 1.10, 12.97580000, 77.60650000),
('Kebabs & Kurries', 'North Indian', '₹₹₹₹', 'ITC Windsor, Golf Course Road', 'Bangalore', 'Karnataka', '560052', '080-22269898', 'https://www.itchotels.com/kebabsandkurries', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800', 4.7, 845, '{"takeout": true, "delivery": true, "reservations": true, "outdoor_seating": true}', 0.90, 12.98900000, 77.57800000),
('Truffles', 'Continental', '₹₹', '36, St Marks Road', 'Bangalore', 'Karnataka', '560001', '080-41214242', 'https://www.trufflesrestaurant.in', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', 4.4, 1240, '{"takeout": true, "delivery": true, "reservations": false, "outdoor_seating": false}', 0.80, 12.97230000, 77.60130000),
('Brahmin Coffee Bar', 'South Indian', '₹', 'Sadashivanagar, Bangalore', 'Bangalore', 'Karnataka', '560080', '080-23610052', NULL, 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800', 4.6, 980, '{"takeout": true, "delivery": false, "reservations": false, "outdoor_seating": true}', 2.30, 13.00350000, 77.57220000),
('The Black Pearl', 'Seafood', '₹₹₹', '100 Feet Road, Indiranagar', 'Bangalore', 'Karnataka', '560038', '080-25209797', NULL, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', 4.3, 430, '{"takeout": false, "delivery": true, "reservations": true, "outdoor_seating": true}', 3.50, 12.97830000, 77.63870000),
('Koshy\'s', 'Continental', '₹₹', '39 St Marks Road', 'Bangalore', 'Karnataka', '560001', '080-22213793', NULL, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', 4.2, 760, '{"takeout": true, "delivery": false, "reservations": false, "outdoor_seating": true}', 0.90, 12.97210000, 77.60150000),
('Burma Burma', 'Burmese', '₹₹₹', 'UB City Mall, Vittal Mallya Road', 'Bangalore', 'Karnataka', '560001', '080-67185555', 'https://www.burmaburma.in', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800', 4.5, 590, '{"takeout": false, "delivery": false, "reservations": true, "outdoor_seating": false}', 1.30, 12.97130000, 77.59500000),
('Toit Brewpub', 'Continental', '₹₹₹', '298, Indiranagar 100ft Road', 'Bangalore', 'Karnataka', '560038', '080-43500900', 'https://www.toit.in', 'https://images.unsplash.com/photo-1575367439058-6096bb43d5d9?w=800', 4.6, 2100, '{"takeout": false, "delivery": false, "reservations": true, "outdoor_seating": true}', 3.80, 12.97920000, 77.64050000),
('CTR (Central Tiffin Room)', 'South Indian', '₹', '7th Cross, Margosa Road, Malleswaram', 'Bangalore', 'Karnataka', '560003', NULL, NULL, 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800', 4.7, 1560, '{"takeout": true, "delivery": false, "reservations": false, "outdoor_seating": false}', 4.20, 13.00200000, 77.57150000),
('Vidyarthi Bhavan', 'South Indian', '₹', 'Gandhi Bazaar, Basavanagudi', 'Bangalore', 'Karnataka', '560004', '080-26677588', NULL, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800', 4.8, 2340, '{"takeout": true, "delivery": false, "reservations": false, "outdoor_seating": false}', 5.10, 12.94550000, 77.57400000),
('The Only Place', 'American', '₹₹', '13 Museum Road', 'Bangalore', 'Karnataka', '560001', '080-25584466', NULL, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800', 4.3, 670, '{"takeout": true, "delivery": true, "reservations": false, "outdoor_seating": false}', 1.00, 12.97380000, 77.60080000),
('Karavalli', 'Coastal', '₹₹₹₹', 'The Gateway Hotel, 66 Residency Road', 'Bangalore', 'Karnataka', '560025', '080-66604545', 'https://www.tajhotels.com/karavalli', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', 4.7, 890, '{"takeout": false, "delivery": false, "reservations": true, "outdoor_seating": true}', 1.40, 12.97490000, 77.60580000),
('Social Indiranagar', 'Continental', '₹₹', '46/1, Indiranagar 100 Feet Road', 'Bangalore', 'Karnataka', '560038', '080-45001555', 'https://www.socialoffline.in', 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800', 4.2, 1890, '{"takeout": false, "delivery": true, "reservations": true, "outdoor_seating": true}', 3.60, 12.97810000, 77.63920000),
('Jamavar', 'North Indian', '₹₹₹₹', 'The Leela Palace, Airport Road', 'Bangalore', 'Karnataka', '560008', '080-25211234', 'https://www.theleela.com/jamavar', 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800', 4.9, 430, '{"takeout": false, "delivery": false, "reservations": true, "outdoor_seating": true}', 6.20, 12.99450000, 77.65800000);

INSERT INTO users (username, email, password) VALUES
('johndoe', 'john@example.com', '$2b$10$KIYfGLotuGO5nDn4G3VKVeqtg4JPVX7JDgeBJsU3oRzPHAw0ULnbm'),
('janedoe', 'jane@example.com', '$2b$10$KIYfGLotuGO5nDn4G3VKVeqtg4JPVX7JDgeBJsU3oRzPHAw0ULnbm'),
('bobsmith', 'bob@example.com', '$2b$10$KIYfGLotuGO5nDn4G3VKVeqtg4JPVX7JDgeBJsU3oRzPHAw0ULnbm');

INSERT INTO reservations (user_id, restaurant_id, date, time, party_size, status) VALUES
(1, 2, '2025-04-15', '19:00:00', 2, 'confirmed'),
(1, 5, '2025-04-20', '20:00:00', 4, 'pending'),
(2, 1, '2025-04-18', '18:30:00', 3, 'confirmed'),
(3, 3, '2025-04-25', '12:00:00', 5, 'confirmed');

INSERT INTO reviews (user_id, restaurant_id, rating, comment) VALUES
(1, 1, 5, 'Best dal makhani I have ever had outside of Delhi!'),
(2, 1, 4, 'Authentic North Indian flavors, loved the butter chicken!'),
(3, 1, 3, 'Good food but the service could be faster during peak hours'),
(1, 2, 5, 'Their kebabs melt in your mouth - perfection!'),
(2, 2, 4, 'Elegant ambiance and exquisite Mughlai cuisine'),
(3, 2, 5, 'The biryani is to die for! Worth every penny.'),
(1, 3, 4, 'Excellent variety of kebabs, good wine pairing suggestions'),
(2, 3, 5, 'The galouti kebab is heavenly! Must try'),
(1, 4, 5, 'Best burgers in Bangalore, period!'),
(2, 4, 4, 'Great food and lively atmosphere'),
(3, 5, 5, 'Idlis so soft they melt in your mouth'),
(1, 6, 4, 'Fresh seafood, great coastal vibes'),
(2, 7, 4, 'Old Bangalore charm, great food'),
(3, 8, 5, 'Unique Burmese cuisine, a hidden gem'),
(1, 9, 5, 'Best craft beer in the city!'),
(2, 10, 5, 'Dosas here are legendary, been coming for years'),
(3, 11, 5, 'A Bangalore institution, always reliable'),
(1, 12, 4, 'Classic steakhouse done right'),
(2, 13, 5, 'Finest coastal cuisine in Bangalore'),
(3, 14, 4, 'Great ambiance, good cocktails'),
(1, 15, 5, 'Royal dining experience, worth every rupee');