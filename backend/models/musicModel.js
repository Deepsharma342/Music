import mongoose from 'mongoose';
const musicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  imageUrl: { type: String, required: true },
  audioUrl: { type: String, required: true },
});
const Music = mongoose.model('Music', musicSchema);
export default Music;

