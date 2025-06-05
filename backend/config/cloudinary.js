const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.dawlnftzb,
  api_key: process.env.151985665339771,
  api_secret: process.env.huIjZRKHEQI9tcmxbXJvc9VS9PQ,
});

module.exports = cloudinary;
