import { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { PlayerContext } from '../context/PlayerContext';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';

const UploadSong = () => {
  const { backendUrl, fetchSongs } = useContext(PlayerContext);
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [song, setSong] = useState(null);
  const [songData, setSongData] = useState({
    title: '',
    artist: ""
  });

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', songData.title);
      formData.append('artist', songData.artist);
      formData.append('music', song);
      formData.append('image', image);

      const { data } = await axios.post('/api/admin/add-music', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (data.success) {
        toast.success(data.message);
        navigate('/list-songs');
        setSongData({ title: '', artist: "" });
        setImage(null);
        setSong(null);
        fetchSongs(); // Refresh songs after upload
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error occurred, Song not uploaded");
    }
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setSongData({ ...songData, [name]: value });
  };

  return (
    <div className='h-screen flex items-center'>
      <form onSubmit={onSubmitHandler} className='flex flex-col max-h-screen gap-8 text-gray-600 w-full max-w-xl mx-auto p-4 sm:p-6 md:p-8 shadow-lg rounded-xl shadow-black'>
        <div className='flex flex-col md:flex-row gap-6 items-center'>
          <div className='flex flex-col items-center gap-2'>
            <p className='text-sm md:text-base'>Upload Song</p>
            <input
              type='file'
              id='song'
              onChange={(e) => setSong(e.target.files[0])}
              accept='audio/*'
              hidden
            />
            <label htmlFor='song'>
              <img src={song ? assets.upload_song : assets.upload_area} className='w-24 h-24 md:w-32 md:h-32 cursor-pointer object-contain' alt='' />
            </label>
          </div>
          <div className='flex flex-col items-center gap-2'>
            <p className='text-sm md:text-base'>Upload Image</p>
            <input
              type='file'
              id='image'
              onChange={(e) => setImage(e.target.files[0])}
              accept='image/*'
              hidden
            />
            <label htmlFor='image'>
              <img src={image ? URL.createObjectURL(image) : assets.upload_area} className='w-24 h-24 md:w-32 md:h-32 cursor-pointer object-contain' alt='' />
            </label>
          </div>
          <div className='flex flex-col gap-2 w-full'>
            <label htmlFor='title' className='text-sm md:text-base'>Song Name</label>
            <input
              id='title'
              type='text'
              onChange={onChangeHandler}
              name='title'
              value={songData.title}
              className='bg-transparent w-full p-2.5 rounded-lg outline-none'
              placeholder='Enter song name'
              required
            />
            <label htmlFor='artist' className='text-sm md:text-base'>Artist Name</label>
            <input
              id='artist'
              type='text'
              onChange={onChangeHandler}
              name='artist'
              value={songData.artist}
              className='bg-transparent w-full p-2.5 rounded-lg outline-none'
              placeholder='Artist name'
              required
            />
          </div>
        </div>
        <button type='submit' className='bg-[#1DB954] text-white py-2 px-4 md:py-3 md:px-6 rounded-lg shadow-lg hover:bg-gray-800'>
          Add
        </button>
      </form>
    </div>
  );
};

export default UploadSong;
