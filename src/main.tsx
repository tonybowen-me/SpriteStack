import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Phaser owns a single long-lived game instance, so we skip StrictMode's
// double-mount which would tear down and re-init the WebGL context.
createRoot(document.getElementById('root')!).render(<App />)
