// Piccolo aiuto per salvare e leggere liste di oggetti nel localStorage.
// Lo usano i servizi di inviti, richieste e risultati che non hanno
// ancora un endpoint nel backend: cosi rimaniamo nel frontend e teniamo
// la logica il piu semplice possibile.

export function readList(key) {
  const raw = localStorage.getItem(key)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list))
}

// Aggiunge un elemento e gli da un id incrementale automatico.
export function addItem(key, item) {
  const list = readList(key)
  const nextId = list.reduce((max, current) => Math.max(max, current.id ?? 0), 0) + 1
  const newItem = { id: nextId, ...item }
  writeList(key, [...list, newItem])
  return newItem
}

// Aggiorna un elemento per id (sostituendo i campi passati).
export function updateItem(key, id, changes) {
  const list = readList(key)
  const next = list.map((item) => (item.id === id ? { ...item, ...changes } : item))
  writeList(key, next)
}

// Rimuove un elemento per id.
export function removeItem(key, id) {
  const list = readList(key)
  writeList(key, list.filter((item) => item.id !== id))
}
