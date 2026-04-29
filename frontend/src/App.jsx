import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layout/AppLayout.jsx'
import AccountsPage from './pages/AccountsPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import GarePage from './pages/GarePage.jsx'
import HomePage from './pages/HomePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import NotificationsPage from './pages/NotificationsPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import SquadrePage from './pages/SquadrePage.jsx'
import TeamPage from './pages/TeamPage.jsx'
import TournamentPage from './pages/TournamentPage.jsx'
import TournamentsPage from './pages/TournamentsPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate replace to="/home" />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/account" element={<AccountsPage />} />
        <Route path="/profilo/:id" element={<ProfilePage />} />
        <Route path="/tornei" element={<TournamentsPage />} />
        <Route path="/torneo/:id" element={<TournamentPage />} />
        <Route path="/squadre" element={<SquadrePage />} />
        <Route path="/squadra/:id" element={<TeamPage />} />
        <Route path="/gare" element={<GarePage />} />
        <Route path="/notifiche" element={<NotificationsPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate replace to="/404" />} />
      </Route>
    </Routes>
  )
}
