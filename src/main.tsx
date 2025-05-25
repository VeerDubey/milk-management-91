
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Toaster } from './components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'
import { ThemeProvider } from './contexts/ThemeProvider'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
      <Toaster />
      <SonnerToaster position="top-right" closeButton />
    </ThemeProvider>
  </React.StrictMode>,
)
