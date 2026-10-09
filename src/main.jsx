import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { preload } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import './styles/index.css'
import App from './App.jsx'
// The two above-the-fold faces (hero headline + UI text), preloaded so the first paint
// uses the real fonts instead of swapping them in and shifting the layout.
import playfairLatin from '@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2?url'
import jakartaLatin from '@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2?url'

preload(playfairLatin, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
preload(jakartaLatin, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
