import React from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 เรียกใช้ Hook สำหรับเปลี่ยนหน้า

// Import Assets
import welcomeBgImage from '../assets/welcomePage.svg';
import buttonBgImage from '../assets/button.svg';

function WelcomePage() {
  const navigate = useNavigate();

  const handleStart = () => {
    // กดแล้วไปหน้าเลือกกรอบรูป
    navigate('/frame-selection'); 
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-[#fdf6e3]">
      
      {/* 🟢 Layer 0: Background Image (ใช้ img tag ชัวร์สุด) */}
      <img 
        src={welcomeBgImage} 
        alt="Welcome Background" 
        className="absolute inset-0 w-full h-full object-cover z-0" 
      />

      {/* 🟢 Layer 1: Button */}
      {/* ใช้ div wrapper เพื่อจัด layout หรือจะวาง absolute ตรงๆ ตามเดิมก็ได้ */}
      <button 
        onClick={handleStart}
        className="
          absolute
          /* ตำแหน่งตามที่คุณระบุ */
          left-[28%] top-[36.5%]
          
          /* จัด Layer ให้ลอยเหนือพื้นหลัง */
          z-10

          /* Styling */
          font-dancing font-medium text-2xl text-vintage-red
          min-w-[200px] h-[80px] px-4
          
          /* Reset ปุ่มเดิม */
          bg-transparent border-none outline-none
          
          /* รูปปุ่ม */
          bg-no-repeat bg-center bg-[length:100%_100%]
          
          /* Interaction */
          transition-transform duration-200 hover:scale-105 active:scale-95
          cursor-pointer
        "
        style={{ backgroundImage: `url(${buttonBgImage})` }}
      >
        Enter the Booth
      </button>

    </div>
  );
}

export default WelcomePage;