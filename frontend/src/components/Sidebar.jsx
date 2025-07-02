import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdHome } from "react-icons/io";
import { BsGrid1X2 } from "react-icons/bs";
import { CiHeart, CiHeadphones } from "react-icons/ci";
import { GiHamburgerMenu } from "react-icons/gi";
import logo from '../assets/logo.png';
import logo4 from '../assets/logo4.png';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative z-50">
      {/* Mobile hamburger toggle */}
      <button
        className="fixed top-4 left-4 md:hidden p-2 bg-black/70 rounded-full z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <GiHamburgerMenu className="text-white" size={24} />
      </button>

      {/* Sidebar */}
      <div
        className={`bg-gradient-to-b from-black to-gray-800 text-white 
        fixed md:static top-0 left-0 h-full w-64 transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-300 ease-in-out shadow-lg`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center py-6 border-b border-gray-700">
          {/* Desktop logo */}
          <img src={logo} alt="Logo" className="hidden md:block w-40 cursor-pointer" />
          {/* Mobile logo */}
          <img src={logo4} alt="Logo Mobile" className="block md:hidden w-32 cursor-pointer" />
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-4 p-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-4 hover:bg-red-500/80 px-4 py-3 rounded-lg transition-colors"
          >
            <IoMdHome className="text-2xl" />
            <span className="text-lg font-semibold">Home</span>
          </button>

          <button
            onClick={() => navigate('/list-songs')}
            className="flex items-center gap-4 hover:bg-purple-600/80 px-4 py-3 rounded-lg transition-colors"
          >
            <CiHeadphones className="text-2xl" />
            <span className="text-lg font-semibold">Gallery</span>
          </button>

          <button
            onClick={() => navigate('/browser')}
            className="flex items-center gap-4 hover:bg-green-600/80 px-4 py-3 rounded-lg transition-colors"
          >
            <BsGrid1X2 className="text-2xl" />
            <span className="text-lg font-semibold">Browser</span>
          </button>

          <button
            onClick={() => navigate('/favorites')}
            className="flex items-center gap-4 hover:bg-pink-600/80 px-4 py-3 rounded-lg transition-colors"
          >
            <CiHeart className="text-2xl text-pink-400" />
            <span className="text-lg font-semibold">Favorite</span>
          </button>
        </nav>

        {/* Decorative footer */}
        <div className="mt-auto p-4 border-t border-gray-700 text-xs text-gray-400 text-center hidden md:block">
          © 2025 YourMusicApp
        </div>
      </div>

      {/* Optional background overlay when sidebar open on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Sidebar;
