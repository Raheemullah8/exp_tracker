import Income from '../models/Income.js';
import Expense from '../models/Expense.js';
import { Types } from 'mongoose';

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(400).json({ message: 'User id missing' });

    const userObjectId = new Types.ObjectId(String(userId));

    // Aggregate total income
    const totalIncomeAgg = await Income.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Aggregate total expense
    const totalExpenseAgg = await Expense.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalIncome = totalIncomeAgg[0]?.total || 0;
    const totalExpense = totalExpenseAgg[0]?.total || 0;

    // Last 60 days income transactions
    const since60Days = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const last60DaysIncomeTransactions = await Income.find({
      userId: userObjectId,
      date: { $gte: since60Days },
    }).sort({ date: -1 }).lean();

    const incomeLast60Days = last60DaysIncomeTransactions.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    );

    // Last 30 days expense transactions
    const since30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const last30DaysExpenseTransactions = await Expense.find({
      userId: userObjectId,
      date: { $gte: since30Days },
    }).sort({ date: -1 }).lean();

    const expensesLast30Days = last30DaysExpenseTransactions.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    );

    // Recent transactions: merge last 5 incomes and last 5 expenses, sort by date desc, take 5
    const recentIncomes = (await Income.find({ userId: userObjectId }).sort({ date: -1 }).limit(5).lean())
      .map((txn) => ({ ...txn, type: 'income' }));
    const recentExpenses = (await Expense.find({ userId: userObjectId }).sort({ date: -1 }).limit(5).lean())
      .map((txn) => ({ ...txn, type: 'expense' }));

    const combined = [...recentIncomes, ...recentExpenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // Final response
    return res.json({
      totalBalance: totalIncome - totalExpense,
      totalIncome,
      totalExpenses: totalExpense,
      last30DaysExpenses: {
        total: expensesLast30Days,
        transactions: last30DaysExpenseTransactions,
      },
      last60DaysIncome: {
        total: incomeLast60Days,
        transactions: last60DaysIncomeTransactions,
      },
      recentTransactions: combined,
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};