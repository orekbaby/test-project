const express = require("express");
const cookieParser = require("cookie-parser"); 
const dotenv = require("dotenv");
dotenv.config();

console.log('Loading app.js...');

// Test each import individually
console.log('Testing middlewares import...');
try {
  const { handle404Error, handleGlobalError } = require("./middlewares");
  console.log('✅ Middlewares loaded successfully');
} catch (error) {
  console.error('❌ Error loading middlewares:', error.message);
}

console.log('Testing CORS config import...');
try {
  const { cors } = require("./config");
  console.log('✅ CORS config loaded successfully');
} catch (error) {
  console.error('❌ Error loading CORS config:', error.message);
}

console.log('Testing routes import...');
try {
  const { v1Routes } = require("./routes/v1");
  console.log('✅ Routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
}

const app = express();

console.log('Basic app created');

app.use(express.json());

console.log('JSON middleware added');

// Basic error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

console.log('App setup complete');

module.exports = { app };