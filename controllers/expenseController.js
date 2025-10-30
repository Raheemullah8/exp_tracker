import Expense from '../models/Expense.js';
import xlsx from 'xlsx';

// Add Expense
export const addExpense = async (req, res) => {
    const userId = req.user.id;
    try {
        const { icon, category, amount, date } = req.body;

        // Validation: Check for missing fields
        if (!category || !amount || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newExpense = new Expense({
            userId,
            category,
            amount,
            date: new Date(date)
        });

        await newExpense.save();

        res.status(201).json(newExpense);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Get All Expense Source
export const getExpenses = async (req, res) => {
    const userId = req.user.id;
    
    try {
        const incomes = await Expense.find({ userId }).sort({ date: -1 });
        res.json(incomes);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Delete Expense Source
export const deleteExpense = async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Download Excel
export const downloadExpenseExcel = async (req, res) => {
    const userId = req.user.id;
    try {
        const expenses = await Expense.find({ userId }).sort({ date: -1 });

        // Prepare data for Excel
        const data = expenses.map((item) => ({
            Source: item.category || '',
            Amount: item.amount || 0,
            Date: item.date ? new Date(item.date).toLocaleDateString() : ''
        }));

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, 'Expense');

        // Write workbook to base64 string
        const base64 = xlsx.write(wb, { bookType: 'xlsx', type: 'base64' });

        // Return base64 to client; frontend should convert to blob and trigger download
        res.status(200).json({
            success: true,
            data: base64,
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            filename: 'expense_details.xlsx'
        });
    } catch (error) {
        console.error('Download Expense Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};