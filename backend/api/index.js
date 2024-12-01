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
const userRoutes = require('../routes/user');
const categoryRoutes = require('../routes/categories');
const withdrawalsRoutes = require('../routes/withdrawals');
const app = express();

// Add logging middleware BEFORE routes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
  origin: ["https://resource-link.vercel.app", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));

// Connect to database
connectDB()
  .catch(err => console.error('Database connection error:', err));

// Define a root route
app.get('/', (req, res) => {
  res.send(`API is working Server is running on port ${PORT}`);
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', recentActivitiesRoutes);
app.use('/api/item-tracking', itemTrackingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/borrowings', borrowingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/withdrawals', withdrawalsRoutes);
app.use('/api',userRoutes);
// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});