import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Import Assets
import MaterialGirlImg from '../assets/MaterialGirl.png';
import EndlessLoveImg from '../assets/EndlessLove.png';
import buttonBgImage from '../assets/button2.svg'; // รูปปุ่ม
import bgPage from '../assets/frameSelectionPage.svg'; // พื้นหลัง

// --- CONFIG ---
const FRAME_CONFIGS = {
  red: {
    bgImage: MaterialGirlImg,
    totalSlots: 9,
    slotWidth: 160,
    slotHeight: 160,
    getPosition: (i) => {
      const startX = 86;
      const startY = 252;
      const gap = 8;
      const col = i % 3;
      const row = Math.floor(i / 3);
      return {
        top: startY + row * (160 + gap),
        left: startX + col * (160 + gap),
        width: 160,
        height: 160,
        transform: 'none',
      };
    },
  },
  blue: {
    bgImage: EndlessLoveImg,
    totalSlots: 4,
    slotWidth: 128,
    slotHeight: 160,
    getPosition: (i) => {
      const startX = 446;
      const startY = 240;
      const gap = 12;
      return {
        top: startY + i * (160 + gap),
        left: startX,
        width: 128,
        height: 160,
        transform: 'rotate(1.4deg)',
      };
    },
  },
};

function PhotoCapturePage() {
  const navigate = useNavigate();
  const { frameId } = useParams();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [photos, setPhotos] = useState([]);
  const [countdown, setCountdown] = useState(null);
  
  const selectedFrame = FRAME_CONFIGS[frameId] ? frameId : 'red';
  const currentConfig = FRAME_CONFIGS[selectedFrame];
  const currentSlotIndex = photos.length;
  const isFinished = currentSlotIndex >= currentConfig.totalSlots;

  // 1. เปิดกล้อง
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(err => console.error("Webcam Error:", err));
    
    return () => {
       if(videoRef.current && videoRef.current.srcObject) {
           videoRef.current.srcObject.getTracks().forEach(track => track.stop());
       }
    };
  }, []);

  // 2. ถ่ายครบ -> ไป Preview
  useEffect(() => {
    if (isFinished) {
      setTimeout(() => {
        navigate('/preview', { state: { photos, selectedFrame } });
      }, 1000);
    }
  }, [isFinished, photos, navigate, selectedFrame]);

  // 3. เริ่มนับถอยหลัง
  const startCountdown = () => {
    if (countdown !== null || isFinished) return;
    setCountdown(3);
    let count = 3;
    const timer = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(timer);
        capture();
        setCountdown(null);
      }
    }, 1000);
  };

  // 4. Capture Logic
  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = currentConfig.getPosition(currentSlotIndex);
    canvas.width = width;
    canvas.height = height;

    const videoRatio = video.videoWidth / video.videoHeight;
    const slotRatio = width / height;
    
    let sWidth, sHeight, sx, sy;
    if (slotRatio > videoRatio) {
      sWidth = video.videoWidth;
      sHeight = video.videoWidth / slotRatio;
      sx = 0;
      sy = (video.videoHeight - sHeight) / 2;
    } else {
      sWidth = video.videoHeight * slotRatio;
      sHeight = video.videoHeight;
      sx = (video.videoWidth - sWidth) / 2;
      sy = 0;
    }

    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, width, height);
    
    const imageSrc = canvas.toDataURL('image/png');
    setPhotos([...photos, imageSrc]);
  };

  return (
    // Wrapper หลัก
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-[#2d3436]">
      
      {/* 🟢 Layer 0: Background Image (ใช้ img tag แทน css background ชัวร์กว่า) */}
      <img 
        src={bgPage} 
        alt="Background" 
        className="absolute inset-0 w-full h-full object-cover z-0" 
      />

      {/* 🟢 Layer 1: Container รูปถ่าย (z-index 10) */}
      <div 
        className="relative shadow-2xl overflow-hidden bg-white"
        style={{ 
          width: '667px', 
          height: '1000px',
          transform: 'scale(0.65)', 
          transformOrigin: 'center center',
          zIndex: 10 
        }}
      >
        {/* Photos */}
        {photos.map((imgSrc, index) => (
          <img 
            key={index}
            src={imgSrc}
            alt={`shot-${index}`}
            className="absolute object-cover border border-gray-100"
            style={{ ...currentConfig.getPosition(index), zIndex: 10 }} 
          />
        ))}

        {/* Live Camera */}
        {!isFinished && (
          <div 
            className="absolute overflow-hidden bg-black"
            style={{ 
              ...currentConfig.getPosition(currentSlotIndex),
              zIndex: 20, 
              boxShadow: '0 0 0 2px #d63031'
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-30">
                <span className="font-kapakana text-white text-6xl drop-shadow-md animate-ping">
                  {countdown}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Frame Overlay */}
        <img 
          src={currentConfig.bgImage} 
          alt="Frame Overlay" 
          className="absolute inset-0 w-full h-full z-40 pointer-events-none"
        />
      </div>

      {/* 🟢 Layer 2: Controls (z-index 50) */}
      {!isFinished && (
        <>
            {/* ปุ่ม Back (ซ้ายล่าง) */}
            <button 
                onClick={() => navigate('/')} 
                className="
                  absolute bottom-24 left-16
                  z-50 
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

            {/* ปุ่ม Shutter (ขวากลาง) */}
            <button 
                onClick={startCountdown}
                disabled={countdown !== null}
                className="
                    absolute right-16 top-1/2 transform -translate-y-1/2
                    z-50
                    font-dancing font-bold text-2xl text-vintage-red
                    min-w-[240px] h-[64px] px-6
                    bg-transparent border-none outline-none
                    bg-no-repeat bg-center bg-[length:100%_100%]
                    transition-transform duration-200 hover:scale-105 active:scale-95
                    cursor-pointer
                    flex items-center justify-center gap-2
                "
                style={{ backgroundImage: `url(${buttonBgImage})` }}
            >
                SNAP! 📸
            </button>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default PhotoCapturePage;