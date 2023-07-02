import express from "express";
import rateLimit from 'express-rate-limit'
import authRoutes from "./routes/auth.js"
import OtpRoutes from "./routes/Otp.js"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import cors from 'cors'
import path from "path"

dotenv.config();

//lets create our app
const app = express()

app.use(cors())

app.use(express.json())
app.use(cookieParser());

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	max: 100, 
	standardHeaders: true,
	legacyHeaders: false, 
})


app.use(limiter)

app.use("/api/auth", authRoutes)
app.use("/api/otp", OtpRoutes)


if(process.env.NODE_ENV=='production'){

	app.get('/',(req,res)=>{
		app.use(express.static(path.resolve(__dirname,'client','build')))
		res.sendFile(path.resolve(__dirname,'client','build','index.html'))
	})
  }

app.listen(process.env.PORT || 3040, () => {
    console.log("connected")
})