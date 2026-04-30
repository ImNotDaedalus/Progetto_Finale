// =============================================================================
// App.jsx - "mappa" delle pagine del sito.
//
// React Router permette di avere più pagine pur restando in un'unica pagina
// HTML: cambiando l'indirizzo nella barra del browser (es. /tornei, /squadre)
// React mostra il componente giusto. Questo file dice quale componente
// corrisponde a quale indirizzo.
//
// La rotta /auth è separata: chi non è loggato la vede senza il layout (sidebar
// + header). Tutte le altre rotte sono "figlie" di AppLayout, quindi mostrano
// la sidebar e l'header.
// =============================================================================

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
      {/* Pagina di login/registrazione: senza sidebar. */}
      <Route path="/auth" element={<AuthPage />} />

      {/* Tutte le altre rotte sono dentro il layout principale (sidebar + header). */}
      <Route element={<AppLayout />}>
        {/* "/" reindirizza a "/home" così l'utente non vede una pagina vuota. */}
        <Route path="/" element={<Navigate replace to="/home" />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/account" element={<AccountsPage />} />
        {/* :id è un parametro dinamico (es. /profilo/42). */}
        <Route path="/profilo/:id" element={<ProfilePage />} />
        <Route path="/tornei" element={<TournamentsPage />} />
        <Route path="/torneo/:id" element={<TournamentPage />} />
        <Route path="/squadre" element={<SquadrePage />} />
        <Route path="/squadra/:id" element={<TeamPage />} />
        <Route path="/gare" element={<GarePage />} />
        <Route path="/notifiche" element={<NotificationsPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        {/* "*" cattura qualsiasi indirizzo non riconosciuto e lo manda alla pagina 404. */}
        <Route path="*" element={<Navigate replace to="/404" />} />
      </Route>
    </Routes>
  )
}
