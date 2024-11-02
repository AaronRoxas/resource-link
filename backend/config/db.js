const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://aaronroxas49:ZlUBfpxeO9qkgMTR@resourcelink.5iuii.mongodb.net/ResourceLink');
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
module.exports = connectDB;
