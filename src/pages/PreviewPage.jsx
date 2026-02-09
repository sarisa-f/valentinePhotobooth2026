import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Import Assets (รูปเดิมที่ใช้)
import MaterialGirlImg from '../assets/MaterialGirl.png';
import EndlessLoveImg from '../assets/EndlessLove.png';
import buttonBgImage from '../assets/button2.svg'; 
import bgPage from '../assets/frameSelectionPage.svg'; 

// --- CONFIG (ก๊อปปี้มาจากหน้า Capture เพื่อให้ตำแหน่งตรงกันเป๊ะ) ---
// *อนาคตถ้าโปรเจคใหญ่ขึ้น ควรแยกไฟล์นี้ไปไว้ที่ src/config.js ครับ
const FRAME_CONFIGS = {
  red: {
    bgImage: MaterialGirlImg,
    width: 667, // ขนาดเฟรมจริง
    height: 1000,
    getPosition: (i) => {
      const startX = 86;
      const startY = 252;
      const gap = 8;
      const col = i % 3;
      const row = Math.floor(i / 3);
      return { x: startX + col * (160 + gap), y: startY + row * (160 + gap), w: 160, h: 160, deg: 0 };
    },
  },
  blue: {
    bgImage: EndlessLoveImg,
    width: 667,
    height: 1000,
    getPosition: (i) => {
      const startX = 451; // เช็คค่านี้กับหน้า Capture ให้ตรงกันนะครับ
      const startY = 240;
      const gap = 10;
      // 🟢 ใส่ค่าองศาที่จูนไว้จากหน้า Capture มาใส่ตรงนี้ด้วย
      const rotates = [1, -2, 0, 3]; 
      return { 
        x: startX, 
        y: startY + i * (160 + gap), 
        w: 128, 
        h: 160, 
        deg: rotates[i] || 0 
      };
    },
  },
};

const PreviewPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  
  // รับข้อมูลรูปถ่ายมาจากหน้า Capture
  const { photos, selectedFrame } = state || { photos: [], selectedFrame: 'red' };
  const currentConfig = FRAME_CONFIGS[selectedFrame];

  const [finalImage, setFinalImage] = useState(null); // รูปผลลัพธ์ที่จะโชว์
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!photos || photos.length === 0) {
      navigate('/'); // ถ้าไม่มีรูป เด้งกลับหน้าแรก
      return;
    }
    generateImage();
  }, [photos]);

  // ฟังก์ชันวาดรูปรวมร่าง (Merge)
  const generateImage = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // 1. ตั้งขนาด Canvas เท่ากับขนาดจริงของเฟรม
    canvas.width = currentConfig.width;
    canvas.height = currentConfig.height;

    // Helper: โหลดรูปให้เสร็จก่อนวาด
    const loadImage = (src) => new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
    });

    // 2. โหลดรูปถ่ายทั้งหมด
    const loadedPhotos = await Promise.all(photos.map(src => loadImage(src)));
    
    // 3. วาดรูปถ่ายลงไปก่อน (Layer ล่าง)
    loadedPhotos.forEach((img, i) => {
      const { x, y, w, h, deg } = currentConfig.getPosition(i);
      
      ctx.save();
      // ย้ายจุดหมุนไปตรงกลางรูป
      ctx.translate(x + w / 2, y + h / 2); 
      // หมุนภาพ (แปลง องศา เป็น radian)
      ctx.rotate((deg * Math.PI) / 180);
      // วาดรูป (ขยับจุดวาดกลับไปที่มุมซ้ายบนของตัวเอง)
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    });

    // 4. วาดกรอบเฟรมทับ (Layer บน)
    const frameImg = await loadImage(currentConfig.bgImage);
    ctx.drawImage(frameImg, 0, 0, currentConfig.width, currentConfig.height);

    // 5. แปลง Canvas เป็นรูปภาพ (Base64)
    setFinalImage(canvas.toDataURL('image/png'));
    setLoading(false);
  };

  const handleDownload = () => {
    if (!finalImage) return;
    const link = document.createElement('a');
    link.href = finalImage;
    link.download = `photobooth-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-[#2d3436]">
      
      {/* Background Page */}
      <img src={bgPage} alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" />

      {/* Canvas ที่เราใช้วาด (ซ่อนไว้ ไม่ให้ user เห็น) */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="z-10 flex flex-col items-center">
        
        {/* รูปผลลัพธ์ (แสดงตรงกลาง) */}
        {loading ? (
           <div className="text-white text-2xl font-bold animate-pulse">Generatng your photo...</div>
        ) : (
          <div 
            className="bg-white shadow-2xl p-2 rotate-1" // ใส่กรอบขาว + เอียงนิดๆ ให้ดูเก๋
            style={{ transform: 'scale(0.55)' }} // ย่อลงมาหน่อยจะได้ไม่เต็มจอเกินไป
          >
            <img src={finalImage} alt="Final Result" className="block" />
          </div>
        )}
      </div>

      {/* ปุ่มกด (Controls) */}
      <div className="absolute bottom-10 left-0 w-full flex justify-center items-center gap-6 z-50">
        
        {/* ปุ่ม Home / Start Over */}
        <button 
          onClick={() => navigate('/')} 
          className="
            font-dancing font-bold text-2xl text-vintage-red
            min-w-[200px] h-[64px]
            bg-transparent border-none outline-none
            bg-no-repeat bg-center bg-[length:100%_100%]
            hover:scale-105 active:scale-95 transition-transform
          "
          style={{ backgroundImage: `url(${buttonBgImage})` }}
        >
          New Game
        </button>

        {/* ปุ่ม Download */}
        <button 
          onClick={handleDownload} 
          className="
            font-dancing font-bold text-2xl text-vintage-red
            min-w-[200px] h-[64px]
            bg-transparent border-none outline-none
            bg-no-repeat bg-center bg-[length:100%_100%]
            hover:scale-105 active:scale-95 transition-transform
          "
          style={{ backgroundImage: `url(${buttonBgImage})` }}
        >
          Save Photo 📥
        </button>

      </div>

    </div>
  );
};

export default PreviewPage;