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
    expenses: [expensesschema],
    recurringexpeses:[recurringschema],
    remainders: [remainderschema]
});

const recurringschema=new mongoose.Schema({
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    frequency: { type: String, required: true } ,
    duration: { type: Number, required: true }  ,
    startdate: { type: Date, default: Date.now },
    enddate: { type: Date}

})
const remainderschema = new mongoose.Schema({
    title:{type:String,required:true},
    description:{type:String,required:true},
    amount:{type:Number,required:true},
    date:{type:Date}
    
});
const budgetalert=new mongoose.Schema({
    category:{type:String,required:true},
    limit:{type:Number,required:true},
    spent:{type:Number,default:0},
    date: { type: Date },
})
export const User = mongoose.model('User', userschema);