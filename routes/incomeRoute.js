import express from 'express';
import { addIncome, getIncomes, deleteIncome, downloadIncome } from '../controllers/incomeController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Income routes
router.post('/add', isAuthenticated, addIncome);
router.get('/get', isAuthenticated, getIncomes);
router.delete('/:id', isAuthenticated, deleteIncome);
router.get('/download', isAuthenticated, downloadIncome);

export default router;
