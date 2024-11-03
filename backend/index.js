require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Import your auth routes
const connectDB = require('./config/db'); // Import the connectDB function

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies
// Allow specific origin(s)
app.use(cors({
  origin: ['https://rlback.vercel.app/', 'https://resource-link.vercel.app']
}));

// Connect to the database
connectDB(); // Call the connectDB function

// Define a root route
app.get('/', (req, res) => {
  res.send('Welcome to the API!'); // You can customize this message
});

app.use('/api/auth', authRoutes); // Mount auth routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


 