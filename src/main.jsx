import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />  {/* ✅ ไม่ต้องมี BrowserRouter ครอบตรงนี้ เพราะใน App.jsx มีแล้ว */}
  </React.StrictMode>,
)