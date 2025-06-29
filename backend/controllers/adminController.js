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
  // Validate request has files
  if (!req.files || !req.files.music || !req.files.image) {
    return res.status(400).json({
      success: false,
      message: "Please upload both music and image files"
    });
  }

  const { title, artist } = req.body;
  const musicFile = req.files.music[0];
  const imageFile = req.files.image[0];

  // Enhanced logging
  console.log('📥 Upload Request Received:', {
    title,
    artist,
    musicFile: {
      name: musicFile.originalname,
      size: musicFile.size,
      path: musicFile.path
    },
    imageFile: {
      name: imageFile.originalname,
      size: imageFile.size,
      path: imageFile.path
    }
  });

  // Validate input
  if (!title?.trim() || !artist?.trim()) {
    return res.status(400).json({ 
      success: false, 
      message: "Title and artist are required" 
    });
  }

  // Validate file types
  const allowedAudio = ['.mp3', '.wav', '.m4a', '.ogg'];
  const allowedImages = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const musicExt = path.extname(musicFile.originalname).toLowerCase();
  const imageExt = path.extname(imageFile.originalname).toLowerCase();

  if (!allowedAudio.includes(musicExt)) {
    return res.status(400).json({
      success: false,
      message: `Invalid audio format. Allowed: ${allowedAudio.join(', ')}`,
      received: musicExt
    });
  }

  if (!allowedImages.includes(imageExt)) {
    return res.status(400).json({
      success: false,
      message: `Invalid image format. Allowed: ${allowedImages.join(', ')}`,
      received: imageExt
    });
  }

  // Validate file sizes
  const MAX_AUDIO_SIZE = 20 * 1024 * 1024; // 20MB
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  if (musicFile.size > MAX_AUDIO_SIZE) {
    return res.status(413).json({
      success: false,
      message: `Audio file too large. Max ${MAX_AUDIO_SIZE/1024/1024}MB allowed`,
      size: `${(musicFile.size/1024/1024).toFixed(2)}MB`
    });
  }

  if (imageFile.size > MAX_IMAGE_SIZE) {
    return res.status(413).json({
      success: false,
      message: `Image file too large. Max ${MAX_IMAGE_SIZE/1024/1024}MB allowed`,
      size: `${(imageFile.size/1024/1024).toFixed(2)}MB`
    });
  }

  try {
    // Upload files to Cloudinary in parallel
    const [musicUpload, imageUpload] = await Promise.all([
      cloudinary.uploader.upload(musicFile.path, {
        resource_type: 'video', // For audio files
        folder: 'music_app/audio',
        overwrite: false,
        unique_filename: true,
        chunk_size: 6000000 // 6MB chunks for large files
      }),
      cloudinary.uploader.upload(imageFile.path, {
        folder: 'music_app/images',
        transformation: [
          { width: 500, height: 500, crop: 'limit' },
          { quality: 'auto' }
        ]
      })
    ]);

    console.log('☁️ Cloudinary Upload Results:', {
      music: musicUpload.secure_url,
      image: imageUpload.secure_url
    });

    // Create database record
    const newSong = await musicModel.create({
      title: title.trim(),
      artist: artist.trim(),
      audioUrl: musicUpload.secure_url,
      imageUrl: imageUpload.secure_url,
      cloudinaryIds: {
        audio: musicUpload.public_id,
        image: imageUpload.public_id
      },
      duration: musicUpload.duration, // If available
      format: musicUpload.format
    });

    // Cleanup temp files
    try {
      fs.unlinkSync(musicFile.path);
      fs.unlinkSync(imageFile.path);
      console.log('🧹 Temporary files cleaned up');
    } catch (cleanupErr) {
      console.warn('⚠️ File cleanup failed:', cleanupErr);
    }

    // Success response
    return res.status(201).json({
      success: true,
      message: "Song uploaded successfully",
      data: {
        id: newSong._id,
        title: newSong.title,
        artist: newSong.artist,
        audioUrl: newSong.audioUrl,
        imageUrl: newSong.imageUrl,
        duration: newSong.duration
      }
    });

  } catch (error) {
    console.error('❌ Upload Error:', error);

    // Cleanup temp files if error occurred
    try {
      if (musicFile?.path) fs.unlinkSync(musicFile.path);
      if (imageFile?.path) fs.unlinkSync(imageFile.path);
    } catch (cleanupErr) {
      console.warn('⚠️ Error cleanup failed:', cleanupErr);
    }

    // Handle specific Cloudinary errors
    if (error.message.includes('File size too large')) {
      return res.status(413).json({
        success: false,
        message: "File exceeds Cloudinary size limits"
      });
    }

    if (error.http_code === 401) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary authentication failed. Check API credentials"
      });
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      message: "Internal server error during upload",
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
