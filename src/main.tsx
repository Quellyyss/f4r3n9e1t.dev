import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import './styles/tokens.css'
import './styles/base.css'
import App from './app/App'
import { site } from './config/site.config'

document.title = site.brand.siteTitle

// a note for whoever opens the console
console.log(
  `%c${site.brand.signature} ${site.brand.nick}%c\nYou found the console. Type “render” on the page for the viewport.`,
  'font: 600 14px monospace; color: #ff2b2b; text-shadow: 0 0 6px #ff2b2b',
  'font: 12px monospace; color: #a7abb1',
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
