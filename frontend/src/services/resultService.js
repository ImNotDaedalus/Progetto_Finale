// =============================================================================
// resultService.js - risultati delle partite.
//
// Ogni risultato registra una partita giocata: chi ha giocato, quanti gol
// hanno segnato. Anche questi sono salvati nel localStorage del browser
// (perché il backend non ha ancora un endpoint dedicato).
//
// Forma di un risultato:
//   { id, id_gara, id_torneo, id_squadra_casa, id_squadra_ospite,
//     gol_casa, gol_ospite }
// =============================================================================

import { addItem, readList, removeItem, updateItem } from './localStore'

const KEY = 'dritta_risultati'

export const resultService = {
  // Tutti i risultati presenti.
  getRisultati: () => readList(KEY),

  // Risultati in cui una certa squadra ha giocato (in casa o in trasferta).
  getRisultatiPerSquadra: (idSquadra) =>
    readList(KEY).filter(
      (r) => r.id_squadra_casa === idSquadra || r.id_squadra_ospite === idSquadra,
    ),

  // Risultati di un certo torneo.
  getRisultatiPerTorneo: (idTorneo) =>
    readList(KEY).filter((r) => r.id_torneo === idTorneo),

  // Crea un nuovo risultato.
  createRisultato: (payload) => addItem(KEY, payload),

  // Aggiorna un risultato (es. correggere un punteggio).
  updateRisultato: (id, changes) => updateItem(KEY, id, changes),

  // Rimuove un risultato.
  removeRisultato: (id) => removeItem(KEY, id),
}

/**
 * Conta vittorie, pareggi e sconfitte di una squadra a partire da una lista
 * di risultati. Si usa nella pagina della squadra per mostrare le statistiche.
 */
export function calcolaStatistiche(risultati, idSquadra) {
  const stats = { vittorie: 0, pareggi: 0, sconfitte: 0 }
  for (const r of risultati) {
    // Stabilisce se la squadra giocava in casa o in trasferta.
    const isCasa = r.id_squadra_casa === idSquadra
    const isOspite = r.id_squadra_ospite === idSquadra
    // Se la squadra non c'entra, salta.
    if (!isCasa && !isOspite) continue
    // "propri" = i goal della squadra; "avversari" = i goal degli altri.
    const propri = isCasa ? r.gol_casa : r.gol_ospite
    const avversari = isCasa ? r.gol_ospite : r.gol_casa
    if (propri > avversari) stats.vittorie += 1
    else if (propri < avversari) stats.sconfitte += 1
    else stats.pareggi += 1
  }
  return stats
}
