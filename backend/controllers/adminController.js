import adminModel from "../models/adminModel.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js'; 
import path from 'path';
import musicModel from '../models/musicModel.js';
import cloudinary from '../config/cloudinary.js'
import fs from 'fs'


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

export const uploadMusic = async (req, res) => {
  try {
    // Validate input
    const { title, artist } = req.body;
    if (!title?.trim() || !artist?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Title and artist are required" 
      });
    }

    // Validate files
    const musicFile = req.files?.music?.[0];
    const imageFile = req.files?.image?.[0];
    if (!musicFile || !imageFile) {
      return res.status(400).json({ 
        success: false, 
        message: "Both music and image files are required" 
      });
    }

    // Validate file types
    const musicExt = path.extname(musicFile.originalname).toLowerCase();
    const imageExt = path.extname(imageFile.originalname).toLowerCase();
    const allowedAudio = ['.mp3', '.wav', '.m4a'];
    const allowedImages = ['.jpg', '.jpeg', '.png', '.webp'];
    
    if (!allowedAudio.includes(musicExt) || !allowedImages.includes(imageExt)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file types. Audio: ${allowedAudio.join(', ')}, Images: ${allowedImages.join(', ')}`
      });
    }

    // Validate file sizes
    const MAX_AUDIO_SIZE = 20 * 1024 * 1024; // 20MB
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    if (musicFile.size > MAX_AUDIO_SIZE || imageFile.size > MAX_IMAGE_SIZE) {
      return res.status(413).json({
        success: false,
        message: `File too large. Max ${MAX_AUDIO_SIZE/1024/1024}MB for audio, ${MAX_IMAGE_SIZE/1024/1024}MB for images`
      });
    }

    // Upload to Cloudinary
    const [musicUpload, imageUpload] = await Promise.all([
      cloudinary.uploader.upload(musicFile.path, {
        resource_type: 'video',
        folder: 'music_app/audio',
        upload_preset: 'audio_preset' // Create this in Cloudinary settings
      }),
      cloudinary.uploader.upload(imageFile.path, {
        folder: 'music_app/images',
        upload_preset: 'image_preset'
      })
    ]);

    // Create database record
    const music = await musicModel.create({
      title: title.trim(),
      artist: artist.trim(),
      audioUrl: musicUpload.secure_url,
      imageUrl: imageUpload.secure_url,
      cloudinaryId: {
        audio: musicUpload.public_id,
        image: imageUpload.public_id
      }
    });

    // Cleanup temp files
    try {
      fs.unlinkSync(musicFile.path);
      fs.unlinkSync(imageFile.path);
    } catch (cleanupErr) {
      console.warn('File cleanup failed:', cleanupErr);
    }

    // Success response
    res.status(201).json({
      success: true,
      message: "Upload successful",
      music: {
        id: music._id,
        title: music.title,
        artist: music.artist,
        audioUrl: music.audioUrl,
        imageUrl: music.imageUrl
      }
    });

  } catch (error) {
    console.error("Upload error:", error);
    
    // Specific error for Cloudinary failures
    if (error.message.includes('Cloudinary')) {
      return res.status(502).json({ 
        success: false, 
        message: "File storage service unavailable" 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getMusic = async (req, res) => {
  try {
    // Use .lean() for better performance and to get plain JS objects
    let musics = await musicModel.find().lean();
    
    if (!musics || musics.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No songs found" 
      });
    }

    // Safely transform file paths
    const transformedMusics = musics.map(music => {
      const result = { ...music };
      if (music.filePath) {
        result.filePath = music.filePath.replace(/\\/g, "/");
      }
      return result;
    });

    return res.json({ 
      success: true, 
      musics: transformedMusics 
    });
  } catch (error) {
    console.error('Error in getMusic:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message // Include for debugging
    });
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
