import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import หน้าทั้งหมดที่เราทำกันมา
import WelcomePage from './pages/WelcomePage';
import FrameSelectionPage from './pages/FrameSelectionPage';
import PhotoCapturePage from './pages/PhotoCapturePage';
import PreviewPage from './pages/PreviewPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. หน้าแรก (Welcome) */}
        <Route path="/" element={<WelcomePage />} />

        {/* 2. หน้าเลือกกรอบรูป */}
        <Route path="/frame-selection" element={<FrameSelectionPage />} />

        {/* 3. หน้าถ่ายรูป (สังเกต :frameId คือตัวแปรที่จะรับว่าเลือกกรอบสีอะไร) */}
        <Route path="/capture/:frameId" element={<PhotoCapturePage />} />

        {/* 4. หน้าดูรูปผลลัพธ์ */}
        <Route path="/preview" element={<PreviewPage />} />
      </Routes>
    </Router>
  );
}

export default App;