import cron from 'node-cron';
import { User } from '../models/schema.js';
import dotenv from 'dotenv';
dotenv.config();

cron.schedule('0 0 * * *', async () => { //Checks atmidnight every day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const users = await User.find({});
    for (const user of users) {
        let updated = false;
        for (const rec of user.recurringexpenses) {
            let due = false;
            const start = new Date(rec.startdate);
            const end = rec.enddate ? new Date(rec.enddate) : null;
            if (end && today > end) continue;

            if (rec.frequency === 'daily') {
                due = true;
            } else if (rec.frequency === 'weekly') {
                const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
                due = diffDays % 7 === 0;
            } else if (rec.frequency === 'monthly') {
                due = today.getDate() === start.getDate();
            }

            // Check if already added today
            const alreadyAdded = user.expenses.some(e =>
                e.category === rec.category &&
                e.amount === rec.amount &&
                new Date(e.date).toDateString() === today.toDateString()
            );

            if (due && !alreadyAdded) {
                user.expenses.push({
                    amount: rec.amount,
                    category: rec.category,
                    date: today
                });
                updated = true;
            }
        }
        if (updated) await user.save();
    }
});