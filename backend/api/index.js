require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('../routes/auth'); 
const connectDB = require('../config/db'); 
const recentActivitiesRoutes = require('../routes/activities');
const itemTrackingRoutes = require('../routes/itemTracking');
const inventoryRoutes = require('../routes/inventory');
const itemRoutes = require('../routes/items');
const borrowingsRoutes = require('../routes/borrowings');

const app = express();
app.use(cors({
  origin: ["https://resource-link.vercel.app", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json()); // Parse JSON request bodies

connectDB()
  .catch(err => console.error('Database connection error:', err));

// Define a root route
app.get('/', (req, res) => {
  res.send('API is working');
});

// Mount auth routes
app.use('/api/auth', authRoutes); 

// Mount recent activities and item tracking routes
app.use('/api/activities', recentActivitiesRoutes);
app.use('/api/item-tracking', itemTrackingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/borrowings', borrowingsRoutes);
app.use('/', inventoryRoutes);

// Improved error handling for undefined routes
app.use((req, res) => {
  res.status(404).send('Route not found');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


 