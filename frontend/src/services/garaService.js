// Funzioni per parlare con il backend riguardo alle gare.
import { apiRequest } from './httpClient'

const garaRoot = '/gara'

export const garaService = {
  // Elenco di tutte le gare.
  getGare() {
    return apiRequest(`${garaRoot}/`)
  },

  // Dettaglio di una gara tramite id.
  getGaraById(id) {
    return apiRequest(`${garaRoot}/${id}`)
  },

  // Crea una nuova gara. Solo il proprietario del torneo collegato e'
  // autorizzato lato backend, quindi serve il token.
  createGara(payload, token) {
    return apiRequest(`${garaRoot}/`, {
      method: 'POST',
      body: payload,
      auth: true,
      token,
    })
  },

  // Aggiorna i dati di una gara (solo il proprietario del torneo).
  updateGara(id, payload, token) {
    return apiRequest(`${garaRoot}/${id}`, {
      method: 'PUT',
      body: payload,
      auth: true,
      token,
    })
  },

  // Cancella una gara (solo il proprietario del torneo).
  deleteGara(id, token) {
    return apiRequest(`${garaRoot}/${id}`, {
      method: 'DELETE',
      auth: true,
      token,
    })
  },
}
