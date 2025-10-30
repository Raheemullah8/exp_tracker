import express from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import { getDashboardData } from '../controllers/dashboardController.js';

const router = express.Router();

// Get dashboard data (protected)
router.get('/', isAuthenticated, getDashboardData);

export default router;