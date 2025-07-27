import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import MainLayout from './layouts/MainLayout.tsx'
import Home from './pages/Home.tsx'
import Mufredat from './pages/Mufredat.tsx'
import DersNotlari from './pages/DersNotlari.tsx'
import SinavSimulasyonu from './pages/SinavSimulasyonu.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path='/mufredat' element={<Mufredat />} />
          <Route path='/ders-notlari' element={<DersNotlari />} />
          <Route path='/sinav-simulasyonu' element={<SinavSimulasyonu />} />
          {/* Diğer rotalar buraya eklenecek */}
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
