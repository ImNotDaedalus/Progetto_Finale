// Richieste di partecipazione di una squadra a un torneo.
// Anche qui usiamo il localStorage. Una richiesta ha:
//   id, id_squadra, id_torneo, stato ('pending' | 'accepted' | 'rejected')
import { addItem, readList, removeItem, updateItem } from './localStore'

const KEY = 'dritta_richieste'

export const requestService = {
  getRichieste() {
    return readList(KEY)
  },

  getRichiestePerTorneo(idTorneo) {
    return readList(KEY).filter((richiesta) => richiesta.id_torneo === idTorneo)
  },

  getRichiestePerSquadra(idSquadra) {
    return readList(KEY).filter((richiesta) => richiesta.id_squadra === idSquadra)
  },

  createRichiesta(idSquadra, idTorneo) {
    return addItem(KEY, {
      id_squadra: idSquadra,
      id_torneo: idTorneo,
      stato: 'pending',
    })
  },

  setStato(idRichiesta, stato) {
    updateItem(KEY, idRichiesta, { stato })
  },

  removeRichiesta(idRichiesta) {
    removeItem(KEY, idRichiesta)
  },
}
