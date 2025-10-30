import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import cloudinary from './utils/cloudinary.js';
import authRouetes from "./routes/authRoutes.js";
import incomeRoutes from "./routes/incomeRoute.js";
import expenseRoutes from "./routes/expenseRoute.js";
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();

// ✅ Define PORT properly
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ✅ Routes
app.use('/api/auth', authRouetes);
app.use('/api/income', incomeRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.send('✅ Expense Tracker API is running');
});

// ✅ MongoDB connect
connectDB();

// ✅ Export for Vercel
export default app;

// ✅ Local run
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`✅ Server running locally on http://localhost:${PORT}`);
  });
}
