import { useContext, useRef, useState } from "react";
import { FaPlay, FaPause, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";

const NewReleases = () => {
  const { songsData, backendUrl } = useContext(PlayerContext);
  const [playingSong, setPlayingSong] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(new Audio());
  const navigate = useNavigate();

  const handlePauseClick = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handlePlayClick = (song) => {
    if (playingSong && playingSong.id === song._id) {
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current.src = `${backendUrl}/${song.filePath}`;
    audioRef.current.play();
    setPlayingSong(song);

    audioRef.current.onloadedmetadata = () => {
      setDuration(audioRef.current.duration);
    };
    
    audioRef.current.ontimeupdate = () => {
      setCurrentTime(audioRef.current.currentTime);
    };   
  };

  const handleVolumeChange = (e) => {
    const volume = e.target.value;
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  };

  const handleProgressClick = (e) => {
    if (audioRef.current) {
      const progressBar = e.target;
      const newTime = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth * duration;
      audioRef.current.currentTime = newTime;
    }
  };

  return (
    <div className="mt-3 py-2 px-2 mb-16">
      <div className="flex flex-row justify-between items-center text-white">
        <h1 className="text-lg font-bold">New Releases</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/add-music')}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm transition-colors"
          >
            <FaPlus className="text-xs" />
            Add Music
          </button>
          <p className="text-sm text-red-500 hover:text-white cursor-pointer">
            See more
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {songsData.map((release) => (
          <div key={release._id} className="relative group">
            <img
              src={`${backendUrl}/${release.imageFilePath}`}
              alt={release.title}
              className="w-full h-40 object-cover object-top rounded-lg"
            />

            <div className="absolute h-40 w-full inset-0 flex items-end py-2 px-2 justify-end right-4 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                className="bg-red-500 p-3 rounded-full text-white hover:bg-red-600"
                onClick={() => handlePlayClick(release)}
              >
                <FaPlay />
              </button>
            </div>
            
            <div className="mt-2">
              <p className="text-white font-semibold">{release.title}</p>
              <p className="text-gray-400 text-sm">{release.artist}</p>
            </div>

            {playingSong && playingSong.id === release.id && (
              <>
                <div className="bottom-4 w-full flex items-center justify-between z-10">
                  <label htmlFor="volume" className="text-white">
                    Volume
                  </label>
                  <input
                    id="volume"
                    type="range"
                    onChange={handleVolumeChange}
                    min="0"
                    max="100"
                    defaultValue="100"
                    className="w-16 h-0.5"
                  />
                </div>

                <div className="w-full mt-2 h-0.5 cursor-pointer" onClick={handleProgressClick}>
                  <div
                    className="h-full"
                    style={{
                      background: `linear-gradient(to right, #ff0000 ${(currentTime / duration) * 100}%, #fff 0%)`,
                    }}
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewReleases;