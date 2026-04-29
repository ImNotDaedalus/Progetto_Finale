// Funzioni per parlare con il backend riguardo alle squadre.
import { apiRequest } from './httpClient'

const squadraRoot = '/squadra'

export const squadraService = {
  // Elenco di tutte le squadre.
  getSquadre() {
    return apiRequest(`${squadraRoot}/`)
  },

  // Dettaglio di una squadra tramite id.
  getSquadraById(id) {
    return apiRequest(`${squadraRoot}/${id}`)
  },

  // Crea una nuova squadra.
  createSquadra(payload) {
    return apiRequest(`${squadraRoot}/`, { method: 'POST', body: payload })
  },

  // Aggiorna i dati di una squadra.
  updateSquadra(id, payload) {
    return apiRequest(`${squadraRoot}/${id}`, { method: 'PUT', body: payload })
  },

  // Cancella una squadra.
  deleteSquadra(id) {
    return apiRequest(`${squadraRoot}/${id}`, { method: 'DELETE' })
  },
}
