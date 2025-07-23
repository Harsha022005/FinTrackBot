import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// 1. Define recurring schema first
const recurringschema = new mongoose.Schema({
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    frequency: { type: String, required: true }, // e.g., 'weekly', 'monthly'
    duration: { type: Number, required: true },  // in number of cycles (weeks/months)
    startdate: { type: Date, default: Date.now },
    enddate: { type: Date } // will be calculated: startdate + duration
});

// 2. Define remainders schema
const remainderschema = new mongoose.Schema({
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    duration: { type: Number, required: true }, // e.g., in days
    date: { type: Date, default: Date.now },
});

// 3. Define budget alert schema
const budgetalert = new mongoose.Schema({
    category: { type: String, required: true },
    limit: { type: Number, required: true },
    spent: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
});

// 4. Define regular expenses schema
const expensesschema = new mongoose.Schema({
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

// 5. Now define the user schema and use others as sub-documents
const userschema = new mongoose.Schema({
    telegramid: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String },
    expenses: [expensesschema],
    recurringexpenses: [recurringschema],
    remainders: [remainderschema],
    budgetalerts: [budgetalert]
});

export const User = mongoose.model('User', userschema);
