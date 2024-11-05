require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const authRoutes = require('../routes/auth'); // Ensure this path is correct
const connectDB = require('../config/db'); // Import the connectDB function

const app = express();
app.use(cors({
  origin: ["https://resource-link.vercel.app/", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(function (req, res, next) {
  //Enabling CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
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


 