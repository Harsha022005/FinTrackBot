import express from 'express';
import { User } from '../models/schema.js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function handletelegramupdates(msg){
    const chatid=msg.chat.id;
    const userid=msg.from.id;
    const text=msg.text.trim();
    console.log('Received message:', msg);

    if (text==='/start'){
        return sendtext(chatid, 'Welcome to the Expense Tracker Bot! Use /addexpenses to add an expense, /todayexpenses to see today\'s expenses, /weekly for weekly expenses, and /monthly for monthly expenses.');
    }
    else if (text === '/help') {
    return sendtext(chatid, `
Here are the available commands:

/start - Welcome message  
/addexpenses <amount> <category> - Add an expense  
/todayexpenses - View today's expenses  
/weekly - View weekly expenses  
/monthly - View monthly expenses  
/help - List of all commands
`);
}
    else if (text.startsWith('/addrecurringexpenses')) 
    {
        return await handleaddrecurringexpenses(msg, text, userid, chatid);
    }
    else if (text.startsWith('/addexpenses')){
        return await handleaddexpenses(msg,text,userid,chatid);
    }
    else if (text==='/todayexpenses'){
        return await handletodayexpenses(msg,text,userid,chatid);
    }
    else if (text==='/weekly'){
        return await handleweeklyexpenses(msg,text,userid,chatid);
    }
    else if (text==='/monthly'){
        return await handlemonthlyexpenses(msg,text,userid,chatid);
    }
    else if(text==='/reminders'){
        return await handleReminders(msg,text, userid, chatid);
    }
}

async function handleaddexpenses(msg,text,userid,chatid) 
{
    const parts=text.split(' ');
    if (parts.length < 3) {
        return sendtext(chatid, 'Please provide the amount and category in the format: /addexpenses amount category');
    }
    const amount=parseFloat(parts[1]);
     const category=parts.slice(2).join(' ');
    if (isNaN(amount) || amount<0){
        return sendtext(chatid,'please enter valid amount');
    }
    let user=await User.findOne({telegramid:userid});
    try{
        if (!user){
            user=new User({
                telegramid: userid,
                name: msg.from.first_name,
                username: msg.from.username,
                expenses: []
            });
        }
    }
    catch (err){
        console.error('Error finding or creating user:', err);
        return sendtext(chatid, 'An error occurred while processing your request.');
    }
    user.expenses.push({ 
        amount:amount,
        category:category,
        date:new Date()
    })
    try {
        await user.save();
        console.log('Expense saved successfully:', user);
        return sendtext(chatid, `Expense of ${amount} in category ${category} added successfully!`);
    } catch (err) {
        console.error('Error saving expense:', err);
        return sendtext(chatid, 'An error occurred while saving your expense.');
    }
}
async function handleaddrecurringexpenses(msg, text, userid, chatid) 
{
    const parts=text.split(' ');
    if (parts.length<5){
        return sendtext(chatid, 'Please provide the amount, category, frequency, and duration in the format: /addrecurringexpenses amount category frequency duration');
    }
    const amount=parseFloat(parts[1]);
    const category=parts[2];
    const frequency=parseFloat(parts[3]);
    const duration=parts[4];
    if (isNaN(amount) || amount<0){
        return sendtext(chatid,'Please enter a valid amount');
    }
    if (isNaN(frequency) || frequency<=0){
        return sendtext(chatid,'Please enter a valid frequency');
    }
    if (isNaN(duration) || duration<=0){
        return sendtext(chatid,'Please enter a valid duration');
    }
    const user=await User.findOne({telegramid:userid});
   try{
     if (!user){
        usernew=new User({
            telegramid: userid,
            name: msg.from.first_name,
            username: msg.from.username,
            recurringexpeses: []
        })
    }
   }
   catch (err){
        console.error('Error finding or creating user:', err);
        return sendtext(chatid, 'An error occurred while processing your request.');
    }
    user.recurringexpeses.push({
        amount:amount,
        category:category,
        date:new Date(),
        frequency:frequency,
        duration:duration,
        startdate:new Date(),
        enddate:new Date(new Date().setFullYear(new Date().getFullYear()+duration))
    })
    await user.save();
    console.log('Recurring expense saved successfully:', user);

   }
    


async function handletodayexpenses(msg,text,userid,chatid){
    try{
        let user=await User.findOne({telegramid:userid});
        if (!user){
            user=new User({
                telegramid: userid,
                name: msg.from.first_name,
                username: msg.from.username,
                expenses: []
            });
            await user.save();
            return sendtext(chatid, 'No expenses found for today.');
        }
        const today= new Date();
        const todayexpenses=user.expenses.filter(expense=>{
            const expensedate=new Date(expense.date);
            return expensedate.getDate()===today.getDate() && 
                   expensedate.getMonth()===today.getMonth() &&
                   expensedate.getFullYear()===today.getFullYear();    
        })
        if (todayexpenses.length===0){
            return sendtext(chatid, 'No expenses found for today.');
        }
        const total=todayexpenses.reduce((sum,e)=>sum+e.amount,0);
        return sendtext(chatid,
            `Today expenses:\n`+todayexpenses.map(expense=>`Amount: ${expense.amount}, Category: ${expense.category}`).join('\n')+`\nTotal: ${total}`
        )
    }
    catch (err){
        console.error('Error retrieving today\'s expenses:', err);
        return sendtext(chatid, 'An error occurred while retrieving today\'s expenses.');
    }
}

async function handleweeklyexpenses(msg, text, userid, chatid) {
    let user;
    try {
        user = await User.findOne({ telegramid: userid });
        if (!user) {
            user = new User({
                telegramid: userid,
                name: msg.from.first_name,
                username: msg.from.username,
                expenses: []
            });
            await user.save();
            return sendtext(chatid, 'No weekly expenses found.');
        }
    } catch (err) {
        console.error('Error finding or creating user:', err);
        return sendtext(chatid, 'An error occurred while processing your request.');
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
            if (!groupedExpenses[day]) {
                groupedExpenses[day] = [];
            }
            groupedExpenses[day].push(expense);
            total += expense.amount;
        }
    }

    if (Object.keys(groupedExpenses).length === 0) {
        return sendtext(chatid, 'No weekly expenses found.');
    }

    let message = `*Weekly Expenses by Day*\n\n`;
    weekdays.forEach(day => {
        if (groupedExpenses[day]) {
            message += ` *${day}*\n`;
            groupedExpenses[day].forEach(exp => {
                message += `  • ₹${exp.amount} - ${exp.category}\n`;
            });
            message += '\n';
        }
    });
    message += ` *Total:* ₹${total}`;

    return sendtext(chatid, message);
}

async function handlemonthlyexpenses(msg, text, userid, chatid) {
    let user;
    try {
        user = await User.findOne({ telegramid: userid });
        if (!user) {
            user = new User({
                telegramid: userid,
                name: msg.from.first_name,
                username: msg.from.username,
                expenses: []
            });
            await user.save();
            return sendtext(chatid, 'No expenses found for this month.');
        }
    } catch (err) {
        console.error('Error finding or creating user:', err);
        return sendtext(chatid, 'An error occurred while processing your request.');
    }
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const monthlyExpenses = user.expenses.filter(expense => {
        const expDate = new Date(expense.date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });
    if (monthlyExpenses.length === 0) {
        return sendtext(chatid, 'No expenses found for this month.');
    }
    const total = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const message = `Monthly expenses:\n` +
        monthlyExpenses.map(expense => `Category: ${expense.category}, Amount: ${expense.amount}`).join('\n') +
        `\nTotal: ${total}`;
    return sendtext(chatid, message);
}

async function sendtext(chatid, text) {
  try {
    await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      chat_id: chatid,
      text
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

