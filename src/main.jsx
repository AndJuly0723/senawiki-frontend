import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './styles/global.css'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import Heroes from './pages/Heroes.jsx'
import Community from './pages/Community.jsx'
import HeroDetail from './pages/HeroDetail.jsx'
import Pets from './pages/Pets.jsx'
import PetDetail from './pages/PetDetail.jsx'
import GuidesAdventure from './pages/GuidesAdventure.jsx'
import GuidesRaid from './pages/GuidesRaid.jsx'
import GuidesArena from './pages/GuidesArena.jsx'
import GuidesTotalWar from './pages/GuidesTotalWar.jsx'
import GuidesGrowthDungeon from './pages/GuidesGrowthDungeon.jsx'
import GuidesGrowthStage from './pages/GuidesGrowthStage.jsx'
import GuildSiege from './pages/GuildSiege.jsx'
import GuildWar from './pages/GuildWar.jsx'
import GuildExpedition from './pages/GuildExpedition.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
        <Route index element={<Home />} />
        <Route path="/heroes" element={<Heroes />} />
        <Route path="/heroes/:heroId" element={<HeroDetail />} />
        <Route path="/pets" element={<Pets />} />
        <Route path="/pets/:petId" element={<PetDetail />} />
        <Route path="/community" element={<Community />} />
        <Route path="/guides/adventure" element={<GuidesAdventure />} />
        <Route path="/guides/raid" element={<GuidesRaid />} />
        <Route path="/guides/arena" element={<GuidesArena />} />
        <Route path="/guides/total-war" element={<GuidesTotalWar />} />
        <Route path="/guides/growth-dungeon" element={<GuidesGrowthDungeon />} />
        <Route path="/guides/growth-dungeon/:stageId" element={<GuidesGrowthStage />} />
        <Route path="/guild/siege" element={<GuildSiege />} />
        <Route path="/guild/guild-war" element={<GuildWar />} />
        <Route path="/guild/expedition" element={<GuildExpedition />} />
      </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
