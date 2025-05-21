
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { DataProvider } from './contexts/data/DataContext'
import { Toaster } from './components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'
import { ThemeProvider } from './contexts/ThemeProvider'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <DataProvider>
          <App />
          <Toaster />
          <SonnerToaster position="top-right" closeButton />
        </DataProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
