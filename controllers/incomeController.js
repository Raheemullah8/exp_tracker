import Income from '../models/Income.js';
import xlsx from 'xlsx';
// Add Income

export const addIncome = async (req, res) => {
    const userId = req.user._id;
    try {
        const { icon, source, amount, date } = req.body;

        if (!source || !amount || !date) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        const newIncome = new Income({
            userId,
            icon,
            source,
            amount,
            date
        });

        await newIncome.save();

        return res.status(201).json({
            success: true,
            message: "Income added successfully",
            income: newIncome
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


// Get All Incomes
export const getIncomes = async (req, res) => {
    // Get All Income Source
  const userId = req.user.id;

  try {
    const income = await Income.find({ userId }).sort({ date: -1 });
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};



// Delete Income
export const deleteIncome = async (req, res) => {

  try {
    await Income.findByIdAndDelete(req.params.id);
    res.json({ message: "Income deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


// Download Income
export const downloadIncome = async (req, res) => {
    try {
        const userId = req.user.id;
        const incomes = await Income.find({ userId }).sort({ date: -1 });

        // Create worksheet data
        const workSheetData = incomes.map(item => ({
            Source: item.source || '',
            Amount: item.amount || 0,
            Date: item.date ? new Date(item.date).toLocaleDateString() : '',
            "Created At": item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''
        }));

        // Create workbook and worksheet
        const workBook = xlsx.utils.book_new();
        const workSheet = xlsx.utils.json_to_sheet(workSheetData);
        xlsx.utils.book_append_sheet(workBook, workSheet, "Incomes");

        // Get the base64 data
        const excelBuffer = xlsx.write(workBook, { 
            type: 'base64'
        });

        // Send back the data with proper headers
        res.status(200).json({
            success: true,
            data: excelBuffer,
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).json({
            success: false,
            message: "Error downloading income data",
            error: error.message
        });
    }
};