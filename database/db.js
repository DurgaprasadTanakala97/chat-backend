import mongoose from "mongoose";

export const dbConnection = async ()=>{
    console.log(process.env.MONGO_URI)
    await mongoose.connect(process.env.MONGO_URI,{
        dbName:'QUICK_CHAT_BACKEND',
        family: 4, // forces IPv4
        serverSelectionTimeoutMS: 5000
    }).then(()=>{
        console.log('mongodatabase connected successfully')
    }).catch((err)=>{
        console.log(err)
    })
}