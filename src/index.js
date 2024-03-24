
import dotenv from "dotenv";

import connectDB from "./db/index.js";

dotenv.config({
    path: "./env"
})


connectDB()



















// import express from 'express';
// const app = express();
// (  async ()=>{
//     try {

//        await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//        app.on("error" , ( error)=>{
//         console.log("Error " , error);
//         throw error
//        }) 

//        app.listen(process.env.PORT , ()=>{
//         console.log(`Application is running on port no ${process.env.PORT}`);
//        })
       
//     } catch (error) {
//         console.log("Error has occour while connecting with data base " , error);
//     }
// })()