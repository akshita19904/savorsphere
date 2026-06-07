// savorsphere/server/test-api.js
require('dotenv').config();
const axios = require('axios');

const API_URL = `http://localhost:${process.env.PORT || 5000}/api`;
let authToken = '';
let testUserId = null;
let testRestaurantId = 1;
let testReservationId = null;

async function testBasicRouting() {
    console.log('\n🔍 Testing basic routing...');
    try {
      const response = await axios.get(`${API_URL}/test`);
      console.log('Basic routing test:', response.data.message);
      return true;
    } catch (error) {
      console.error('Basic routing failed:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return false;
    }
  }
  

async function runTests() {
  console.log('Starting API tests...');
  
  try {
    const routingWorks = await testBasicRouting();
    if (!routingWorks) {
      throw new Error('Basic routing test failed - check server configuration');
    }

    // Health check
    await testHealthCheck();
    
    // Auth tests
    await testRegister();
    await testLogin();
    
    // Restaurant tests 
    await testGetRestaurants();
    await testGetRestaurantById(testRestaurantId);
    
    // Reservation tests (requires auth)
    await testCreateReservation();
    await testGetReservations();
    await testUpdateReservation();
    
    // Review tests (requires auth)
    await testCreateReview();
    await testGetReviews(testRestaurantId);
    
    // Cleanup
    await testDeleteReservation();
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

async function testHealthCheck() {
  console.log('\n🔍 Testing health check endpoint...');
  const response = await axios.get(`${API_URL}/health`);
  console.log('Health status:', response.data);
  return response.data;
}

async function testRegister() {
  console.log('\n🔍 Testing user registration...');
  const username = `testuser_${Date.now()}`;
  const email = `${username}@example.com`;
  
  try {
    const response = await axios.post(`${API_URL}/register`, {
      username,
      email,
      password: 'Password123!'
    });
    
    console.log('Registration successful:', response.data.message);
    authToken = response.data.token;
    testUserId = response.data.userId;
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.log('User already exists. Proceeding with login...');
      return await testLogin(email);
    }
    throw error;
  }
}

async function testLogin(email = null) {
  console.log('\n🔍 Testing user login...');
  const loginEmail = email || 'testuser@example.com';
  
  const response = await axios.post(`${API_URL}/login`, {
    email: loginEmail,
    password: 'Password123!'
  });
  
  console.log('Login successful:', response.data.message);
  authToken = response.data.token;
  testUserId = response.data.user.id;
  return response.data;
}

async function testGetRestaurants() {
  console.log('\n🔍 Testing get restaurants...');
  const response = await axios.get(`${API_URL}/restaurants`);
  
  console.log(`Retrieved ${response.data.length} restaurants`);
  if (response.data.length > 0) {
    console.log('First restaurant:', response.data[0].name);
  }
  return response.data;
}

async function testGetRestaurantById(id) {
  console.log(`\n🔍 Testing get restaurant by ID (${id})...`);
  const response = await axios.get(`${API_URL}/restaurants/${id}`);
  
  console.log('Restaurant details:', response.data.name);
  return response.data;
}

async function testCreateReservation() {
  console.log('\n🔍 Testing create reservation...');
  
  // Tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = tomorrow.toISOString().split('T')[0];
  
  const response = await axios.post(
    `${API_URL}/reservations`,
    {
      restaurant_id: testRestaurantId,
      date: date,
      time: '19:00:00',
      party_size: 2,
      special_request: 'Test reservation from API test'
    },
    {
      headers: { Authorization: `Bearer ${authToken}` }
    }
  );
  
  console.log('Reservation created:', response.data.message);
  testReservationId = response.data.reservation_id;
  return response.data;
}

async function testGetReservations() {
  console.log('\n🔍 Testing get user reservations...');
  
  const response = await axios.get(
    `${API_URL}/reservations`,
    {
      headers: { Authorization: `Bearer ${authToken}` }
    }
  );
  
  console.log(`Retrieved ${response.data.length} reservations`);
  if (response.data.length > 0) {
    const reservation = response.data[0];
    console.log(`Reservation at ${reservation.restaurant_name} on ${reservation.date} at ${reservation.time}`);
  }
  return response.data;
}

async function testUpdateReservation() {
  if (!testReservationId) {
    console.log('No reservation ID for update test. Skipping...');
    return;
  }
  
  console.log(`\n🔍 Testing update reservation (ID: ${testReservationId})...`);
  
  // Tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = tomorrow.toISOString().split('T')[0];
  
  const response = await axios.put(
    `${API_URL}/reservations/${testReservationId}`,
    {
      date: date,
      time: '20:00:00', // Changed time
      party_size: 4,     // Changed party size
      special_request: 'Updated test reservation',
      status: 'confirmed'
    },
    {
      headers: { Authorization: `Bearer ${authToken}` }
    }
  );
  
  console.log('Reservation updated:', response.data.message);
  return response.data;
}

async function testDeleteReservation() {
  if (!testReservationId) {
    console.log('No reservation ID for deletion test. Skipping...');
    return;
  }
  
  console.log(`\n🔍 Testing delete reservation (ID: ${testReservationId})...`);
  
  const response = await axios.delete(
    `${API_URL}/reservations/${testReservationId}`,
    {
      headers: { Authorization: `Bearer ${authToken}` }
    }
  );
  
  console.log('Reservation deleted:', response.data.message);
  return response.data;
}

// Update the testCreateReview function
async function testCreateReview() {
    console.log('\n🔍 Testing create review...');
    
    try {
      const response = await axios.post(
        `${API_URL}/reviews`,
        {
          restaurant_id: testRestaurantId,
          rating: 5,
          comment: 'Excellent service and food! Test review from API test.'
        },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      
      console.log('Review created:', response.data.message);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 409) {
        console.log('User has already reviewed this restaurant. Continuing tests...');
        return { message: 'User has already reviewed this restaurant' };
      }
      throw error;
    }
  }
  
  // Update the testGetReviews function
  async function testGetReviews(restaurantId) {
    console.log(`\n🔍 Testing get reviews for restaurant (ID: ${restaurantId})...`);
    
    const response = await axios.get(`${API_URL}/restaurants/${restaurantId}/reviews`);
    
    console.log(`Retrieved ${response.data.length} reviews`);
    if (response.data.length > 0) {
      console.log(`First review: ${response.data[0].rating} stars by ${response.data[0].username}`);
    }
    return response.data;
  }

// Install axios if needed
const installDependencies = async () => {
  const { execSync } = require('child_process');
  try {
    require.resolve('axios');
    console.log('Axios is already installed.');
  } catch (e) {
    console.log('Installing axios...');
    execSync('npm install axios');
    console.log('Axios installed successfully.');
  }
};

// Run the test script
(async () => {
  try {
    await installDependencies();
    await runTests();
  } catch (error) {
    console.error('Test script failed:', error);
  }
})();