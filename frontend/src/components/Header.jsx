import React, { useState } from "react";
import NewReleases from "./NewReleases";

const Header = () => {
  const [currentSongImage, setCurrentSongImage] = useState(null);
  const [currentSongTitle, setCurrentSongTitle] = useState(null);

  return (
    <>
      <header
        className="relative bg-cover bg-no-repeat bg-top h-96 flex items-center justify-center text-white"
        style={{
          backgroundImage:`url('https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80')`
        }}
      ></header>

      <NewReleases
        setCurrentSongImage={setCurrentSongImage}
        setCurrentSongTitle={setCurrentSongTitle}
      />
    </>
  );
};

export default Header;
