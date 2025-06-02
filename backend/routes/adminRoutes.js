import express from 'express'
import {register,login,uploadMusic,getMusic,deleteMusic} from '../controllers/adminController.js'
import upload from '../middleware/multer.js'



const adminRouter=express.Router()

adminRouter.post('/register',register)
adminRouter.post('/login',login)
adminRouter.post('/add-music',upload.fields([{name:'music',maxCount:1},{name:'image',maxCount:1}]),uploadMusic)
//adminRouter.get('/get-Music',getMusic)
// Example safe backend route
adminRouter.get('/get-music', getMusic);
adminRouter.get('/get-music', (req, res) => {
    res.json({ message: "Hello from get-Music" });
});

adminRouter.delete('/delete-Music/:id',deleteMusic)

export default adminRouter