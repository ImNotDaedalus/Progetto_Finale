// Inviti dei giocatori alle squadre.
// Lo stato viene tenuto nel localStorage del browser perche il backend
// attuale non ha un endpoint dedicato. Un invito ha:
//   id, id_squadra, id_account, stato ('pending' | 'accepted' | 'rejected')
import { addItem, readList, removeItem, updateItem } from './localStore'

const KEY = 'dritta_inviti'

export const inviteService = {
  // Tutti gli inviti (di tutte le squadre).
  getInviti() {
    return readList(KEY)
  },

  // Inviti che riguardano un certo account (giocatore).
  getInvitiPerAccount(idAccount) {
    return readList(KEY).filter((invito) => invito.id_account === idAccount)
  },

  // Inviti spediti da una certa squadra.
  getInvitiPerSquadra(idSquadra) {
    return readList(KEY).filter((invito) => invito.id_squadra === idSquadra)
  },

  // Crea un invito per un giocatore.
  createInvito(idSquadra, idAccount) {
    return addItem(KEY, {
      id_squadra: idSquadra,
      id_account: idAccount,
      stato: 'pending',
    })
  },

  // Cambia lo stato di un invito (accettato o rifiutato).
  setStato(idInvito, stato) {
    updateItem(KEY, idInvito, { stato })
  },

  // Cancella un invito (es. dopo accettazione/rifiuto).
  removeInvito(idInvito) {
    removeItem(KEY, idInvito)
  },
}
