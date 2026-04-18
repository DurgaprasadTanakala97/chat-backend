import mongoose from "mongoose";

export const dbConnection = ()=>{
    mongoose.connect(process.env.MONGO_URL,{
        dbName:'QUICK_CHAT_BACKEND'
    }).then(()=>{
        console.log('mongodatabase connected successfully')
    }).catch((err)=>{
        console.log(err)
    })
}