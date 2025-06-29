import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dawlnftzb',
  api_key: process.env.CLOUDINARY_API_KEY || '689227263225288',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'zAGbS5plAwvL66bgnlT513cRMLU',
  secure: true
});


export default cloudinary;
