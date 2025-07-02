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
    console.log('🚀 Upload started');
    console.log('📁 Files:', req.files ? 'Present' : 'Missing');
    console.log('📝 Body:', req.body);
    
    // Validate files exist
    if (!req.files || !req.files.music || !req.files.image) {
      console.log('❌ Files validation failed');
      return res.status(400).json({
        success: false,
        message: 'Both music and image files are required'
      });
    }

    const { title, artist } = req.body;
    const musicFile = req.files.music[0];
    const imageFile = req.files.image[0];

    // Validate required fields
    if (!title?.trim() || !artist?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title and artist are required'
      });
    }

    // Validate file extensions
    const allowedAudio = ['.mp3', '.wav', '.m4a', '.ogg'];
    const allowedImages = ['.jpg', '.jpeg', '.png', '.webp'];

    const musicExt = path.extname(musicFile.originalname).toLowerCase();
    const imageExt = path.extname(imageFile.originalname).toLowerCase();

    if (!allowedAudio.includes(musicExt)) {
      return res.status(400).json({
        success: false,
        message: `Invalid audio format: ${musicExt}. Allowed: ${allowedAudio.join(', ')}`
      });
    }

    if (!allowedImages.includes(imageExt)) {
      return res.status(400).json({
        success: false,
        message: `Invalid image format: ${imageExt}. Allowed: ${allowedImages.join(', ')}`
      });
    }

    // Upload files to Cloudinary
    console.log('☁️ Starting Cloudinary upload');
    console.log('🔑 Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY,
      api_secret: !!process.env.CLOUDINARY_API_SECRET
    });
    
    const [musicUpload, imageUpload] = await Promise.all([
      cloudinary.uploader.upload(musicFile.path, {
        resource_type: 'video',
        folder: 'music_app/audio'
      }),
      cloudinary.uploader.upload(imageFile.path, {
        folder: 'music_app/images'
      })
    ]);
    
    console.log('✅ Cloudinary upload complete');

    // Save to database
    console.log('💾 Saving to database');
    const newSong = await musicModel.create({
      title: title.trim(),
      artist: artist.trim(),
      audioUrl: musicUpload.secure_url,
      imageUrl: imageUpload.secure_url,
      cloudinaryIds: {
        audio: musicUpload.public_id,
        image: imageUpload.public_id
      },
      duration: musicUpload.duration || null,
      format: musicUpload.format
    });
    
    console.log('✅ Database save complete');

    // Clean up temporary files
    fs.unlinkSync(musicFile.path);
    fs.unlinkSync(imageFile.path);

    return res.status(201).json({
      success: true,
      message: 'Song uploaded successfully',
      data: {
        id: newSong._id,
        title: newSong.title,
        artist: newSong.artist,
        audioUrl: newSong.audioUrl,
        imageUrl: newSong.imageUrl
      }
    });

  } catch (error) {
    console.error('🔥 DETAILED ERROR:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Clean up files if they exist and upload failed
    try {
      if (req.files?.music?.[0]?.path) {
        fs.unlinkSync(req.files.music[0].path);
      }
      if (req.files?.image?.[0]?.path) {
        fs.unlinkSync(req.files.image[0].path);
      }
    } catch (cleanupError) {
      // Files might not exist, ignore cleanup errors
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error during upload',
      error: error.message,
      details: error.stack
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
