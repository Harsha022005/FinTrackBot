const router=express.Router();
import userschema from '../models/schema.js';

router.post('/fetch',async (req,res)=>{
const {botid}=req.body;;
    if (!botid ){
        return res.status(500).json({success:false,message:"Bot ID is required"});
    }
    try{
        const response=await userschema.findOne({telegramid:botid});
        if (!response){
            return res.status(404).json({success:false,message:'User not found'});

        }
        return res.status(200).json({success:true,expenses:response.expenses});

    }
    catch(err){
        return res.status(500).json({success:false,message:'Error fetching expenses',error:err.message});
    }
})
export default router;
