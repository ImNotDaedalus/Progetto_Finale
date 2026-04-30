// =============================================================================
// useAuth.jsx - "scorciatoia" per accedere al contesto di autenticazione.
//
// Le pagine, invece di importare direttamente AuthContext, importano questo
// hook: serve a leggere chi è l'utente loggato, fare login/logout, ecc. Se
// per sbaglio una pagina usa questo hook fuori dal AuthProvider, otteniamo
// subito un errore chiaro che spiega il problema.
// =============================================================================

import { useContext } from 'react'
import { AuthContext } from './AuthContext'

export function useAuth() {
  // useContext "legge" i dati condivisi dal AuthProvider più in alto.
  const context = useContext(AuthContext)

  if (!context) {
    // Se non c'è un AuthProvider sopra, lanciamo un errore con un messaggio
    // chiaro per chi sta sviluppando: ricorderà di aggiungerlo.
    throw new Error('useAuth deve essere usato dentro AuthProvider')
  }

  return context
}
