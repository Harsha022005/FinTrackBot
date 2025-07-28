 import express from 'express';
 import axios from 'axios';

 const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAMTOKEN}`;

 function axiosinstance(){
    return{
       get(method,params){
         return axios.get(`${TELEGRAM_API}/${method}`,{params})
      },
        post(method,data){
            return axios.post(`${TELEGRAM_API}/${method}`,data)
        },
       }
    }
export default axiosinstance();