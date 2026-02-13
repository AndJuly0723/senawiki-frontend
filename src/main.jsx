import { StrictMode, Suspense, lazy, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
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
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'

const loadCommunityWrite = () => import('./pages/CommunityWrite.jsx')
const loadCommunityEdit = () => import('./pages/CommunityEdit.jsx')
const loadInfoWrite = () => import('./pages/InfoWrite.jsx')
const loadInfoEdit = () => import('./pages/InfoEdit.jsx')
const loadGuidesAdventure = () => import('./pages/GuidesAdventure.jsx')
const loadGuidesRaid = () => import('./pages/GuidesRaid.jsx')
const loadGuidesRaidStage = () => import('./pages/GuidesRaidStage.jsx')
const loadGuidesArena = () => import('./pages/GuidesArena.jsx')
const loadGuidesTotalWar = () => import('./pages/GuidesTotalWar.jsx')
const loadGuidesGrowthDungeon = () => import('./pages/GuidesGrowthDungeon.jsx')
const loadGuidesGrowthStage = () => import('./pages/GuidesGrowthStage.jsx')
const loadGuidesDeckWrite = () => import('./pages/GuidesDeckWrite.jsx')
const loadGuildSiege = () => import('./pages/GuildSiege.jsx')
const loadGuildSiegeDay = () => import('./pages/GuildSiegeDay.jsx')
const loadGuildWar = () => import('./pages/GuildWar.jsx')
const loadGuildExpedition = () => import('./pages/GuildExpedition.jsx')
const loadGuildExpeditionStage = () => import('./pages/GuildExpeditionStage.jsx')
const loadAdmin = () => import('./pages/Admin.jsx')
const loadAdminHeroCreate = () => import('./pages/AdminHeroCreate.jsx')
const loadAdminPetCreate = () => import('./pages/AdminPetCreate.jsx')
const loadAdminStats = () => import('./pages/AdminStats.jsx')
const loadTerms = () => import('./pages/Terms.jsx')
const loadPrivacyPolicy = () => import('./pages/PrivacyPolicy.jsx')
const loadMyPage = () => import('./pages/MyPage.jsx')

const CommunityWrite = lazy(loadCommunityWrite)
const CommunityEdit = lazy(loadCommunityEdit)
const InfoWrite = lazy(loadInfoWrite)
const InfoEdit = lazy(loadInfoEdit)
const GuidesAdventure = lazy(loadGuidesAdventure)
const GuidesRaid = lazy(loadGuidesRaid)
const GuidesRaidStage = lazy(loadGuidesRaidStage)
const GuidesArena = lazy(loadGuidesArena)
const GuidesTotalWar = lazy(loadGuidesTotalWar)
const GuidesGrowthDungeon = lazy(loadGuidesGrowthDungeon)
const GuidesGrowthStage = lazy(loadGuidesGrowthStage)
const GuidesDeckWrite = lazy(loadGuidesDeckWrite)
const GuildSiege = lazy(loadGuildSiege)
const GuildSiegeDay = lazy(loadGuildSiegeDay)
const GuildWar = lazy(loadGuildWar)
const GuildExpedition = lazy(loadGuildExpedition)
const GuildExpeditionStage = lazy(loadGuildExpeditionStage)
const Admin = lazy(loadAdmin)
const AdminHeroCreate = lazy(loadAdminHeroCreate)
const AdminPetCreate = lazy(loadAdminPetCreate)
const AdminStats = lazy(loadAdminStats)
const Terms = lazy(loadTerms)
const PrivacyPolicy = lazy(loadPrivacyPolicy)
const MyPage = lazy(loadMyPage)

const preloadGuideAndGuildRoutes = () =>
  Promise.allSettled([
    loadGuidesAdventure(),
    loadGuidesRaid(),
    loadGuidesRaidStage(),
    loadGuidesArena(),
    loadGuidesTotalWar(),
    loadGuidesGrowthDungeon(),
    loadGuidesGrowthStage(),
    loadGuidesDeckWrite(),
    loadGuildSiege(),
    loadGuildSiegeDay(),
    loadGuildWar(),
    loadGuildExpedition(),
    loadGuildExpeditionStage(),
  ])

export function AppRoutes() {
  const location = useLocation()
  const backgroundLocation = location.state?.backgroundLocation

  useEffect(() => {
    const runPreload = () => {
      preloadGuideAndGuildRoutes()
    }
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(runPreload, { timeout: 1200 })
      return () => window.cancelIdleCallback(id)
    }
    const timer = window.setTimeout(runPreload, 300)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <>
      <Routes location={backgroundLocation || location}>
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
      {backgroundLocation ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      ) : null}
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<div className="page-loading">Loading...</div>}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
