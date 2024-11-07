const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://aaronroxas49:mgx6WF2ElZmBCR9l@resourcelink.5iuii.mongodb.net/?retryWrites=true&w=majority&appName=ResourceLink');
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
