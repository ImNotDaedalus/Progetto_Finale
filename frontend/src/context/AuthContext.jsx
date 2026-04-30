// =============================================================================
// AuthContext.jsx - "memoria condivisa" sull'utente loggato.
//
// Cosa fa il "Context" in React? Permette di condividere dei dati con tutti
// i componenti dell'app SENZA doverli passare manualmente di pagina in pagina.
// Qui memorizziamo:
//   - il token JWT (la "tessera digitale" del login)
//   - l'email della sessione
//   - l'oggetto completo dell'account loggato
//   - se siamo ancora "in caricamento" (autenticazione in verifica)
//
// Le pagine usano l'hook useAuth() per leggere/usare questi dati.
// =============================================================================

import { createContext, useEffect, useState } from 'react'
import { accountService, resolveAccountSession } from '../services/accountService'
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from '../services/httpClient'

// Crea il contesto vuoto. Useremo il Provider per riempirlo con dati veri.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // ---- Stato condiviso ----
  // Il token salvato nel browser (stringa vuota se non loggato).
  const [token, setToken] = useState(() => getStoredToken())
  // Email dell'utente loggato (la otteniamo dalla rotta /protected del backend).
  const [sessionEmail, setSessionEmail] = useState('')
  // Dati completi dell'account loggato (nome, cognome, ecc.).
  const [currentAccount, setCurrentAccount] = useState(null)
  // True finché stiamo ancora controllando il token: utile per non mostrare
  // "non sei loggato" un istante prima di aver finito di verificare.
  const [authLoading, setAuthLoading] = useState(Boolean(getStoredToken()))

  // Salva il token nel browser (e nello stato), oppure lo cancella.
  function persistToken(nextToken) {
    if (nextToken) setStoredToken(nextToken)
    else clearStoredToken()
    setToken(nextToken ?? '')
  }

  // Resetta i dati di sessione (email + account) senza toccare il token.
  function clearSession() {
    setSessionEmail('')
    setCurrentAccount(null)
  }

  // Chiede al backend i dati aggiornati dell'utente loggato e li salva qui.
  // Si usa, ad esempio, dopo che l'utente ha modificato il proprio profilo.
  async function refreshProfile(tokenOverride) {
    const activeToken = tokenOverride ?? token
    if (!activeToken) {
      // Niente token = nessuna sessione attiva.
      clearSession()
      return null
    }
    setAuthLoading(true)
    try {
      const session = await resolveAccountSession(activeToken)
      setSessionEmail(session.sessionEmail)
      setCurrentAccount(session.currentAccount)
      return session.currentAccount
    } finally {
      // Comunque vada (successo o errore), togliamo la "rotellina di caricamento".
      setAuthLoading(false)
    }
  }

  // Login: il backend verifica le credenziali e restituisce un token JWT.
  // Se le credenziali sono sbagliate, lancia un errore col messaggio del server.
  async function login(credentials) {
    setAuthLoading(true)
    try {
      const response = await accountService.login(credentials)
      persistToken(response.access_token)
      return response
    } catch (error) {
      // Per sicurezza, se il login fallisce cancelliamo eventuali token vecchi.
      persistToken('')
      setAuthLoading(false)
      throw error
    }
  }

  // Logout: dimentica completamente l'utente.
  function logout() {
    persistToken('')
    clearSession()
    setAuthLoading(false)
  }

  // Effetto: appena si carica la pagina (o cambia il token) proviamo a
  // recuperare il profilo dell'utente. Così se un utente già loggato
  // ricarica la pagina, viene riconosciuto in automatico.
  useEffect(() => {
    let ignore = false  // serve a non aggiornare lo stato se il componente è già stato smontato

    async function restoreSession() {
      if (!token) {
        // Niente token: smettiamo di caricare e azzeriamo i dati di sessione.
        if (!ignore) {
          setAuthLoading(false)
          clearSession()
        }
        return
      }
      try {
        const session = await resolveAccountSession(token)
        if (!ignore) {
          setSessionEmail(session.sessionEmail)
          setCurrentAccount(session.currentAccount)
        }
      } catch {
        // Backend offline o errore di rete: manteniamo il token (sarà
        // invalidato solo se il server risponde 401 alla prossima chiamata).
        if (!ignore) clearSession()
      } finally {
        if (!ignore) setAuthLoading(false)
      }
    }

    restoreSession()
    // Cleanup: se il componente viene smontato prima della fine, ignoriamo i risultati.
    return () => {
      ignore = true
    }
  }, [token])

  // Qui esponiamo l'oggetto che le pagine vedranno tramite useAuth().
  return (
    <AuthContext.Provider
      value={{
        authLoading,
        currentAccount,
        // Comodo: "isAuthenticated" è true solo se c'è un token.
        isAuthenticated: Boolean(token),
        login,
        logout,
        refreshProfile,
        sessionEmail,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
