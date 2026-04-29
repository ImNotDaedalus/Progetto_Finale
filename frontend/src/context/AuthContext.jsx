// Questo file tiene il "contesto" dell'utente loggato per tutta l'app:
// token, email della sessione e account collegato. Le pagine leggono
// questi dati con l'hook useAuth().

import { createContext, useEffect, useState } from 'react'
import { accountService, resolveAccountSession } from '../services/accountService'
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from '../services/httpClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Token salvato nel browser (stringa vuota se non loggato).
  const [token, setToken] = useState(() => getStoredToken())
  // Email dell'utente loggato.
  const [sessionEmail, setSessionEmail] = useState('')
  // Dati dell'account loggato (nome, cognome, ...).
  const [currentAccount, setCurrentAccount] = useState(null)
  // Vero finché stiamo ancora verificando se c'è un utente loggato.
  const [authLoading, setAuthLoading] = useState(Boolean(getStoredToken()))

  // Salva il token nel browser e nello stato (o lo cancella se vuoto).
  function persistToken(nextToken) {
    if (nextToken) {
      setStoredToken(nextToken)
    } else {
      clearStoredToken()
    }
    setToken(nextToken ?? '')
  }

  // Chiede al backend i dati dell'utente loggato e li salva in memoria.
  // In caso di errore lascia il token al chiamante, che decide se invalidarlo.
  async function refreshProfile(tokenOverride) {
    const activeToken = tokenOverride ?? token

    if (!activeToken) {
      setSessionEmail('')
      setCurrentAccount(null)
      return null
    }

    setAuthLoading(true)
    try {
      const session = await resolveAccountSession(activeToken)
      setSessionEmail(session.sessionEmail)
      setCurrentAccount(session.currentAccount)
      return session.currentAccount
    } finally {
      setAuthLoading(false)
    }
  }

  // Esegue il login: il backend verifica le credenziali nel database
  // e restituisce un token JWT. Se la verifica fallisce viene lanciato
  // un errore con il messaggio del server.
  async function login(credentials) {
    setAuthLoading(true)
    try {
      const response = await accountService.login(credentials)
      persistToken(response.access_token)
      return response
    } catch (error) {
      persistToken('')
      setAuthLoading(false)
      throw error
    }
  }

  // Dimentica l'utente: cancella token e dati.
  function logout() {
    persistToken('')
    setSessionEmail('')
    setCurrentAccount(null)
    setAuthLoading(false)
  }

  // Al caricamento della pagina, se c'è già un token salvato
  // provo a recuperare il profilo dell'utente.
  useEffect(() => {
    let ignore = false

    async function restoreSession() {
      if (!token) {
        if (!ignore) {
          setAuthLoading(false)
          setSessionEmail('')
          setCurrentAccount(null)
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
        // Profilo non disponibile (es. backend offline): mantengo il token,
        // sarà invalidato solo quando il backend risponderà 401.
        if (!ignore) {
          setSessionEmail('')
          setCurrentAccount(null)
        }
      } finally {
        if (!ignore) setAuthLoading(false)
      }
    }

    restoreSession()

    return () => {
      ignore = true
    }
  }, [token])

  return (
    <AuthContext.Provider
      value={{
        authLoading,
        currentAccount,
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
