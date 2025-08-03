const jwt = require('jsonwebtoken');

// Use the same secret from .env
const JWT_SECRET = 'This-is-my-secrete-key';

// Create a token with the demo user info
const payload = {
  email: 'demo.user@gmail.com',
  userId: '6649c771-14d5-4a77-9058-d8502a90523c' // The user ID we found earlier
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '86400s' });

console.log('Generated token:', token);
console.log('\nTest with:');
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:8080/api/v1/trophies`);
