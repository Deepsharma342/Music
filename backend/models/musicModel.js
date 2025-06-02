import mongoose from "mongoose"

const musicSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    artists:{
        type:String,
        required:true
    },
    filePath:{
        type:String,
        required:true
    },
    imageFilePath:{
        type:String,
        required:true
    }
},{timestamps:true})

const musicModel=mongoose.models.music||mongoose.model("music",musicSchema)

export default musicModel