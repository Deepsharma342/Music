import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/mongoDB.js';
import adminRoutes from './routes/adminRoutes.js'; // ✅ import, no require

// For __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadDir));
// Middlewares
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Routes
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Hello from server');
});

// Listen on 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
