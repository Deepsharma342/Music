import { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { PlayerContext } from '../context/PlayerContext';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UploadSong = () => {
  const { backendUrl, fetchSongs } = useContext(PlayerContext);
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [song, setSong] = useState(null);
  const [songData, setSongData] = useState({
    title: '',
    artist: ''
  });

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!image || !song || !songData.title || !songData.artist) {
      toast.error('Please fill in all fields and upload both files.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', songData.title);
      formData.append('artist', songData.artist);
      formData.append('music', song);
      formData.append('image', image);

      const { data } = await axios.post(`${backendUrl}/api/admin/add-music`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.success) {
        toast.success(data.message || "Uploaded successfully!");
        setSongData({ title: '', artist: '' });
        setImage(null);
        setSong(null);
        fetchSongs(); // Refresh global context song list
        navigate('/list-songs');
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error occurred. Song not uploaded.");
    }
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setSongData({ ...songData, [name]: value });
  };

  return (
    <div className='h-screen flex items-center justify-center bg-gray-100 px-4'>
      <form
        onSubmit={onSubmitHandler}
        className='flex flex-col gap-8 text-gray-600 w-full max-w-3xl p-6 sm:p-8 shadow-2xl rounded-xl bg-white'
        encType="multipart/form-data"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-center text-[#1DB954]">Upload New Song</h2>

        <div className='flex flex-col md:flex-row gap-8 items-center justify-between'>
          {/* Song Upload */}
          <div className='flex flex-col items-center gap-2'>
            <p className='text-sm md:text-base font-medium'>Upload Song</p>
            <input
              type='file'
              id='song'
              accept='audio/*'
              hidden
              onChange={(e) => setSong(e.target.files[0])}
            />
            <label htmlFor='song'>
              <img
                src={song ? assets.upload_song : assets.upload_area}
                className='w-24 h-24 md:w-32 md:h-32 cursor-pointer object-contain border rounded-lg'
                alt='Upload Song'
              />
            </label>
            {song && <p className='text-xs text-gray-500'>{song.name}</p>}
          </div>

          {/* Image Upload */}
          <div className='flex flex-col items-center gap-2'>
            <p className='text-sm md:text-base font-medium'>Upload Cover Image</p>
            <input
              type='file'
              id='image'
              accept='image/*'
              hidden
              onChange={(e) => setImage(e.target.files[0])}
            />
            <label htmlFor='image'>
              <img
                src={image ? URL.createObjectURL(image) : assets.upload_area}
                className='w-24 h-24 md:w-32 md:h-32 cursor-pointer object-cover border rounded-lg'
                alt='Upload Cover'
              />
            </label>
            {image && <p className='text-xs text-gray-500'>{image.name}</p>}
          </div>
        </div>

        {/* Song Details */}
        <div className='flex flex-col gap-4'>
          <div>
            <label htmlFor='title' className='text-sm font-medium'>Song Title</label>
            <input
              id='title'
              name='title'
              type='text'
              value={songData.title}
              onChange={onChangeHandler}
              className='mt-1 w-full px-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-[#1DB954]'
              placeholder='Enter song title'
              required
            />
          </div>
          <div>
            <label htmlFor='artist' className='text-sm font-medium'>Artist Name</label>
            <input
              id='artist'
              name='artist'
              type='text'
              value={songData.artist}
              onChange={onChangeHandler}
              className='mt-1 w-full px-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-[#1DB954]'
              placeholder='Enter artist name'
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          className='mt-4 bg-[#1DB954] text-white py-3 rounded-lg font-semibold hover:bg-[#159f46] transition duration-200 shadow-md'
        >
          Upload Song
        </button>

        <ToastContainer position='bottom-right' autoClose={3000} />
      </form>
    </div>
  );
};

export default UploadSong;
