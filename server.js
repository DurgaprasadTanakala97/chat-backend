import express from 'express';
import cookieParser from 'cookie-parser';
import http from 'http';


import { config } from 'dotenv';
import fileUpload from "express-fileupload";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";

import { dbConnection } from './database/db.js';
import dotenv from "dotenv";
const app = express();
//routes

import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import { initSocket } from './utils/socket.js';


config({path:"./config/config.env"})
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  jwt_secret_key:process.env.JWT_SECRET_KEY
});


dbConnection();
app.use(cors({
  origin:[process.env.FRONTEND_URL,"https://69e337e1f5e13c283cd85387--sam-vaada.netlify.app"],
  credentials:true,
  methods:["GET","POST","PUT","DELETE"]
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(
  fileUpload({
    useTempFiles:true,
    tempFileDir:"./temp/"
  })
)

// routes 
app.use('/api/v1/user',userRouter);
app.use('/api/v1/message',messageRouter);

app.use('/',(req,res)=>{
  res.send('welcome to backend serevr')
})

const server = http.createServer(app);
initSocket(server);
server.listen(process.env.PORT,()=>{
  console.log(`Server is running on port ${process.env.PORT} in  ${process.env.NODE_ENV} mode.`)
})