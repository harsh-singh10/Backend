import express, { json } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();


// app.use => it is a configration 


// app.use(cors());  // This is for normal use 

// for production 
app.use(cors({
        origin : process.env.CORS_ORIGIN ,
        credentials: true
}))

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true , limit:"16kb"}));
app.use(express.static("public"));

app.use(cookieParser());


// import user router 
import userRouter from './routes/user.router.js'

// routes declearitoin

app.use('/users' , userRouter)

app.get('/' ,(req,res)=>{
        res.send("i am listingi")
} )


export{app}