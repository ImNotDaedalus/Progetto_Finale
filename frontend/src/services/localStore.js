// =============================================================================
// localStore.js - piccolo aiuto per salvare e leggere liste nel browser.
//
// Cosa fa il "localStorage"? È una specie di mini-archivio dentro al browser:
// puoi scriverci dei dati e ritrovarli anche dopo aver chiuso e riaperto la
// pagina. È utile quando il backend non ha ancora un endpoint per certe cose
// (nel nostro caso: inviti, richieste e risultati). Sono dati "del computer
// dell'utente", quindi non vengono condivisi con altri.
//
// Ogni "lista" ha un nome (es. 'dritta_inviti') ed è salvata come testo JSON.
// =============================================================================

/** Legge la lista salvata nel localStorage. Se non c'è o è rotta, ritorna []. */
export function readList(key) {
  try {
    // Prendiamo il testo salvato; se non c'è ('null'), partiamo da '[]'.
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]')
    // Controllo di sicurezza: dev'essere proprio una lista.
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // Se il testo era malformato, evitiamo di far crashare l'app.
    return []
  }
}

/** Sovrascrive la lista nel localStorage con quella passata. */
export const writeList = (key, list) => localStorage.setItem(key, JSON.stringify(list))

/**
 * Aggiunge un nuovo elemento alla lista, dandogli un id incrementale automatico
 * (1, 2, 3...). Restituisce l'elemento appena creato (con il suo id).
 */
export function addItem(key, item) {
  const list = readList(key)
  // Calcola il prossimo id disponibile: massimo già presente + 1.
  const nextId = list.reduce((max, c) => Math.max(max, c.id ?? 0), 0) + 1
  const newItem = { id: nextId, ...item }
  writeList(key, [...list, newItem])
  return newItem
}

/** Aggiorna un elemento per id (sostituendo i campi passati in 'changes'). */
export function updateItem(key, id, changes) {
  writeList(
    key,
    readList(key).map((item) => (item.id === id ? { ...item, ...changes } : item)),
  )
}

/** Rimuove un elemento per id. */
export function removeItem(key, id) {
  writeList(key, readList(key).filter((item) => item.id !== id))
}
