import { createContext, useState, useEffect } from "react";
import axios from 'axios';

export const PlayerContext = createContext();

export const PlayerContextProvider = ({ children }) => {
//const backendUrl = 'http://localhost:4000'
const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [songsData, setSongsData] = useState([]);

 // const fetchSongs = async () => {
   // try {
     // const { data } = await axios.get('/api/admin/get-Music');
      //console.log("Fetched songs:", data.musics); // Debugging tip
      //setSongsData(data.musics);
    //} catch (error) {
      //console.log(error);
   // }
  //};
  const fetchSongs = async () => {
    
  try {
    const { data } = await axios.get('/api/admin/get-music');

    // Check if API returned success true
    if (data.success) {
      console.log("Fetched songs:", data.musics);
      setSongsData(data.musics);
    } else {
      console.error("API responded with success: false", data.message || data);
    }

  } catch (error) {
    // Show exact axios error details
    if (error.response) {
  console.error(`Server Error: ${error.response.status} - ${error.response.data?.message || 'No message'}`);
} else {
  console.error(`Server Error: ${error.message}`);
}

  }
};


  useEffect(() => {
    fetchSongs();
  }, [])
  const values={
    backendUrl,
    songsData,
    fetchSongs
  }

  return (
    <PlayerContext.Provider value={values}>
      {children}
    </PlayerContext.Provider>
  );
};
