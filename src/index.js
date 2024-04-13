
import dotenv from "dotenv";

import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "./.env"
})


connectDB()
.then( ()=>{
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`Server is listning on port no ${process.env.PORT } `);
    })
} )
.catch( (err)=>{
        console.log("MONGO db connection fails !!!");
} )



















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