// =============================================================================
// requestService.js - richieste di iscrizione delle squadre ai tornei.
//
// Quando il proprietario di una squadra clicca "iscrivi al torneo", viene
// creata una "richiesta". Il proprietario del torneo vedrà la richiesta e
// potrà accettarla (la squadra entra ufficialmente) o rifiutarla.
//
// Anche queste richieste sono salvate nel localStorage del browser
// (il backend non ha ancora un endpoint dedicato).
//
// Forma di una richiesta:
//   { id, id_squadra, id_torneo, stato: 'pending' | 'accepted' | 'rejected' }
// =============================================================================

import { addItem, readList, removeItem, updateItem } from './localStore'

const KEY = 'dritta_richieste'

export const requestService = {
  // Tutte le richieste presenti.
  getRichieste: () => readList(KEY),

  // Richieste relative a un certo torneo (per la pagina del torneo).
  getRichiestePerTorneo: (idTorneo) =>
    readList(KEY).filter((r) => r.id_torneo === idTorneo),

  // Richieste fatte da una certa squadra (per la pagina della squadra).
  getRichiestePerSquadra: (idSquadra) =>
    readList(KEY).filter((r) => r.id_squadra === idSquadra),

  // Crea una richiesta in stato 'pending'.
  createRichiesta: (idSquadra, idTorneo) =>
    addItem(KEY, { id_squadra: idSquadra, id_torneo: idTorneo, stato: 'pending' }),

  // Cambia lo stato (accettata / rifiutata) — lo fa il proprietario del torneo.
  setStato: (idRichiesta, stato) => updateItem(KEY, idRichiesta, { stato }),

  // Rimuove definitivamente una richiesta.
  removeRichiesta: (idRichiesta) => removeItem(KEY, idRichiesta),
}
