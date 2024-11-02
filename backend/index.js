require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Import your auth routes
const connectDB = require('./config/db'); // Import the connectDB function

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies

// Connect to the database
connectDB(); // Call the connectDB function

// Define a root route
app.get('/', (req, res) => {
  res.send('Welcome to the API!'); // You can customize this message
});

app.use('/api/auth', authRoutes); // Mount auth routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on https://resource-link-99pdn276e-aaronroxas-projects.vercel.app/${PORT}`);
});

// Export the app for Vercel
module.exports = app;

// Start the server (for local testing)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on https://resource-link-99pdn276e-aaronroxas-projects.vercel.app/${PORT}`);
  });
}


 