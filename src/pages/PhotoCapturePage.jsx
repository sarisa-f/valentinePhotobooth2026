import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadPhoto } from '../utils/uploadPhoto';

// Import Assets
import MaterialGirlImg from '../assets/MaterialGirl.png';
import EndlessLoveImg from '../assets/EndlessLove.png';
import buttonBgImage from '../assets/button.svg'; 
import button2BgImage from '../assets/button2.svg'; 
import bgPage from '../assets/frameSelectionPage.svg';

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
        transform: 'rotate(1deg)',     
      };
    },
  },
};

function PhotoCapturePage() {
  const navigate = useNavigate();
  const { frameId } = useParams();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [photos, setPhotos] = useState([]);
  const [countdown, setCountdown] = useState(null);
  
  const selectedFrame = FRAME_CONFIGS[frameId] ? frameId : 'red';
  const currentConfig = FRAME_CONFIGS[selectedFrame];
  const currentSlotIndex = photos.length;
  const isFinished = currentSlotIndex >= currentConfig.totalSlots;

  // Upload Photo
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || isFinished) return;

    const { width, height } =
      currentConfig.getPosition(currentSlotIndex);

    const imageSrc = await uploadPhoto({
      file,
      slotWidth: width,
      slotHeight: height,
    });

    setPhotos([...photos, imageSrc]);
    e.target.value = '';
  };

  // 1. เปิดกล้อง
  useEffect(() => {
    const constraints = {
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        facingMode: "user"
      }
    };

    navigator.mediaDevices.getUserMedia(constraints)
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
      }, 1500);
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
    
    const SCALE = 3; 
    canvas.width = width * SCALE;
    canvas.height = height * SCALE;

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

    ctx.scale(SCALE, SCALE);
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, width, height);
    
    const imageSrc = canvas.toDataURL('image/jpeg', 0.95);
    setPhotos([...photos, imageSrc]);
  };

  // 5. Logic ลบรูปล่าสุด
  const undoLastPhoto = () => {
    if (photos.length > 0) {
      setPhotos(prev => prev.slice(0, -1));
    }
  };

  // Style
  const actionButtonClass = `
    font-dancing font-bold text-2xl text-vintage-red
    min-w-[150px] h-[50px]
    md:min-w-[240px] md:h-[64px]
    px-6
    bg-transparent border-none outline-none
    bg-no-repeat bg-center bg-[length:100%_100%]
    transition-transform duration-200
    hover:scale-105 active:scale-95
    cursor-pointer
    disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed
  `;
  
  const navButtonClass = `
    absolute z-50 
    font-dancing font-bold text-2xl text-vintage-red
    min-w-[150px] h-[50px]
    md:min-w-[240px] md:h-[64px] 
    px-6
    bg-transparent border-none outline-none
    bg-no-repeat bg-center bg-[length:100%_100%]
    transition-transform duration-200 hover:scale-105 active:scale-95
    cursor-pointer
    disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed
  `;

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-[#2d3436]">
      
      <img src={bgPage} alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" />

      {/* Container แสดงผล */}
      <div 
        className="relative shadow-2xl overflow-hidden bg-white transition-transform duration-300"
        style={{ 
          width: '667px', 
          height: '1000px',
          transform: 'scale(0.6)', 
          transformOrigin: 'center center',
          zIndex: 10 
        }}
      >
        {photos.map((imgSrc, index) => (
          <img 
            key={index}
            src={imgSrc}
            alt={`shot-${index}`}
            className="absolute object-cover border border-gray-100"
            style={{ ...currentConfig.getPosition(index), zIndex: 10 }} 
          />
        ))}

        {!isFinished && (
          <div 
            className="absolute overflow-hidden bg-black"
            style={{ 
              ...currentConfig.getPosition(currentSlotIndex),
              zIndex: 20, 
              boxShadow: '0 0 0 2px #FFFFFF' 
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
                <span className="font-dancing text-white text-6xl drop-shadow-md animate-ping">
                  {countdown}
                </span>
              </div>
            )}
          </div>
        )}

        <img src={currentConfig.bgImage} alt="Frame Overlay" className="absolute inset-0 w-full h-full z-40 pointer-events-none" />
      </div>

      {/* Controls */}
      {!isFinished && (
        <>
            {/* 1. ปุ่ม Back */}
            <button 
                onClick={() => navigate('/frame-selection')} 
                className={navButtonClass}
                style={{ 
                    backgroundImage: `url(${button2BgImage})`,
                    bottom: '32px', 
                    left: '32px' 
                }}
            >
                Back
            </button>

            {/* 2. ✨ ปุ่ม Retake (แก้ไขแล้ว: ไม่หายตอนนับถอยหลัง) */}
            {photos.length > 0 && (
                <button 
                    onClick={undoLastPhoto}
                    disabled={countdown !== null} // ห้ามกดตอนนับถอยหลัง
                    className={navButtonClass}
                    style={{ 
                        backgroundImage: `url(${button2BgImage})`,
                        bottom: '32px', 
                        right: '32px',
                    }}
                >
                    Retake ↩
                </button>
            )}

            {/* 3. Action Buttons */}
            <div className="absolute bottom-28 right-12 md:right-32 md:top-1/2 md:-translate-y-1/2 z-50 flex flex-col gap-6 items-end">
                <button
                onClick={startCountdown}
                disabled={countdown !== null}
                className={actionButtonClass}
                style={{ backgroundImage: `url(${buttonBgImage})` }}
                >
                SNAP! 📸
                </button>

                <button
                onClick={() => fileInputRef.current?.click()}
                className={actionButtonClass}
                style={{ backgroundImage: `url(${buttonBgImage})` }}
                >
                Upload Photo
                </button>

                <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleUpload}
                />
            </div>
        </>
      )}

      {/* Credits */}
      <div
        target="_blank"
        rel="noopener noreferrer"
        className="
          absolute bottom-16 w-full text-center
          z-20
          font-dancing text-vintage-red
          text-lg
          transition-colors duration-300
        "
      >
        Developed with by @sarisa-f, @isandwish
      </div>

      <canvas ref={canvasRef} className="hidden" />

    </div>
  );
}

export default PhotoCapturePage;