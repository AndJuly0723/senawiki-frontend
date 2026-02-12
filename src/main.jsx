import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './styles/global.css'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import Heroes from './pages/Heroes.jsx'
import HeroDetail from './pages/HeroDetail.jsx'
import Pets from './pages/Pets.jsx'
import PetDetail from './pages/PetDetail.jsx'
import Community from './pages/Community.jsx'
import CommunityDetail from './pages/CommunityDetail.jsx'
import Info from './pages/Info.jsx'
import InfoDetail from './pages/InfoDetail.jsx'

const CommunityWrite = lazy(() => import('./pages/CommunityWrite.jsx'))
const CommunityEdit = lazy(() => import('./pages/CommunityEdit.jsx'))
const InfoWrite = lazy(() => import('./pages/InfoWrite.jsx'))
const InfoEdit = lazy(() => import('./pages/InfoEdit.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const GuidesAdventure = lazy(() => import('./pages/GuidesAdventure.jsx'))
const GuidesRaid = lazy(() => import('./pages/GuidesRaid.jsx'))
const GuidesRaidStage = lazy(() => import('./pages/GuidesRaidStage.jsx'))
const GuidesArena = lazy(() => import('./pages/GuidesArena.jsx'))
const GuidesTotalWar = lazy(() => import('./pages/GuidesTotalWar.jsx'))
const GuidesGrowthDungeon = lazy(() => import('./pages/GuidesGrowthDungeon.jsx'))
const GuidesGrowthStage = lazy(() => import('./pages/GuidesGrowthStage.jsx'))
const GuidesDeckWrite = lazy(() => import('./pages/GuidesDeckWrite.jsx'))
const GuildSiege = lazy(() => import('./pages/GuildSiege.jsx'))
const GuildSiegeDay = lazy(() => import('./pages/GuildSiegeDay.jsx'))
const GuildWar = lazy(() => import('./pages/GuildWar.jsx'))
const GuildExpedition = lazy(() => import('./pages/GuildExpedition.jsx'))
const GuildExpeditionStage = lazy(() => import('./pages/GuildExpeditionStage.jsx'))
const Admin = lazy(() => import('./pages/Admin.jsx'))
const AdminHeroCreate = lazy(() => import('./pages/AdminHeroCreate.jsx'))
const AdminPetCreate = lazy(() => import('./pages/AdminPetCreate.jsx'))
const AdminStats = lazy(() => import('./pages/AdminStats.jsx'))
const Terms = lazy(() => import('./pages/Terms.jsx'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'))
const MyPage = lazy(() => import('./pages/MyPage.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<div className="page-loading">로딩 중...</div>}>
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
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/heroes" element={<AdminHeroCreate />} />
            <Route path="/admin/pets" element={<AdminPetCreate />} />
            <Route path="/admin/stats" element={<AdminStats />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/mypage" element={<MyPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
