// =============================================================================
// garaService.js - funzioni per parlare col backend riguardo alle gare.
// Ogni funzione corrisponde a una rotta del controller delle gare.
// =============================================================================

import { apiRequest } from './httpClient'

const root = '/gara'

export const garaService = {
  // Elenco di tutte le gare (pubblico, non serve token).
  getGare: () => apiRequest(`${root}/`),

  // Dettaglio di una gara dato il suo id.
  getGaraById: (id) => apiRequest(`${root}/${id}`),

  // Crea una nuova gara. Solo il proprietario del torneo collegato è
  // autorizzato lato backend, quindi serve il token.
  createGara: (payload, token) =>
    apiRequest(`${root}/`, { method: 'POST', body: payload, auth: true, token }),

  // Aggiorna i dati di una gara (solo il proprietario del torneo).
  updateGara: (id, payload, token) =>
    apiRequest(`${root}/${id}`, { method: 'PUT', body: payload, auth: true, token }),

  // Cancella una gara (solo il proprietario del torneo).
  deleteGara: (id, token) =>
    apiRequest(`${root}/${id}`, { method: 'DELETE', auth: true, token }),
}
