import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx' // Ensure .tsx extension if not relying on module resolution entirely
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
