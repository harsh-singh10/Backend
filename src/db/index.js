
 import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB =  async ()=>{

    try {
       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
       
       console.log(`\n Database connected you made it !! ${connectionInstance.connection.host} `);
        // console.log(connectionInstance);  Ek baar try

        
    } catch (error) {
            console.error("MONGO connection Failed : " , error);
            process.exit(1); // process is a node function we can use it without importing

    }

}


export default connectDB;