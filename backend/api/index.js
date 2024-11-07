require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const authRoutes = require('../routes/auth'); // Ensure this path is correct
const connectDB = require('../config/db'); // Import the connectDB function

const app = express();
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? "https://resource-link.vercel.app"
  : ["https://resource-link.vercel.app", "http://localhost:3000"];

// Explicitly set CORS headers for all routes
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === 'https://resource-link.vercel.app' || origin === 'http://localhost:3000') {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }
  next();
});

app.use(express.json()); // Parse JSON request bodies
app.options('*', cors()); // Enable preflight for all routes
// Connect to the database
connectDB()
  .catch(err => console.error('Database connection error:', err));

// Define a root route
app.get('/', (req, res) => {
  res.send('API is working');
});

// Mount auth routes
app.use('/api/auth', authRoutes); 

// Improved error handling for undefined routes
app.use((req, res) => {
  res.status(404).send('Route not found');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


 