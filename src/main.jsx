import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import AppStateProvider from './state/AppStateProvider.jsx'
import './styles/global.scss'

// HashRouter keeps the route after the # so refreshing a deep link
// never asks GitHub Pages for a file that doesn't exist (no 404s).
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppStateProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </AppStateProvider>
  </StrictMode>,
)
