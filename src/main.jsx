import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './styles/global.css'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import Heroes from './pages/Heroes.jsx'
import Community from './pages/Community.jsx'
import Info from './pages/Info.jsx'
import HeroDetail from './pages/HeroDetail.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
        <Route index element={<Home />} />
        <Route path="/heroes" element={<Heroes />} />
        <Route path="/heroes/:heroId" element={<HeroDetail />} />
        <Route path="/community" element={<Community />} />
        <Route path="/info" element={<Info />} />
      </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
