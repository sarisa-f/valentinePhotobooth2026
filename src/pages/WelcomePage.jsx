import React from 'react';
import { useNavigate } from 'react-router-dom';

// Import Assets
import welcomeBgImage from '../assets/welcomePage.svg';
import buttonBgImage from '../assets/button.svg';

function WelcomePage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/frame-selection'); 
  };

  //const DEVELOPER_NAME = "@sarisa-f, @isandwish";

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-[#fdf6e3]">
      
      {/* 🟢 Layer 0: Background Image */}
      <img 
        src={welcomeBgImage} 
        alt="Welcome Background" 
        className="absolute inset-0 w-full h-full object-cover z-0" 
      />

      {/* 🟢 Layer 1: Button */}
      <button 
        onClick={handleStart}
        className="
          absolute
          left-[28%] top-[36.5%]
          z-10
          font-dancing font-medium text-2xl text-vintage-red
          min-w-[200px] h-[80px] px-4
          bg-transparent border-none outline-none
          bg-no-repeat bg-center bg-[length:100%_100%]
          transition-transform duration-200 hover:scale-105 active:scale-95
          cursor-pointer
        "
        style={{ backgroundImage: `url(${buttonBgImage})` }}
      >
        Enter the Booth
      </button>

      {/* 🟢 Layer 2: Credits */}
      <div
        target="_blank"
        rel="noopener noreferrer"
        className="
          absolute bottom-10 
          right-[52px] text-right
          z-20
          font-dancing text-vintage-red
          text-lg md:text-l
          transition-colors duration-300
        "
      >
        Developed with by @sarisa-f, @isandwish
      </div>

    </div>
  );
}

export default WelcomePage;