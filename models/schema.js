import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// 1. Recurring Expense Schema
const recurringSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
    duration: { type: Number, required: true },  // number of cycles
    startdate: { type: Date, default: Date.now },
    enddate: { type: Date } // calculated later
});

// 2. Reminder Schema
const reminderSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    duration: { type: Number, required: true }, // e.g., in days
    date: { type: Date, default: Date.now },
});

// 3. Budget Alert Schema
const budgetAlertSchema = new mongoose.Schema({
    category: { type: String, required: true },
    limit: { type: Number, required: true },
    spent: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
});

// 4. Expense Schema
const expenseSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

// 5. User Schema
const userSchema = new mongoose.Schema({
    telegramid: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String },
    expenses: [expenseSchema],
    recurringexpenses: [recurringSchema],
    remainders: [reminderSchema],
    budgetalerts: [budgetAlertSchema]
});

// 6. Export model
export const User = mongoose.model('User', userSchema);
