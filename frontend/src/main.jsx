// =============================================================================
// main.jsx - punto di partenza del frontend.
//
// Questo file viene eseguito appena il browser carica la pagina. Il suo
// compito è "montare" l'applicazione React dentro il <div id="root"> dell'
// HTML, avvolgendola in tutti i "fornitori" che le servono:
//   - ThemeProvider: fornisce il tema grafico (colori, font...) a tutta l'app
//   - CssBaseline: applica un reset CSS standard di MUI
//   - BrowserRouter: gestisce la navigazione tra le pagine (URL del sito)
//   - AuthProvider: tiene traccia dell'utente loggato
//   - StrictMode: aiuta a trovare problemi durante lo sviluppo
// =============================================================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { appTheme } from './theme.js'
import './index.css'  // regole CSS globali (vedi index.css)

// "createRoot" prende il <div id="root"> dell'HTML e lo prepara a contenere
// l'app React. Poi "render" disegna l'albero di componenti dentro di lui.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
