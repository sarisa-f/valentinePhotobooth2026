// src/pages/FrameSelectionPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import buttonBgImage from '../assets/button2.svg';
import p2 from '../assets/frameSelectionPage.svg';
import MaterialGirlImg from '../assets/MaterialGirl.png';
import EndlessLoveImg from '../assets/EndlessLove.png';

function FrameSelectionPage({ onFrameSelect }) {
  const navigate = useNavigate();

  // ฟังก์ชันเลือกเฟรม -> ส่งไป URL ตาม ID
  const handleSelect = (frameId) => {
    navigate(`/capture/${frameId}`); // เช่น /capture/red
  };

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center"
      style={{ backgroundImage: `url("${p2}")` }} 
    >
      
      {/* --- ส่วนเนื้อหา (Content) --- */}
      <div className="z-10 flex flex-col items-center w-full max-w-6xl px-4">

        {/* --- หัวข้อ --- */}
        <h2 className="font-kapakana text-5xl sm:text-7xl text-vintage-red mb-2 drop-shadow-md tracking-wider">
          Pick a Frame
        </h2>

        {/* --- Grid เลือกกรอบ --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 mb-2">
          
          {/* 1. Solo (Material Girl) */}
          <div 
            onClick={() => handleSelect('red')}
            className="group cursor-pointer flex flex-col items-center gap-4 transition-transform hover:scale-105"
          >
             {/* ตัวกรอบ */}
             {/* เพิ่ม overflow-hidden เพื่อไม่ให้รูปมันล้นกรอบออกมา */}
             <div className="w-72 h-108 bg-white shadow-2xl flex flex-col items-center justify-center gap-2 group-hover:shadow-[0_0_20px_#685143] overflow-hidden">
                
                {/* 👇 ใส่รูปตรงนี้ครับ */}
                <img 
                  src={MaterialGirlImg} 
                  alt="Material Girl" 
                  className="w-full h-full object-cover" 
                />

             </div>
             
             {/* ชื่อ */}
             <span className="font-dancing text-2xl text-vintage-red drop-shadow-sm group-hover:text-[#685143]">
                Material Girl
             </span>
          </div>

          {/* 2. Couple (Endless Love) */}
          <div 
            onClick={() => handleSelect('blue')}
            className="group cursor-pointer flex flex-col items-center gap-4 transition-transform hover:scale-105"
          >
             {/* ตัวกรอบ */}
             {/* เพิ่ม overflow-hidden เพื่อไม่ให้รูปมันล้นกรอบออกมา */}
             <div className="w-72 h-108 bg-white shadow-2xl flex flex-col items-center justify-center gap-2 group-hover:shadow-[0_0_20px_#685143] overflow-hidden">
                
                {/* 👇 ใส่รูปตรงนี้ครับ */}
                <img 
                  src={EndlessLoveImg} 
                  alt="Endless Love" 
                  className="w-full h-full object-cover" 
                />

             </div>
             
             {/* ชื่อ */}
             <span className="font-dancing text-2xl text-vintage-red drop-shadow-sm group-hover:text-[#685143]">
                Endless Love
             </span>
          </div>

          {/* 3. Friends 
          <div 
            onClick={() => onFrameSelect('gold')}
            className="group cursor-pointer flex flex-col items-center gap-4 transition-transform hover:scale-105"
          >
             <div className="w-48 h-72 bg-white shadow-2xl flex flex-col items-center justify-center gap-2 group-hover:shadow-[0_0_20px_#685143]">
             </div>
             <span className="font-dancing text-2xl text-vintage-red drop-shadow-sm group-hover:text-[#685143]">
                Wanna Have Fun
             </span>
          </div>*/}

        </div>
      </div>

      <button 
          onClick={() => navigate('/')} 
          className="
            absolute bottom-24 left-16 
            
            z-20 /* กันเหนียวไว้ เผื่อมีอะไรบัง */
            font-dancing font-bold text-2xl text-vintage-red
            min-w-[240px] h-[64px] px-6
            bg-transparent border-none outline-none
            bg-no-repeat bg-center bg-[length:100%_100%]
            transition-transform duration-200 hover:scale-105 active:scale-95
            cursor-pointer
          "
          style={{ backgroundImage: `url(${buttonBgImage})` }}
        >
          Back
      </button>

      {/* Credits */}
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

export default FrameSelectionPage;