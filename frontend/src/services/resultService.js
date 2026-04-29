// Risultati delle gare. Ogni risultato collega due squadre alla stessa gara
// e contiene i goal segnati. Anche questo va in localStorage.
//   id, id_gara, id_torneo, id_squadra_casa, id_squadra_ospite,
//   gol_casa, gol_ospite
import { addItem, readList, removeItem, updateItem } from './localStore'

const KEY = 'dritta_risultati'

export const resultService = {
  getRisultati() {
    return readList(KEY)
  },

  getRisultatiPerSquadra(idSquadra) {
    return readList(KEY).filter(
      (risultato) =>
        risultato.id_squadra_casa === idSquadra ||
        risultato.id_squadra_ospite === idSquadra,
    )
  },

  getRisultatiPerTorneo(idTorneo) {
    return readList(KEY).filter((risultato) => risultato.id_torneo === idTorneo)
  },

  createRisultato(payload) {
    return addItem(KEY, payload)
  },

  updateRisultato(id, changes) {
    updateItem(KEY, id, changes)
  },

  removeRisultato(id) {
    removeItem(KEY, id)
  },
}

// Conta vittorie, pareggi, sconfitte di una squadra.
export function calcolaStatistiche(risultati, idSquadra) {
  let vittorie = 0
  let pareggi = 0
  let sconfitte = 0

  for (const risultato of risultati) {
    const isCasa = risultato.id_squadra_casa === idSquadra
    const isOspite = risultato.id_squadra_ospite === idSquadra
    if (!isCasa && !isOspite) continue

    const propri = isCasa ? risultato.gol_casa : risultato.gol_ospite
    const avversari = isCasa ? risultato.gol_ospite : risultato.gol_casa

    if (propri > avversari) vittorie += 1
    else if (propri < avversari) sconfitte += 1
    else pareggi += 1
  }

  return { vittorie, pareggi, sconfitte }
}
