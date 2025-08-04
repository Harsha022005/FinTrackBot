import express from 'express';
const router = express.Router();
import { User } from '../models/schema.js';

router.post('/', async (req, res) => {
const { botid ,offset,limit} = req.body;
    if (!botid) {
        return res.status(400).json({ success: false, message: "Bot ID is required" });
    }
    try {
        const user = await User.findOne({ telegramid: botid });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        console.log("BotID received:", botid);
        const recurringexpenses=user.recurringexpenses || [];
        const remainders=user.remainders || [];
        // const budgetalerts=user.budgetalerts || [];
        const expenses=user.expenses || [];
        const totalexpenses=expenses.reduce((sum,expense)=>sum+expense.amount,0)
        const sortedexpenses=expenses.sort((a,b)=> new Date(b.date)- new Date(a.date));

        const pagination=sortedexpenses.slice(offset,offset+limit);

        return res.status(200).json({ 
            success: true,
             expenses: pagination ,
             recurringexpenses,
             remainders,
             totalexpenses
             
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error fetching expenses', error: err.message });
    }
});

export default router;