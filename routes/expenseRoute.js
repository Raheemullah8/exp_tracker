import express from 'express';
import { 
    addExpense, 
    getExpenses, 
    deleteExpense, 
    downloadExpenseExcel 
} from '../controllers/expenseController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Expense routes
router.post('/add', isAuthenticated, addExpense);
router.get('/get', isAuthenticated, getExpenses);
router.delete('/:id', isAuthenticated, deleteExpense);
router.get('/download', isAuthenticated, downloadExpenseExcel);

export default router;
