require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const rateLimit = require('express-rate-limit');
let server;

const app = express();
const PORT = process.env.PORT || 5000;

const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'akshitasarda1909@gmail.com',
    pass: 'eywmpgddamoyvzjg'  // App password (spaces removed)
  }
});

// POST /api/forgot-password
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const [users] = await pool.query('SELECT id, username FROM users WHERE email = ?', [email.toLowerCase()]);

    // Always return success to prevent email enumeration
    if (users.length === 0) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const user = users[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate old tokens
    await pool.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [user.id]);

    // Store new token
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expiresAt]
    );

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    await transporter.sendMail({
      from: '"SavorSphere" <akshitasarda1909@gmail.com>',
      to: email,
      subject: 'Reset your SavorSphere password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f05545;">Reset Your Password</h2>
          <p>Hi ${user.username},</p>
          <p>We received a request to reset your password. Click the button below to choose a new one:</p>
          <a href="${resetLink}" style="
            display: inline-block; padding: 12px 24px;
            background: #f05545; color: white; text-decoration: none;
            border-radius: 6px; margin: 16px 0; font-weight: bold;
          ">Reset Password</a>
          <p style="color: #999; font-size: 13px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="color: #999; font-size: 12px;">SavorSphere — Discover Amazing Dining Experiences</p>
        </div>
      `
    });

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to send reset email', code: 'RESET_EMAIL_ERROR' });
  }
});

// POST /api/reset-password
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const [tokens] = await pool.query(
      'SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > NOW()',
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
    }

    const resetToken = tokens[0];
    const hashedPassword = await bcrypt.hash(password, 12);

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, resetToken.user_id]);
    await pool.query('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [resetToken.id]);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password', code: 'RESET_PASSWORD_ERROR' });
  }
});

// Enhanced rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later'
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({
  verify: (req, res, buf, encoding) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('Invalid JSON received:');
      console.error(buf.toString());
      res.status(400).json({
        error: 'Invalid JSON in request body',
        message: e.message,
        tip: 'Make sure you\'re sending proper JSON data.'
      });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ extended: true }));
app.use('/api/', apiLimiter);

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'savorsphere',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  timezone: '+00:00',
  dateStrings: true
});

// Database connection test
async function testDBConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.ping();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

// Auth middleware with enhanced logging
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    
    console.log('Auth attempt - token present:', !!token);
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log('Token verification failed:', err.message);
        return res.status(403).json({ 
          message: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        });
      }
      
      if (!decoded.id || !decoded.username || !decoded.email) {
        return res.status(403).json({
          message: 'Malformed token',
          code: 'MALFORMED_TOKEN'
        });
      }
      
      console.log('Auth successful for user:', decoded.username);
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      message: 'Server error during authentication',
      code: 'AUTH_ERROR'
    });
  }
};

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Input validation middleware
const validateRegisterInput = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ 
      message: 'Request body is empty or not properly formatted',
      code: 'EMPTY_REQUEST_BODY'
    });
  }

  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ 
      message: 'All fields are required',
      fields: { username: !username, email: !email, password: !password }
    });
  }
  
  if (password.length < 8) {
    return res.status(400).json({ 
      message: 'Password must be at least 8 characters long',
      code: 'PASSWORD_TOO_SHORT'
    });
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ 
      message: 'Invalid email format',
      code: 'INVALID_EMAIL'
    });
  }
  
  next();
};

// Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint is working', timestamp: new Date() });
});

// Added auth test endpoint
app.get('/api/auth-test', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Authentication successful',
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    }
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const [dbResult] = await pool.query('SELECT 1 as status');
    res.json({ 
      status: 'healthy',
      database: dbResult[0].status === 1 ? 'connected' : 'error',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [[user]] = await pool.query('SELECT id, username, email FROM users WHERE id = ?', [userId]);

    const [reservations] = await pool.query(
      `SELECT r.*, res.name AS restaurant_name
       FROM reservations r
       JOIN restaurants res ON r.restaurant_id = res.id
       WHERE r.user_id = ?
       ORDER BY r.date DESC`, [userId]);

    const [reviews] = await pool.query(
      `SELECT rv.*, res.name AS restaurant_name
       FROM reviews rv
       JOIN restaurants res ON rv.restaurant_id = res.id
       WHERE rv.user_id = ?
       ORDER BY rv.created_at DESC`, [userId]);

    const [likes] = await pool.query(
      `SELECT res.id, res.name
       FROM liked_restaurants l
       JOIN restaurants res ON l.restaurant_id = res.id
       WHERE l.user_id = ?`, [userId]);

    res.json({ user, reservations, reviews, likes });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      message: 'Server error while fetching user profile',
      code: 'USER_PROFILE_FETCH_ERROR'
    });
  }
});


// Auth routes
app.post('/api/register', validateRegisterInput, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const [existingUsers] = await pool.query(
      'SELECT 1 FROM users WHERE username = ? OR email = ? LIMIT 1',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ 
        message: 'Username or email already exists',
        code: 'USER_EXISTS'
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      const [result] = await connection.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
      );
      
      const token = jwt.sign(
        { 
          id: result.insertId, 
          username, 
          email,
          iat: Math.floor(Date.now() / 1000)
        },
        process.env.JWT_SECRET,
        { 
          expiresIn: '1h',
          algorithm: 'HS256'
        }
      );
      
      await connection.commit();
      res.status(201).json({ 
        message: 'User registered successfully',
        userId: result.insertId,
        token,
        user: { 
          id: result.insertId, 
          username, 
          email,
          createdAt: new Date().toISOString()
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration',
      code: 'REGISTRATION_ERROR'
    });
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again later'
});

app.post('/api/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required', code: 'MISSING_CREDENTIALS' });
    }
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, is_admin: user.is_admin || false },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username, is_admin: user.is_admin || false }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', code: 'LOGIN_ERROR' });
  }
});

// Restaurant routes
app.get('/api/restaurants', async (req, res) => {
  try {
    const { cuisine, price, rating, features, sort = 'rating' } = req.query;
    
    let query = 'SELECT * FROM restaurants WHERE 1=1';
    const queryParams = [];
    
    if (cuisine) {
      query += ' AND cuisine LIKE ?';
      queryParams.push(`%${cuisine}%`);
    }
    
    if (price) {
      query += ' AND price_range = ?';
      queryParams.push(price);
    }
    
    if (rating) {
      query += ' AND rating >= ?';
      queryParams.push(parseFloat(rating));
    }
    
    if (features) {
      const featuresList = features.split(',');
      featuresList.forEach(feature => {
        query += ` AND JSON_CONTAINS(features, '"true"', '$.${feature.trim()}')`;
      });
    }
    
    const validSorts = ['rating', 'distance', 'review_count', 'name'];
    const sortField = validSorts.includes(sort) ? sort : 'rating';
    const sortOrder = sortField === 'distance' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;
    
    const [restaurants] = await pool.query(query, queryParams);
    res.set('Cache-Control', 'public, max-age=300');
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ 
      message: 'Server error while fetching restaurants',
      code: 'RESTAURANTS_FETCH_ERROR'
    });
  }
});


// Get restaurants with coordinates for map
app.get('/api/restaurants/map', async (req, res) => {
  try {
    const [restaurants] = await pool.query(
      'SELECT id, name, latitude, longitude, image_url FROM restaurants'
    );
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching map data:', error);
    res.status(500).json({ 
      message: 'Server error while fetching map data',
      code: 'MAP_DATA_FETCH_ERROR'
    });
  }
});

// Update the existing restaurants endpoint to include coordinates
app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);
    
    if (isNaN(restaurantId)) {
      return res.status(400).json({ 
        message: 'Invalid restaurant ID',
        code: 'INVALID_RESTAURANT_ID'
      });
    }

    const [restaurants] = await pool.query(
      'SELECT *, ST_Y(location) AS latitude, ST_X(location) AS longitude FROM restaurants WHERE id = ?',
      [restaurantId]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({ 
        message: 'Restaurant not found',
        code: 'RESTAURANT_NOT_FOUND'
      });
    }

    res.json(restaurants[0]);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ 
      message: 'Server error while fetching restaurant',
      code: 'RESTAURANT_FETCH_ERROR'
    });
  }
});

// Updated restaurant reviews endpoint with better logging
app.get('/api/restaurants/:id/reviews', async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);
    
    if (isNaN(restaurantId)) {
      return res.status(400).json({ 
        message: 'Invalid restaurant ID',
        code: 'INVALID_RESTAURANT_ID'
      });
    }

    console.log(`Fetching reviews for restaurant ID: ${restaurantId}`);

    const [reviews] = await pool.query(
      `SELECT r.*, u.username 
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.restaurant_id = ?
       ORDER BY r.created_at DESC`,
      [restaurantId]
    );

    console.log(`Found ${reviews.length} reviews for restaurant ID: ${restaurantId}`);
    res.json(reviews);
  } catch (error) {
    console.error(`Error fetching reviews for restaurant ID ${req.params.id}:`, error);
    res.status(500).json({ 
      message: 'Server error while fetching reviews',
      code: 'REVIEWS_FETCH_ERROR'
    });
  }
});

// Updated review submission endpoint with better error handling
app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { restaurant_id, rating, comment } = req.body;
    const user_id = req.user.id;

    // Add more detailed logging
    console.log('Review submission attempt:', { 
      user_id, 
      restaurant_id, 
      rating, 
      comment: comment ? `${comment.substring(0, 20)}...` : 'none'
    });

    if (!restaurant_id || !rating) {
      console.log('Missing required fields for review');
      return res.status(400).json({ 
        message: 'Restaurant ID and rating are required',
        received: { restaurant_id: !!restaurant_id, rating: !!rating },
        code: 'MISSING_REVIEW_FIELDS'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: 'Rating must be between 1 and 5',
        code: 'INVALID_RATING'
      });
    }

    // Check if restaurant exists
    const [restaurants] = await pool.query(
      'SELECT id FROM restaurants WHERE id = ?',
      [restaurant_id]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({ 
        message: 'Restaurant not found',
        code: 'RESTAURANT_NOT_FOUND'
      });
    }

    // Check for duplicate review with more detailed error
    const [existingReviews] = await pool.query(
      'SELECT id FROM reviews WHERE user_id = ? AND restaurant_id = ?',
      [user_id, restaurant_id]
    );

    if (existingReviews.length > 0) {
      console.log(`User ${user_id} already reviewed restaurant ${restaurant_id}`);
      return res.status(409).json({ 
        message: 'You have already reviewed this restaurant',
        reviewId: existingReviews[0].id,
        code: 'DUPLICATE_REVIEW'
      });
    }

    // Insert review
    const [result] = await pool.query(
      'INSERT INTO reviews (user_id, restaurant_id, rating, comment) VALUES (?, ?, ?, ?)',
      [user_id, restaurant_id, rating, comment]
    );

    // Update restaurant rating stats
    await pool.query(
      `UPDATE restaurants 
       SET rating = (SELECT AVG(rating) FROM reviews WHERE restaurant_id = ?),
           review_count = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = ?)
       WHERE id = ?`,
      [restaurant_id, restaurant_id, restaurant_id]
    );

    console.log(`Review successfully created: ID ${result.insertId}`);
    res.status(201).json({
      message: 'Review created successfully',
      review_id: result.insertId
    });
  } catch (error) {
    console.error('Detailed error creating review:', error);
    res.status(500).json({ 
      message: 'Server error while creating review',
      code: 'REVIEW_CREATION_ERROR',
      details: error.message
    });
  }
});

// Modified general reviews listing - make it clear this is a global listing
app.get('/api/reviews', async (req, res) => {
  try {
    console.log('Fetching global reviews list - NOTE: This returns ALL reviews, not restaurant-specific');
    
    const [reviews] = await pool.query(
      'SELECT r.*, u.username, res.name as restaurant_name ' +
      'FROM reviews r ' +
      'JOIN users u ON r.user_id = u.id ' +
      'JOIN restaurants res ON r.restaurant_id = res.id ' +
      'ORDER BY r.created_at DESC LIMIT 50'
    );
    
    console.log(`Returning ${reviews.length} reviews from global list`);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching global reviews:', error);
    res.status(500).json({ 
      message: 'Server error while fetching reviews',
      code: 'REVIEWS_FETCH_ERROR'
    });
  }
});

app.get('/api/user/reviews', authenticateToken, async (req, res) => {
  try {
    const [reviews] = await pool.query(
      'SELECT * FROM reviews WHERE user_id = ?',
      [req.user.id]
    );
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      message: 'Server error while fetching user reviews',
      code: 'USER_REVIEWS_FETCH_ERROR'
    });
  }
});

// Reservation routes
app.post('/api/reservations', authenticateToken, async (req, res) => {
  try {
    const { restaurant_id, date, time, party_size, special_request, full_name, email, phone } = req.body;
    const user_id = req.user.id;
 
    if (!restaurant_id || !date || !time || !party_size) {
      return res.status(400).json({
        message: 'Required fields missing',
        code: 'MISSING_RESERVATION_FIELDS'
      });
    }
 
    const [restaurants] = await pool.query('SELECT * FROM restaurants WHERE id = ?', [restaurant_id]);
    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found', code: 'RESTAURANT_NOT_FOUND' });
    }
 
    const restaurant = restaurants[0];
 
    const [result] = await pool.query(
      `INSERT INTO reservations (user_id, restaurant_id, date, time, party_size, special_request, status)
       VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
      [user_id, restaurant_id, date, time, party_size, special_request]
    );
 
    // Format date nicely
    const formattedDate = new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
 
    // Format time nicely
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const formattedTime = `${displayHour}:${minutes} ${ampm}`;
 
    // Send confirmation email if email provided
    if (email) {
      try {
        await transporter.sendMail({
          from: '"SavorSphere" <akshitasarda1909@gmail.com>',
          to: email,
          subject: `Reservation Confirmed — ${restaurant.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
              <!-- Header -->
              <div style="background: #f05545; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">SavorSphere</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">Your table is booked!</p>
              </div>
 
              <!-- Body -->
              <div style="padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
                <h2 style="color: #333; margin-top: 0;">Reservation Confirmed ✅</h2>
                <p style="color: #555;">Hi ${full_name || req.user.username},</p>
                <p style="color: #555;">Your reservation at <strong>${restaurant.name}</strong> has been confirmed. Here are your details:</p>
 
                <!-- Details Box -->
                <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px 0; color: #888; font-size: 14px; width: 40%;">📍 Restaurant</td>
                      <td style="padding: 10px 0; color: #333; font-weight: bold;">${restaurant.name}</td>
                    </tr>
                    <tr style="border-top: 1px solid #eee;">
                      <td style="padding: 10px 0; color: #888; font-size: 14px;">📅 Date</td>
                      <td style="padding: 10px 0; color: #333; font-weight: bold;">${formattedDate}</td>
                    </tr>
                    <tr style="border-top: 1px solid #eee;">
                      <td style="padding: 10px 0; color: #888; font-size: 14px;">🕐 Time</td>
                      <td style="padding: 10px 0; color: #333; font-weight: bold;">${formattedTime}</td>
                    </tr>
                    <tr style="border-top: 1px solid #eee;">
                      <td style="padding: 10px 0; color: #888; font-size: 14px;">👥 Guests</td>
                      <td style="padding: 10px 0; color: #333; font-weight: bold;">${party_size} ${party_size == 1 ? 'person' : 'people'}</td>
                    </tr>
                    <tr style="border-top: 1px solid #eee;">
                      <td style="padding: 10px 0; color: #888; font-size: 14px;">📍 Address</td>
                      <td style="padding: 10px 0; color: #333;">${restaurant.address}, ${restaurant.city}</td>
                    </tr>
                    ${restaurant.phone ? `
                    <tr style="border-top: 1px solid #eee;">
                      <td style="padding: 10px 0; color: #888; font-size: 14px;">📞 Phone</td>
                      <td style="padding: 10px 0; color: #333;">${restaurant.phone}</td>
                    </tr>` : ''}
                    ${special_request ? `
                    <tr style="border-top: 1px solid #eee;">
                      <td style="padding: 10px 0; color: #888; font-size: 14px;">📝 Special Request</td>
                      <td style="padding: 10px 0; color: #333;">${special_request}</td>
                    </tr>` : ''}
                  </table>
                </div>
 
                <p style="color: #555; font-size: 14px;">
                  If you need to cancel or modify your reservation, please visit your 
                  <a href="http://localhost:3000/profile" style="color: #f05545;">profile page</a> 
                  or contact the restaurant directly.
                </p>
 
                <p style="color: #555;">We hope you enjoy your dining experience! 🍽️</p>
 
                <p style="color: #555; margin-bottom: 0;">Cheers,<br><strong>The SavorSphere Team</strong></p>
              </div>
 
              <!-- Footer -->
              <div style="text-align: center; padding: 20px; color: #aaa; font-size: 12px;">
                <p>© 2025 SavorSphere. All rights reserved.</p>
              </div>
            </div>
          `
        });
        console.log(`Confirmation email sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the reservation if email fails
      }
    }
 
    res.status(201).json({
      message: 'Reservation created successfully',
      reservation_id: result.insertId,
      restaurant: restaurant.name,
      date: formattedDate,
      time: formattedTime,
      party_size,
      email_sent: !!email
    });
 
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({
      message: 'Server error while creating reservation',
      code: 'RESERVATION_CREATION_ERROR'
    });
  }
});


app.get('/api/reservations', authenticateToken, async (req, res) => {
  try {
    const [reservations] = await pool.query(
      `SELECT r.*, res.name as restaurant_name, res.cuisine, res.price_range
       FROM reservations r
       JOIN restaurants res ON r.restaurant_id = res.id
       WHERE r.user_id = ?
       ORDER BY r.date DESC, r.time DESC`,
      [req.user.id]
    );

    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ 
      message: 'Server error while fetching reservations',
      code: 'RESERVATIONS_FETCH_ERROR'
    });
  }
});

app.put('/api/reservations/:id', authenticateToken, async (req, res) => {
  try {
    const reservationId = parseInt(req.params.id);
    const { date, time, party_size, special_request, status } = req.body;
    const user_id = req.user.id;

    if (isNaN(reservationId)) {
      return res.status(400).json({ 
        message: 'Invalid reservation ID',
        code: 'INVALID_RESERVATION_ID'
      });
    }

    const [reservations] = await pool.query(
      'SELECT id FROM reservations WHERE id = ? AND user_id = ?',
      [reservationId, user_id]
    );

    if (reservations.length === 0) {
      return res.status(404).json({ 
        message: 'Reservation not found',
        code: 'RESERVATION_NOT_FOUND'
      });
    }

    await pool.query(
      `UPDATE reservations 
       SET date = ?, time = ?, party_size = ?, special_request = ?, status = ?
       WHERE id = ?`,
      [date, time, party_size, special_request, status, reservationId]
    );

    res.json({ message: 'Reservation updated successfully' });
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ 
      message: 'Server error while updating reservation',
      code: 'RESERVATION_UPDATE_ERROR'
    });
  }
});

app.get('/api/restaurants/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, partySize } = req.query;
    
    // Validate inputs
    if (!date || !partySize) {
      return res.status(400).json({ 
        message: 'Date and partySize are required',
        code: 'MISSING_PARAMETERS'
      });
    }

    // Mock implementation - replace with your actual availability logic
    const availableTimes = ['18:00', '18:30', '19:00', '20:00'];
    const waitTime = partySize > 4 ? 30 : 15; // Example logic
    
    res.json({
      availableTimes,
      estimatedWaitTime: waitTime
    });
    
  } catch (error) {
    console.error('Availability error:', error);
    res.status(500).json({ 
      message: 'Error checking availability',
      code: 'AVAILABILITY_ERROR'
    });
  }
});

app.delete('/api/reservations/:id', authenticateToken, async (req, res) => {
  try {
    const reservationId = parseInt(req.params.id);
    const user_id = req.user.id;

    if (isNaN(reservationId)) {
      return res.status(400).json({ 
        message: 'Invalid reservation ID',
        code: 'INVALID_RESERVATION_ID'
      });
    }

    const [reservations] = await pool.query(
      'SELECT id FROM reservations WHERE id = ? AND user_id = ?',
      [reservationId, user_id]
    );

    if (reservations.length === 0) {
      return res.status(404).json({ 
        message: 'Reservation not found',
        code: 'RESERVATION_NOT_FOUND'
      });
    }

    await pool.query(
      'DELETE FROM reservations WHERE id = ?',
      [reservationId]
    );

    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ 
      message: 'Server error while deleting reservation',
      code: 'RESERVATION_DELETE_ERROR'
    });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const staticOptions = {
    maxAge: '1y',
    immutable: true,
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.set('Cache-Control', 'no-cache');
      }
    }
  };
  
  app.use(express.static(path.join(__dirname, '../client/build'), staticOptions));
  
  app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  
  const response = {
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  };
  
  if (process.env.NODE_ENV === 'development') {
    response.error = err.message;
    response.stack = err.stack;
  }
  
  res.status(500).json(response);
});

// Admin middleware
const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required', code: 'NOT_ADMIN' });
  }
  next();
};
 

 
// GET all restaurants (admin)
app.get('/api/admin/restaurants', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [restaurants] = await pool.query('SELECT * FROM restaurants ORDER BY id DESC');
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching restaurants' });
  }
});
 
// POST add restaurant (admin)
app.post('/api/admin/restaurants', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, cuisine, price_range, address, city, state, zipcode, phone, website, image_url, rating, features, distance, latitude, longitude } = req.body;
    if (!name || !cuisine || !price_range || !address) {
      return res.status(400).json({ message: 'Name, cuisine, price range and address are required' });
    }
    const [result] = await pool.query(
      `INSERT INTO restaurants (name, cuisine, price_range, address, city, state, zipcode, phone, website, image_url, rating, review_count, features, distance, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
      [name, cuisine, price_range, address, city || 'Bangalore', state || 'Karnataka', zipcode || '560001',
       phone || null, website || null, image_url || null, rating || 0,
       features ? JSON.stringify(features) : '{"takeout":false,"delivery":false,"reservations":true,"outdoor_seating":false}',
       distance || 0, latitude || null, longitude || null]
    );
    res.status(201).json({ message: 'Restaurant added', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding restaurant' });
  }
});
 
// PUT update restaurant (admin)
app.put('/api/admin/restaurants/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, cuisine, price_range, address, city, state, zipcode, phone, website, image_url, rating, distance, latitude, longitude } = req.body;
    await pool.query(
      `UPDATE restaurants SET name=?, cuisine=?, price_range=?, address=?, city=?, state=?, zipcode=?,
       phone=?, website=?, image_url=?, rating=?, distance=?, latitude=?, longitude=? WHERE id=?`,
      [name, cuisine, price_range, address, city, state, zipcode, phone, website, image_url, rating, distance, latitude, longitude, req.params.id]
    );
    res.json({ message: 'Restaurant updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating restaurant' });
  }
});
 
// DELETE restaurant (admin)
app.delete('/api/admin/restaurants/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM restaurants WHERE id = ?', [req.params.id]);
    res.json({ message: 'Restaurant deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting restaurant' });
  }
});
 
// GET all reservations (admin)
app.get('/api/admin/reservations', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [reservations] = await pool.query(
      `SELECT r.*, u.username, u.email as user_email, res.name as restaurant_name
       FROM reservations r
       JOIN users u ON r.user_id = u.id
       JOIN restaurants res ON r.restaurant_id = res.id
       ORDER BY r.date DESC, r.time DESC`
    );
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservations' });
  }
});
 
// GET all users (admin)
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, username, email, is_admin, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});
 

// Graceful shutdown
let isShuttingDown = false;

function gracefulShutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log('Shutting down gracefully...');
  
  if (!server) {
    console.log('Server not initialized, exiting immediately.');
    process.exit(0);
    return;
  }
  
  server.close(async () => {
    console.log('HTTP server closed');
    
    try {
      await pool.end();
      console.log('Database pool closed');
      process.exit(0);
    } catch (err) {
      console.error('Error closing database pool:', err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
async function startServer() {
  try {
    await testDBConnection();
    
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`Listening on port ${PORT}`);
      console.log(`Try these test endpoints:`);
      console.log(`- http://localhost:${PORT}/api/test`);
      console.log(`- http://localhost:${PORT}/api/health`);
    });
    
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });
    
    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
