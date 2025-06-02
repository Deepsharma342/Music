import adminModel from "../models/adminModel.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js'; 
import path from 'path';
import musicModel from "../models/musicModel.js";


export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      username,
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const user = await adminModel.findOne({ email });
    if (!user) {
      return res.status(409).json({ success: false, message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email // use `user.email`, not `newuser.email`
    };

    res.status(200).json({ success: true, message: "Login successful", user: userResponse, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}


export const uploadMusic=async(req,res)=>{
//console.log("BODY:", req.body);
//console.log("FILES:", req.files);
  try {  
console.log("BODY:", req.body);
console.log("FILES:", req.files);
    const{title,artist}=req.body
    if(!title||!artist){
      return res.status(400).json({success:false,message:"all fields are required"})
    }
    const musicFile = req.files?.music?.[0];
    const imageFile = req.files?.image?.[0];

    //const musicFile=req.file;
    //const imageFile=req.file;
    //need to add same for the image.
  
    if(!musicFile){
      return res.status(400).json({success:false,message:"no music file upload"})
    }
    if(!imageFile){
      return res.status(400).json({success:false,message:"image file is required"})
    }
    //const allowedExtensions=['.mp3','.wav','.jpg','.jpeg','.png','.webp'];
    const musicExt=path.extname(musicFile.originalname).toLowerCase()
    const imageExt=path.extname(imageFile.originalname).toLowerCase()
    //if(!allowedExtensions.includes(musicExt) || !allowedExtensions.includes(!imageExt)){
      //return res.status(400).json({success:false,message:"invalid file type. Only audio(.mp3,.wav) and image(.jpg, .jpeg, .png)files"})
    //}
    const allowedAudio = ['.mp3', '.wav'];
const allowedImages = ['.jpg', '.jpeg', '.png', '.webp'];
if (!allowedAudio.includes(musicExt) || !allowedImages.includes(imageExt)) {
  return res.status(400).json({
    success: false,
    message: "Invalid file type. Only audio (.mp3, .wav) and image (.jpg, .jpeg, .png, .webp) files allowed."
  });
}

    const filePath=musicFile.path
    const imageFilePath=imageFile.path

const music=new musicModel({
      title,
      artists:artist,
      filePath:filePath,
      imageFilePath
    })
    await music.save()
    res.status(201).json({success:true,message:"MUSIC UPLOADED SUCCESSFULLY$",music})

  } catch (error) {
  console.error("Upload failed:", error);
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      error: error.message,
    });
  }
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

}
export const getMusic=async(req,res)=>{
  try {
    let musics=await musicModel.find()
    if(!musics||musics.length===0){
      return res.json({success:false,message:"no songs found"})
    }
    musics = musics.map(music => ({
      ...music._doc, // important to extract the actual fields from Mongoose
      filePath: music.filePath.replace(/\\/g, "/") // convert backslashes to forward slashes
    }));
    res.json({success:true,musics})
  } catch (error) {
    console.log(error)
    res.status(500).json({success:false,message:'internal server error'})
  }
}
export const deleteMusic=async (req,res) => {
  try {
    const {id} =req.params;
    const music=await musicModel.findByIdAndDelete(id)
    if(!music){
      return res.json({success:false,message:"no songs found"})
    }
    res.status(200).json({success:true,message:"music deleted successfully",music})

  } catch (error) {
    console.log(error)
    res.status(500).json({success:false,message:"internal server eror"})
  }
}
