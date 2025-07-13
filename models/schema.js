import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const expensesschema = new mongoose.Schema({
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const userschema = new mongoose.Schema({
    telegramid: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String},
    expenses: [expensesschema]
});

export const User = mongoose.model('User', userschema);