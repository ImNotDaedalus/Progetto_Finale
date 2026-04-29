// Funzioni per parlare con il backend riguardo agli account.
// Ogni funzione corrisponde a una rotta del server Flask.
import { apiRequest } from './httpClient'

const accountRoot = '/account'

export const accountService = {
  // Fa login e riceve il token JWT.
  login(credentials) {
    return apiRequest(`${accountRoot}/login`, { method: 'POST', body: credentials })
  },

  // Registra un nuovo account.
  register(payload) {
    return apiRequest(`${accountRoot}/`, { method: 'POST', body: payload })
  },

  // Scarica la lista di tutti gli account (serve il token).
  getAccounts(token) {
    return apiRequest(`${accountRoot}/`, { auth: true, token })
  },

  // Scarica un singolo account tramite il suo id.
  getAccountById(id, token) {
    return apiRequest(`${accountRoot}/${id}`, { auth: true, token })
  },

  // Chiede al backend chi è l'utente collegato al token.
  getProtectedSession(token) {
    return apiRequest(`${accountRoot}/protected`, { auth: true, token })
  },

  // Aggiorna i dati di un account.
  updateAccount(id, payload, token) {
    return apiRequest(`${accountRoot}/${id}`, {
      method: 'PUT',
      body: payload,
      auth: true,
      token,
    })
  },

  // Cancella un account.
  deleteAccount(id, token) {
    return apiRequest(`${accountRoot}/${id}`, { method: 'DELETE', auth: true, token })
  },
}

// Dato un token, trova le informazioni dell'utente attualmente loggato.
export async function resolveAccountSession(token) {
  const session = await accountService.getProtectedSession(token)
  const accounts = await accountService.getAccounts(token)
  // Cerca nella lista l'account con la stessa email della sessione.
  const currentAccount =
    accounts.find((account) => account.email === session.logged_in_as) ?? null

  return {
    sessionEmail: session.logged_in_as,
    currentAccount,
    accounts,
  }
}
