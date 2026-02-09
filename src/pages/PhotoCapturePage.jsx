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
      // ค่าตำแหน่งต้องตรงกับหน้า PreviewPage.jsx
      const startX = 446; 
      const startY = 240;
      const gap = 12;
      return {
        top: startY + i * (160 + gap), // เรียงลงมาตรงๆ
        left: startX,                  // ซ้ายเท่าเดิมตลอด
        width: 128,
        height: 160,
        transform: 'rotate(1deg)',     // เอียง 1 องศา
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

    // Reset Photo
    e.target.value = '';
  };

  // 1. เปิดกล้อง (แก้ไข: บังคับความชัด HD)
  useEffect(() => {
    const constraints = {
      video: {
        width: { ideal: 1920 }, // ขอความกว้างสูงสุด
        height: { ideal: 1080 }, // ขอความสูงสูงสุด
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

  // 4. Capture Logic (แก้ไข: เพิ่มความชัด 3 เท่า)
  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    
    // ดึงขนาดช่องที่จะใส่รูป
    const { width, height } = currentConfig.getPosition(currentSlotIndex);
    
    // 🔥 [แก้ไขจุดสำคัญ] เพิ่มตัวคูณความชัด (Scale Factor)
    const SCALE = 3; // คูณ 3 เท่า (ยิ่งเยอะยิ่งชัด)

    // ตั้งค่า Canvas ให้ใหญ่กว่าปกติ 3 เท่า
    canvas.width = width * SCALE;
    canvas.height = height * SCALE;

    // คำนวณสัดส่วนการ Crop (Crop Center)
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

    // 🔥 [แก้ไขจุดสำคัญ] สั่งขยาย Context และวาด
    ctx.scale(SCALE, SCALE); // สั่งขยายทุกอย่าง 3 เท่า
    
    // กลับด้านรูป (Mirror Effect)
    ctx.translate(width, 0);
    ctx.scale(-1, 1);

    // วาดรูป (ใช้ width, height เดิมได้เลย เพราะ ctx.scale จัดการให้แล้ว)
    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, width, height);
    
    // Export เป็น JPEG คุณภาพสูง (0.95 = 95%)
    const imageSrc = canvas.toDataURL('image/jpeg', 0.95);
    setPhotos([...photos, imageSrc]);
  };

  // ---------- Shared Button Style ----------
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
    disabled:opacity-50
  `;

  return (
    // Wrapper หลัก
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-[#2d3436]">
      
      {/* 🟢 Layer 0: Background Image */}
      <img 
        src={bgPage} 
        alt="Background" 
        className="absolute inset-0 w-full h-full object-cover z-0" 
      />

      {/* 🟢 Layer 1: Container แสดงผล (User เห็นอันนี้) */}
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
        {/* Photos ที่ถ่ายเสร็จแล้ว */}
        {photos.map((imgSrc, index) => (
          <img 
            key={index}
            src={imgSrc}
            alt={`shot-${index}`}
            className="absolute object-cover border border-gray-100"
            style={{ ...currentConfig.getPosition(index), zIndex: 10 }} 
          />
        ))}

        {/* Live Camera (ช่องที่กำลังจะถ่าย) */}
        {!isFinished && (
          <div 
            className="absolute overflow-hidden bg-black"
            style={{ 
              ...currentConfig.getPosition(currentSlotIndex),
              zIndex: 20, 
              boxShadow: '0 0 0 2px #FFFFFF' // กรอบสีFFFFFFบอกตำแหน่ง
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
            {/* ตัวนับถอยหลัง */}
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-30">
                <span className="font-dancing text-white text-6xl drop-shadow-md animate-ping">
                  {countdown}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Frame Overlay (กรอบบังหน้า) */}
        <img 
          src={currentConfig.bgImage} 
          alt="Frame Overlay" 
          className="absolute inset-0 w-full h-full z-40 pointer-events-none"
        />
      </div>

      {/* 🟢 Layer 2: Controls ปุ่มกด */}
      {!isFinished && (
        <>
            {/* ปุ่ม Back */}
            <button 
                onClick={() => navigate('/frame-selection')} 
                className="
                  absolute bottom-8 left-8
                  md:bottom-24 md:left-16
                  z-50 
                  font-dancing font-bold text-2xl text-vintage-red
                  min-w-[150px] h-[50px]
                  md:min-w-[240px] md:h-[64px] 
                  px-6
                  bg-transparent border-none outline-none
                  bg-no-repeat bg-center bg-[length:100%_100%]
                  transition-transform duration-200 hover:scale-105 active:scale-95
                  cursor-pointer
                "
                style={{ backgroundImage: `url(${button2BgImage})` }}
            >
                Back
            </button>

            {/* SNAP */}
            <div className="absolute bottom-8 right-8 md:right-16 md:top-1/2 md:-translate-y-1/2 z-50 flex flex-col gap-10">
            <button
              onClick={startCountdown}
              disabled={countdown !== null}
              className={actionButtonClass}
              style={{ backgroundImage: `url(${buttonBgImage})` }}
            >
              SNAP! 📸
            </button>

            {/* Upload Photo */}
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

      {/* Canvas ลับ (เอาไว้ประมวลผลรูป ไม่แสดงบนจอ) */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default PhotoCapturePage;