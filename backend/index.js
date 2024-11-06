require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Ensure this path is correct
const connectDB = require('./config/db'); // Import the connectDB function

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON request bodies

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


 