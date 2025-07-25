import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
const connectDB=async()=>{
    try{

       await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
       useUnifiedTopology: true,
      });
    }
    catch (err){
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); 
    }
}
export default connectDB;