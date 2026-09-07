import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import 'video.js/dist/video-js.css'

// Global capture for PWA install prompt to guarantee it is never missed
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  window.__pwaInstallPrompt = e
  window.dispatchEvent(new CustomEvent('pwa-prompt-ready'))
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
