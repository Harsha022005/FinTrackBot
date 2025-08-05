import express from 'express';
import { User } from '../models/schema.js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function handletelegramupdates(msg) {
    const chatid = msg.chat.id;
    const userid = msg.from.id;
    const text = msg.text.trim();
    console.log('Received message:', msg);

    if (text === '/start') {
        return sendtext(chatid, `
Welcome to Expense Tracker Bot!

Easily manage your finances with these commands:
- /addexpenses <amount> <category> - Log a new expense
- /todayexpenses - View today's expenses
- /weekly - See your weekly expense summary
- /monthly - See your monthly expense summary
- /addrecurringexpenses <amount> <category> <frequency> <duration> - Set recurring expenses
- /setreminder <amount> <category> <duration> [daily|weekly|monthly] - Set expense reminders
- /botid - Get your unique Telegram ID for secure access
- /help - View all available commands

Your Telegram ID: \`${userid}\`
Use this ID to securely access your expenses on our website.
Start tracking now and take control of your finances!
`);
    } else if (text === '/botid') {
        return await handlebotid(msg, text, userid, chatid);
    } else if (text === '/help') {
        return sendtext(chatid, `
Expense Tracker Bot Commands

Manage your finances effortlessly:
- /start - Get started with the bot
- /addexpenses <amount> <category> - Add an expense (e.g., /addexpenses 50 coffee)
- /todayexpenses - View today's expenses
- /weekly - Weekly expense summary
- /monthly - Monthly expense summary
- /addrecurringexpenses <amount> <category> <frequency> <duration> - Add recurring expenses (e.g., /addrecurringexpenses 100 rent monthly 6)
- /setreminder <amount> <category> <duration> [daily|weekly|monthly] - Set reminders (e.g., /setreminder 100 groceries 3 weekly)
- /botid - Get your Telegram ID for secure website access
- /help - Show this menu

Start tracking your expenses today!
`);
    } else if (text.startsWith('/addrecurringexpenses')) {
        return await handleaddrecurringexpenses(msg, text, userid, chatid);
    } else if (text.startsWith('/addexpenses')) {
        return await handleaddexpenses(msg, text, userid, chatid);
    } else if (text === '/todayexpenses') {
        return await handletodayexpenses(msg, text, userid, chatid);
    } else if (text === '/weekly') {
        return await handleweeklyexpenses(msg, text, userid, chatid);
    } else if (text === '/monthly') {
        return await handlemonthlyexpenses(msg, text, userid, chatid);
    } else if (text.startsWith('/setreminder')) {
        return await handleReminders(msg, text, userid, chatid);
    } else {
        return sendtext(chatid, `
Invalid Command

Please use a valid command. Type /help to see all available commands.
`);
    }
}

async function handlebotid(msg, text, userid, chatid) {
    const url = "https://fintrackbot-1.onrender.com/duplicate-dashboard"; 
    const message = `
🆔 Your Telegram ID: \`${userid}\`

🔗 [Access Your Dashboard](${url})

Use this ID to securely view and manage your expenses on our website. Keep it private for your security!
`;
    return sendtext(chatid, message);
}

async function handleaddexpenses(msg, text, userid, chatid) {
    const parts = text.split(' ');
    if (parts.length < 3) {
        return sendtext(chatid, `
Invalid Format
Please use: /addexpenses <amount> <category>
Example: /addexpenses 50 coffee
`);
    }
    const amount = parseFloat(parts[1]);
    const category = parts.slice(2).join(' ');
    if (isNaN(amount) || amount < 0) {
        return sendtext(chatid, `
Invalid Amount
Please enter a valid number for the amount.
Example: /addexpenses 50 coffee
`);
    }

    let user = await User.findOne({ telegramid: userid });
    if (!user) {
        user = new User({
            telegramid: userid,
            name: msg.from.first_name,
            username: msg.from.username,
            expenses: [],
        });
    }

    user.expenses.push({
        amount,
        category,
        date: new Date()
    });

    try {
        await user.save();
        console.log('Expense saved successfully:', user);
        return sendtext(chatid, `
Expense Added!
- Amount: ₹${amount}
- Category: ${category}
Track more expenses with /addexpenses!
`);
    } catch (err) {
        console.error('Error saving expense:', err);
        return sendtext(chatid, `
Error
Could not save your expense. Please try again later.
`);
    }
}

async function handleaddrecurringexpenses(msg, text, userid, chatid) {
    const parts = text.split(' ');
    if (parts.length < 5) {
        return sendtext(chatid, `
Invalid Format
Please use: /addrecurringexpenses <amount> <category> <frequency> <duration>
Example: /addrecurringexpenses 100 rent monthly 6
`);
    }
    const amount = parseFloat(parts[1]);
    const category = parts[2];
    const frequency = parts[3].toLowerCase();
    const duration = parseInt(parts[4]);

    const validFrequencies = ['daily', 'weekly', 'monthly'];
    if (isNaN(amount) || amount <= 0) {
        return sendtext(chatid, `
Invalid Amount
Please enter a valid number for the amount.
Example: /addrecurringexpenses 100 rent monthly 6
`);
    }
    if (!validFrequencies.includes(frequency)) {
        return sendtext(chatid, `
Invalid Frequency
Please use: daily, weekly, or monthly.
Example: /addrecurringexpenses 100 rent monthly 6
`);
    }
    if (isNaN(duration) || duration <= 0) {
        return sendtext(chatid, `
Invalid Duration
Please enter a valid number for duration.
Example: /addrecurringexpenses 100 rent monthly 6
`);
    }

    let user = await User.findOne({ telegramid: userid });
    if (!user) {
        user = new User({
            telegramid: userid,
            name: msg.from.first_name,
            username: msg.from.username,
            recurringexpenses: []
        });
    }

    if (!user.recurringexpenses) {
        user.recurringexpenses = [];
    }

    user.recurringexpenses.push({
        amount,
        category,
        frequency,
        duration,
        date: new Date(),
        startdate: new Date(),
        enddate: new Date(new Date().setFullYear(new Date().getFullYear() + duration))
    });

    await user.save();
    console.log('Recurring expense saved successfully:', user);
    return sendtext(chatid, `
Recurring Expense Added!
- Amount: ₹${amount}
- Category: ${category}
- Frequency: ${frequency}
- Duration: ${duration} time(s)
Manage your recurring expenses with ease!
`);
}

async function handleReminders(msg, text, userid, chatid) {
    const parts = text.trim().split(/\s+/);
    if (parts.length < 4) {
        return sendtext(chatid, `
Invalid Format
Please use: /setreminder <amount> <category> <duration> [daily|weekly|monthly]
Example: /setreminder 100 groceries 3 weekly
`);
    }

    const amount = parseFloat(parts[1]);
    const category = parts[2];
    const duration = parseInt(parts[3]);
    const frequency = (parts[4] || 'daily').toLowerCase();

    const validFrequencies = ['daily', 'weekly', 'monthly'];
    if (isNaN(amount) || amount <= 0 || isNaN(duration) || duration <= 0) {
        return sendtext(chatid, `
Invalid Input
Please provide a valid amount and duration.
Example: /setreminder 100 groceries 3 weekly
`);
    }
    if (!validFrequencies.includes(frequency)) {
        return sendtext(chatid, `
Invalid Frequency
Please use: daily, weekly, or monthly.
Example: /setreminder 100 groceries 3 weekly
`);
    }

    let user = await User.findOne({ telegramid: userid });
    if (!user) {
        user = new User({
            telegramid: userid,
            name: msg.from.first_name,
            username: msg.from.username,
            remainders: []
        });
    }

    if (!user.remainders) {
        user.remainders = [];
    }

    const now = new Date();
    for (let i = 0; i < duration; i++) {
        const reminderDate = new Date(now);
        if (frequency === 'monthly') {
            reminderDate.setMonth(reminderDate.getMonth() + i);
        } else if (frequency === 'weekly') {
            reminderDate.setDate(reminderDate.getDate() + i * 7);
        } else {
            reminderDate.setDate(reminderDate.getDate() + i);
        }

        user.remainders.push({
            amount,
            category,
            duration,
            date: reminderDate
        });
    }

    await user.save();
    return sendtext(chatid, `
Reminder Set!
- Amount: ₹${amount}
- Category: ${category}
- Frequency: ${frequency}
- Duration: ${duration} time(s)
Stay on top of your expenses with reminders!
`);
}

async function handletodayexpenses(msg, text, userid, chatid) {
    try {
        let user = await User.findOne({ telegramid: userid });
        if (!user) {
            user = new User({
                telegramid: userid,
                name: msg.from.first_name,
                username: msg.from.username,
                expenses: []
            });
            await user.save();
            return sendtext(chatid, `
Today's Expenses
No expenses recorded for today.
Start tracking with /addexpenses!
`);
        }

        const today = new Date();
        const remaindersDueToday = user.remainders.filter(reminder => {
            const reminderDate = new Date(reminder.date);
            return reminderDate.getDate() === today.getDate() &&
                   reminderDate.getMonth() === today.getMonth() &&
                   reminderDate.getFullYear() === today.getFullYear();
        });
        const todayexpenses = user.expenses.filter(expense => {
            const expensedate = new Date(expense.date);
            return expensedate.getDate() === today.getDate() &&
                   expensedate.getMonth() === today.getMonth() &&
                   expensedate.getFullYear() === today.getFullYear();
        });

        if (todayexpenses.length === 0) {
            return sendtext(chatid, `
Today's Expenses
No expenses recorded for today.
${remaindersDueToday.length > 0 ? `
Reminders Due Today
${remaindersDueToday.map(r => `- ₹${r.amount} - ${r.category}`).join('\n')}
` : ''}`);
        }

        const total = todayexpenses.reduce((sum, e) => sum + e.amount, 0);
        return sendtext(chatid, `
Today's Expenses
${todayexpenses.map(e => `- ₹${e.amount} - ${e.category}`).join('\n')}
Total: ₹${total}
${remaindersDueToday.length > 0 ? `
Reminders Due Today
${remaindersDueToday.map(r => `- ₹${r.amount} - ${r.category}`).join('\n')}
` : ''}`);
    } catch (err) {
        console.error('Error retrieving today\'s expenses:', err);
        return sendtext(chatid, `
Error
Could not retrieve today's expenses. Please try again later.
`);
    }
}

async function handleweeklyexpenses(msg, text, userid, chatid) {
    let user = await User.findOne({ telegramid: userid });
    if (!user) {
        user = new User({
            telegramid: userid,
            name: msg.from.first_name,
            username: msg.from.username,
            expenses: []
        });
        await user.save();
        return sendtext(chatid, `
Weekly Expenses
No expenses recorded for the past week.
Start tracking with /addexpenses!
`);
    }

    const today = new Date();
    const weekStartDate = new Date();
    weekStartDate.setDate(today.getDate() - 7);

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const groupedExpenses = {};
    let total = 0;

    for (const expense of user.expenses) {
        const expDate = new Date(expense.date);
        if (expDate >= weekStartDate && expDate <= today) {
            const day = weekdays[expDate.getDay()];
            if (!groupedExpenses[day]) groupedExpenses[day] = [];
            groupedExpenses[day].push(expense);
            total += expense.amount;
        }
    }

    if (Object.keys(groupedExpenses).length === 0) {
        return sendtext(chatid, `
Weekly Expenses
No expenses recorded for the past week.
Start tracking with /addexpenses!
`);
    }

    let message = `Weekly Expenses\n\n`;
    weekdays.forEach(day => {
        if (groupedExpenses[day]) {
            message += `${day}\n${groupedExpenses[day].map(exp => `- ₹${exp.amount} - ${exp.category}`).join('\n')}\n\n`;
        }
    });
    message += `Total: ₹${total}`;

    const remaindersDueToday = user.remainders.filter(reminder => {
        const reminderDate = new Date(reminder.date);
        return reminderDate.getDate() === today.getDate() &&
               reminderDate.getMonth() === today.getMonth() &&
               reminderDate.getFullYear() === today.getFullYear();
    });

    return sendtext(chatid, message, remaindersDueToday.length > 0 ? `
Reminders Due Today
${remaindersDueToday.map(r => `- ₹${r.amount} - ${r.category}`).join('\n')}
` : '');
}

async function handlemonthlyexpenses(msg, text, userid, chatid) {
    let user = await User.findOne({ telegramid: userid });
    if (!user) {
        user = new User({
            telegramid: userid,
            name: msg.from.first_name,
            username: msg.from.username,
            expenses: []
        });
        await user.save();
        return sendtext(chatid, `
Monthly Expenses
No expenses recorded for this month.
Start tracking with /addexpenses!
`);
    }

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const monthlyExpenses = user.expenses.filter(exp => {
        const d = new Date(exp.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    if (monthlyExpenses.length === 0) {
        return sendtext(chatid, `
Monthly Expenses
No expenses recorded for this month.
Start tracking with /addexpenses!
`);
    }

    const total = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const message = `
Monthly Expenses
${monthlyExpenses.map(e => `- ₹${e.amount} - ${e.category}`).join('\n')}
Total: ₹${total}
`;
    return sendtext(chatid, message);
}

async function sendtext(chatid, text, extra = '') {
    try {
        await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
            chat_id: chatid,
            text: text + (extra ? extra : ''),
            parse_mode: 'Markdown'
        });
    } catch (err) {
        if (err.response) {
            console.error('Telegram API error:', err.response.data);
        } else {
            console.error('Axios error:', err.message);
        }
    }
}

export async function setWebhook() {
    const webhookUrl = `https://fintrackbot-1.onrender.com/bot`;
    try {
        const response = await axios.get(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/setWebhook?url=${webhookUrl}`);
        console.log('Webhook set successfully:', response.data);
    } catch (error) {
        console.error('Error setting webhook:', error);
    }
}