// =============================================================================
// squadraService.js - funzioni per parlare col backend riguardo alle squadre.
// =============================================================================

import { apiRequest } from './httpClient'

const root = '/squadra'

export const squadraService = {
  // Elenco di tutte le squadre.
  getSquadre: () => apiRequest(`${root}/`),

  // Dettaglio di una squadra dato il suo id.
  getSquadraById: (id) => apiRequest(`${root}/${id}`),

  // Crea una nuova squadra.
  createSquadra: (payload) => apiRequest(`${root}/`, { method: 'POST', body: payload }),

  // Aggiorna i dati di una squadra.
  updateSquadra: (id, payload) =>
    apiRequest(`${root}/${id}`, { method: 'PUT', body: payload }),

  // Cancella una squadra.
  deleteSquadra: (id) => apiRequest(`${root}/${id}`, { method: 'DELETE' }),
}
