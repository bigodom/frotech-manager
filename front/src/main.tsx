import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import AppRoutes from './Routes'
import { Toaster } from "@/components/ui/sonner"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRoutes />
    <Toaster
      position="bottom-left"
      richColors
      closeButton
      />
  </React.StrictMode>,
)
