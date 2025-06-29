import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { MdDelete } from 'react-icons/md';
import { IoIosMicrophone } from "react-icons/io";
import axios from "axios";
import { toast } from 'react-toastify';

const MusicCard = ({ music, fetchSongs }) => {
  const { backendUrl } = useContext(PlayerContext);

  // Return loading state if music is not available
  if (!music) {
    return (
      <div className="bg-gradient-to-b from-black to-gray-400 text-white rounded-lg shadow-lg overflow-hidden p-4 h-64 flex items-center justify-center">
        <div>Loading song data...</div>
      </div>
    );
  }

  // Safely handle file paths with fallbacks
  const getAudioSrc = () => {
    if (!music.filePath) return '';
    try {
      return `${backendUrl}/${music.filePath.replace(/\\/g, '/')}`;
    } catch (error) {
      console.error("Error processing audio path:", error);
      return '';
    }
  };

  const getImageSrc = () => {
    if (!music.imageFilePath) return '/placeholder-music.jpg';
    try {
      return `${backendUrl}/${music.imageFilePath.replace(/\\/g, '/')}`;
    } catch (error) {
      console.error("Error processing image path:", error);
      return '/placeholder-music.jpg';
    }
  };

  const audioSrc = getAudioSrc();
  const imageSrc = getImageSrc();

  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(`${backendUrl}/api/admin/delete-music/${id}`);
      if (data.success) {
        toast.success(data.message);
        fetchSongs();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || 'Failed to delete song');
    }
  };

  return (
    <div className="bg-gradient-to-b from-black to-gray-400 text-white rounded-lg shadow-lg overflow-hidden transition-transform transform relative hover:scale-[1.02]">
      {/* Image with error handling */}
      <img
        src={imageSrc}
        alt={music.title || 'Music cover'}
        className="w-full h-40 object-cover object-top hover:scale-105 transition-all duration-300"
        onError={(e) => {
          e.target.src = '/placeholder-music.jpg';
        }}
      />
      
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold truncate">
            {music.title || 'Untitled Song'}
          </h3>
          
          <MdDelete 
            onClick={() => handleDelete(music._id)} 
            className="text-lg absolute top-4 right-4 hover:text-2xl transition cursor-pointer hover:text-red-500"
            title="Delete song"
          />
        </div>
        
        <div className="flex items-center justify-start gap-2 mt-1">
          <IoIosMicrophone className="text-gray-300" />
          <span className="text-gray-300">
            {music.artist || 'Unknown Artist'}
          </span>
        </div>
        
        <p className="text-sm mt-2 text-gray-400">
          <span className="text-xs">Uploaded: </span>
          {music.createdAt ? new Date(music.createdAt).toLocaleDateString() : 'Unknown date'}
        </p>
        
        {/* Audio player with fallback */}
        <div className="mt-3">
          {audioSrc ? (
            <audio controls className="w-full">
              <source src={audioSrc} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          ) : (
            <div className="text-red-400 text-sm py-2">
              Audio file not available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicCard;