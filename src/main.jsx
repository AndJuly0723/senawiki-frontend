import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './styles/global.css'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import Heroes from './pages/Heroes.jsx'
import Community from './pages/Community.jsx'
import CommunityWrite from './pages/CommunityWrite.jsx'
import CommunityDetail from './pages/CommunityDetail.jsx'
import CommunityEdit from './pages/CommunityEdit.jsx'
import Info from './pages/Info.jsx'
import InfoDetail from './pages/InfoDetail.jsx'
import InfoWrite from './pages/InfoWrite.jsx'
import InfoEdit from './pages/InfoEdit.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import HeroDetail from './pages/HeroDetail.jsx'
import Pets from './pages/Pets.jsx'
import PetDetail from './pages/PetDetail.jsx'
import GuidesAdventure from './pages/GuidesAdventure.jsx'
import GuidesRaid from './pages/GuidesRaid.jsx'
import GuidesRaidStage from './pages/GuidesRaidStage.jsx'
import GuidesArena from './pages/GuidesArena.jsx'
import GuidesTotalWar from './pages/GuidesTotalWar.jsx'
import GuidesGrowthDungeon from './pages/GuidesGrowthDungeon.jsx'
import GuidesGrowthStage from './pages/GuidesGrowthStage.jsx'
import GuidesDeckWrite from './pages/GuidesDeckWrite.jsx'
import GuildSiege from './pages/GuildSiege.jsx'
import GuildSiegeDay from './pages/GuildSiegeDay.jsx'
import GuildWar from './pages/GuildWar.jsx'
import GuildExpedition from './pages/GuildExpedition.jsx'
import GuildExpeditionStage from './pages/GuildExpeditionStage.jsx'

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
        <Route path="/community/write" element={<CommunityWrite />} />
        <Route path="/community/:id" element={<CommunityDetail />} />
        <Route path="/community/:id/edit" element={<CommunityEdit />} />
        <Route path="/info" element={<Info />} />
        <Route path="/info/write" element={<InfoWrite />} />
        <Route path="/info/:id" element={<InfoDetail />} />
        <Route path="/info/:id/edit" element={<InfoEdit />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/guides/adventure" element={<GuidesAdventure />} />
        <Route path="/guides/adventure/write" element={<GuidesDeckWrite mode="adventure" />} />
        <Route path="/guides/raid" element={<GuidesRaid />} />
        <Route path="/guides/raid/:raidId" element={<GuidesRaidStage />} />
        <Route path="/guides/raid/:raidId/write" element={<GuidesDeckWrite mode="raid" />} />
        <Route path="/guides/arena" element={<GuidesArena />} />
        <Route path="/guides/arena/write" element={<GuidesDeckWrite mode="arena" />} />
        <Route path="/guides/total-war" element={<GuidesTotalWar />} />
        <Route path="/guides/total-war/write" element={<GuidesDeckWrite mode="total-war" />} />
        <Route path="/guides/growth-dungeon" element={<GuidesGrowthDungeon />} />
        <Route path="/guides/growth-dungeon/:stageId" element={<GuidesGrowthStage />} />
        <Route path="/guides/growth-dungeon/:stageId/write" element={<GuidesDeckWrite mode="growth" />} />
        <Route path="/guild/siege" element={<GuildSiege />} />
        <Route path="/guild/siege/:day" element={<GuildSiegeDay />} />
        <Route path="/guild/siege/:day/write" element={<GuidesDeckWrite mode="siege" />} />
        <Route path="/guild/guild-war" element={<GuildWar />} />
        <Route path="/guild/guild-war/write" element={<GuidesDeckWrite mode="guild-war" />} />
        <Route path="/guild/expedition" element={<GuildExpedition />} />
        <Route path="/guild/expedition/:expeditionId" element={<GuildExpeditionStage />} />
        <Route path="/guild/expedition/:expeditionId/write" element={<GuidesDeckWrite mode="expedition" />} />
      </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
