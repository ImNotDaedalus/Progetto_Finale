// =============================================================================
// torneoService.js - funzioni per parlare col backend riguardo ai tornei.
// =============================================================================

import { apiRequest } from './httpClient'

const root = '/torneo'

export const torneoService = {
  // Elenco di tutti i tornei (pubblico).
  getTornei: () => apiRequest(`${root}/`),

  // Dettaglio di un torneo dato il suo id.
  getTorneoById: (id) => apiRequest(`${root}/${id}`),

  // Crea un nuovo torneo. Serve il token: il backend usa il JWT per
  // associare il torneo al suo proprietario (l'utente loggato).
  createTorneo: (payload, token) =>
    apiRequest(`${root}/`, { method: 'POST', body: payload, auth: true, token }),

  // Aggiorna un torneo (solo il proprietario).
  updateTorneo: (id, payload, token) =>
    apiRequest(`${root}/${id}`, { method: 'PUT', body: payload, auth: true, token }),

  // Cancella un torneo (solo il proprietario).
  deleteTorneo: (id, token) =>
    apiRequest(`${root}/${id}`, { method: 'DELETE', auth: true, token }),
}
