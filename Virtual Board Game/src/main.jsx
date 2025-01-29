import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './BoardGame.css'
import App from './App.jsx'
import BoardGame from './BoardGame.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
