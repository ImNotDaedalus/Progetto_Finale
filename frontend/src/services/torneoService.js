// Funzioni per parlare con il backend riguardo ai tornei.
import { apiRequest } from './httpClient'

const torneoRoot = '/torneo'

export const torneoService = {
  // Elenco di tutti i tornei.
  getTornei() {
    return apiRequest(`${torneoRoot}/`)
  },

  // Dettaglio di un torneo tramite id.
  getTorneoById(id) {
    return apiRequest(`${torneoRoot}/${id}`)
  },

  // Crea un nuovo torneo. Serve il token: il backend usa il JWT per
  // associare il torneo al suo proprietario.
  createTorneo(payload, token) {
    return apiRequest(`${torneoRoot}/`, {
      method: 'POST',
      body: payload,
      auth: true,
      token,
    })
  },

  // Aggiorna un torneo (solo il proprietario).
  updateTorneo(id, payload, token) {
    return apiRequest(`${torneoRoot}/${id}`, {
      method: 'PUT',
      body: payload,
      auth: true,
      token,
    })
  },

  // Cancella un torneo (solo il proprietario).
  deleteTorneo(id, token) {
    return apiRequest(`${torneoRoot}/${id}`, {
      method: 'DELETE',
      auth: true,
      token,
    })
  },
}
