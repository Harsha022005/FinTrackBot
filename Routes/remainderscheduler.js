import cron from 'node-cron';
import {User} from '../models/schema.js';
import axios from 'axios';

import dotenv from 'dotenv';
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
cron.schedule('0 6 * * *', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    try {
        const users = await User.find({ 'remainders.date': { $lte: today } });
        for (const user of users) {
            // Find reminders due today for this user
            const dueReminders = user.remainders.filter(reminder => {
                const rDate = new Date(reminder.date);
                rDate.setHours(0, 0, 0, 0);
                return rDate.getTime() === today.getTime();
            });
            for (const reminder of dueReminders) {
                await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    chat_id: user.telegramid,
                    text: `Reminder: ₹${reminder.amount} for ${reminder.category} is due today.`
                });
            }
        }
    } catch (error) {
        console.error('Error in reminder scheduler:', error);
    }
});