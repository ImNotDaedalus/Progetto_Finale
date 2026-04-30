// =============================================================================
// inviteService.js - inviti delle squadre ai giocatori.
//
// Quando il proprietario di una squadra invita un giocatore a unirsi, viene
// creato un "invito". Il giocatore lo vedrà nella sua pagina notifiche e
// potrà accettarlo o rifiutarlo.
//
// IMPORTANTE: questi inviti sono salvati nel localStorage del browser
// (vedi localStore.js) perché il backend non ha ancora un endpoint dedicato.
// Sono quindi "locali" all'utente.
//
// Forma di un invito:
//   { id, id_squadra, id_account, stato: 'pending' | 'accepted' | 'rejected' }
// =============================================================================

import { addItem, readList, removeItem, updateItem } from './localStore'

const KEY = 'dritta_inviti'  // nome della "casella" dove salviamo gli inviti

export const inviteService = {
  // Tutti gli inviti memorizzati (di tutte le squadre).
  getInviti: () => readList(KEY),

  // Inviti che riguardano un certo account (per la pagina notifiche del giocatore).
  getInvitiPerAccount: (idAccount) =>
    readList(KEY).filter((i) => i.id_account === idAccount),

  // Inviti spediti da una certa squadra (per la pagina della squadra).
  getInvitiPerSquadra: (idSquadra) =>
    readList(KEY).filter((i) => i.id_squadra === idSquadra),

  // Crea un invito: stato iniziale = 'pending' (in attesa di risposta).
  createInvito: (idSquadra, idAccount) =>
    addItem(KEY, { id_squadra: idSquadra, id_account: idAccount, stato: 'pending' }),

  // Cambia lo stato (es. quando il giocatore accetta o rifiuta).
  setStato: (idInvito, stato) => updateItem(KEY, idInvito, { stato }),

  // Rimuove definitivamente un invito.
  removeInvito: (idInvito) => removeItem(KEY, idInvito),
}
