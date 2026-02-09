import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Import Assets
import MaterialGirlImg from '../assets/MaterialGirl.png';
import EndlessLoveImg from '../assets/EndlessLove.png';
import buttonBgImage from '../assets/button2.svg'; 
import bgPage from '../assets/frameSelectionPage.svg'; 

// --- CONFIG ---
const FRAME_CONFIGS = {
  red: {
    bgImage: MaterialGirlImg,
    width: 667, 
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
      const startX = 446; 
      const startY = 240; 
      const gap = 12;      
      return { 
        x: startX, 
        y: startY + i * (160 + gap), 
        w: 128, 
        h: 160, 
        deg: 1.2 
      };
    },
  },
};

const PreviewPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  
  const { photos, selectedFrame } = state || { photos: [], selectedFrame: 'red' };
  const currentConfig = FRAME_CONFIGS[selectedFrame] || FRAME_CONFIGS['red']; // กัน Error

  const [finalImage, setFinalImage] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!photos || photos.length === 0) {
      navigate('/'); 
      return;
    }
    generateImage();
  }, [photos]);

  const generateImage = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // 1. ตั้งขนาด Canvas + ความชัดระดับ HD (x4)
    const SCALE = 4;
    canvas.width = currentConfig.width * SCALE;
    canvas.height = currentConfig.height * SCALE;
    ctx.scale(SCALE, SCALE);

    // ✨✨ เทสีขาวทั้งแผ่นก่อนเลย (แก้ปัญหาขอบดำ/เล็งไม่ตรง) ✨✨
    // เหมือนเราเตรียมกระดาษขาวไว้ก่อนวาดรูปครับ
    ctx.fillStyle = '#FFFFFF'; 
    ctx.fillRect(0, 0, currentConfig.width, currentConfig.height);

    // Helper: โหลดรูป
    const loadImage = (src) => new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      img.onload = () => resolve(img);
    });

    try {
        const loadedPhotos = await Promise.all(photos.map(src => loadImage(src)));
        
        // 2. วาดรูปถ่ายทีละรูป
        loadedPhotos.forEach((img, i) => {
          const { x, y, w, h, deg } = currentConfig.getPosition(i);
          
          ctx.save();
          // ย้ายจุดหมุนไปตรงกลางรูป
          ctx.translate(x + w / 2, y + h / 2); 
          ctx.rotate((deg * Math.PI) / 180);

          // วาดรูปถ่ายทับลงไป
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
          ctx.restore();
        });

        // 3. วาดกรอบเฟรมทับ (Layer บนสุด)
        const frameImg = await loadImage(currentConfig.bgImage);
        ctx.drawImage(frameImg, 0, 0, currentConfig.width, currentConfig.height);

        // 4. Save เป็น JPG 
        setFinalImage(canvas.toDataURL('image/jpeg', 0.95));
        setLoading(false);

    } catch (error) {
        console.error("Error generating image:", error);
        setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!finalImage) return;
    const link = document.createElement('a');
    link.href = finalImage;
    link.download = `photobooth-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-[#2d3436]">
      <img src={bgPage} alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" />
      <canvas ref={canvasRef} className="hidden" />

      <div className="z-10 flex flex-col items-center gap-4 relative w-full h-full justify-center">
        {loading ? (
           <div className="text-white text-2xl font-bold animate-pulse">Creating High-Res Photo... 📸</div>
        ) : (
          <div 
            className="bg-white shadow-2xl p-1 md:p-2 rotate-1 transition-transform hover:scale-105 duration-300"
            style={{ maxHeight: '70vh' }}
          >
            <img 
                src={finalImage} 
                alt="Final Result" 
                className="block h-full w-auto object-contain max-h-[65vh]" 
            />
          </div>
        )}

        {!loading && (
            <div className="flex gap-4 mt-4">
                <button 
                onClick={() => navigate('/')} 
                className="font-dancing font-bold text-xl md:text-2xl text-vintage-red w-[160px] h-[50px] md:w-[200px] md:h-[64px] bg-transparent border-none outline-none bg-no-repeat bg-center bg-[length:100%_100%] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                style={{ backgroundImage: `url(${buttonBgImage})` }}
                >
                Try again
                </button>

                <button 
                onClick={handleDownload} 
                className="font-dancing font-bold text-xl md:text-2xl text-vintage-red w-[160px] h-[50px] md:w-[200px] md:h-[64px] bg-transparent border-none outline-none bg-no-repeat bg-center bg-[length:100%_100%] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                style={{ backgroundImage: `url(${buttonBgImage})` }}
                >
                Save Photo 📥
                </button>
            </div>
        )}
      </div>

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
};

export default PreviewPage;