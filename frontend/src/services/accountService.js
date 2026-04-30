// =============================================================================
// accountService.js - funzioni per parlare col backend riguardo agli account.
// Ogni funzione corrisponde a una rotta del server Flask (vedi account_controller.py).
//
// In sintesi: quando una pagina vuole "fare login", "registrare un utente" o
// "leggere la lista degli account", chiama una di queste funzioni.
// =============================================================================

import { apiRequest } from './httpClient'

const root = '/account'  // tutte le rotte degli account iniziano con /account

export const accountService = {
  // Login: spedisce email/password e riceve indietro un token JWT.
  login: (credentials) => apiRequest(`${root}/login`, { method: 'POST', body: credentials }),

  // Registrazione di un nuovo account.
  register: (payload) => apiRequest(`${root}/`, { method: 'POST', body: payload }),

  // Lista di tutti gli account (richiede di essere loggato).
  getAccounts: (token) => apiRequest(`${root}/`, { auth: true, token }),

  // Singolo account dato il suo id.
  getAccountById: (id, token) => apiRequest(`${root}/${id}`, { auth: true, token }),

  // Chiede al backend chi è l'utente collegato al token (rotta "protected").
  getProtectedSession: (token) => apiRequest(`${root}/protected`, { auth: true, token }),

  // Aggiorna i dati di un account (richiede di essere loggato).
  updateAccount: (id, payload, token) =>
    apiRequest(`${root}/${id}`, { method: 'PUT', body: payload, auth: true, token }),

  // Cancella un account.
  deleteAccount: (id, token) =>
    apiRequest(`${root}/${id}`, { method: 'DELETE', auth: true, token }),
}

/**
 * Dato un token JWT, recupera in un colpo solo:
 *  - l'email dell'utente loggato
 *  - i dati dell'account corrispondente
 *  - la lista completa degli account (utile in altre pagine)
 *
 * Promise.all manda le due richieste IN PARALLELO (non una dopo l'altra),
 * così è più veloce.
 */
export async function resolveAccountSession(token) {
  const [session, accounts] = await Promise.all([
    accountService.getProtectedSession(token),
    accountService.getAccounts(token),
  ])
  // Cerca tra tutti gli account quello con la stessa email del token.
  const currentAccount =
    accounts.find((account) => account.email === session.logged_in_as) ?? null
  return { sessionEmail: session.logged_in_as, currentAccount, accounts }
}
