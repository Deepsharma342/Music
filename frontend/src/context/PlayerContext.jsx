import { createContext, useState, useEffect } from "react";
import axios from 'axios';

export const PlayerContext = createContext();

export const PlayerContextProvider = ({ children }) => {
  // Updated to use your Render backend URL
  const backendUrl = 'https://music-2tui.onrender.com';
  
  // Debug: Log the backend URL
  console.log("Backend URL:", backendUrl);
  
  const [songsData, setSongsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Attempting to fetch from:", `${backendUrl}/api/admin/get-music`);
      
      const { data } = await axios.get(`${backendUrl}/api/admin/get-music`, {
        withCredentials: true, // Include if using cookies/sessions
        headers: {
          'Content-Type': 'application/json',
          // Add any other required headers
        }
      });
      
      if (data.success) {
        console.log("Fetched songs:", data.musics);
        setSongsData(data.musics || []); // Ensure we always have an array
      } else {
        console.error("API responded with success: false", data.message || data);
        setError(data.message || "Failed to load songs");
      }
    } catch (error) {
      let errorMessage = "Failed to fetch songs";
      
      if (error.response) {
        console.error(`Server Error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
        console.error("Response data:", error.response.data);
        errorMessage = error.response.data?.message || `Server Error: ${error.response.status}`;
      } else if (error.request) {
        console.error("Network Error: No response received", error.request);
        console.error("Request details:", error.request);
        errorMessage = "Network Error: Could not connect to server";
      } else {
        console.error("Request Error:", error.message);
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const values = {
    backendUrl,
    songsData,
    fetchSongs,
    loading,
    error
  };

  return (
    <PlayerContext.Provider value={values}>
      {children}
    </PlayerContext.Provider>
  );
};