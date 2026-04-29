// Questo file contiene la funzione che parla con il backend.
// Tutte le pagine usano "apiRequest" per chiedere dati al server o mandarli.

// Indirizzo base del backend (di default passa da /api grazie al proxy di Vite).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

// Nome della "casella" del browser dove salviamo il token di chi è loggato.
const TOKEN_STORAGE_KEY = 'fedi_access_token'

// Legge il token salvato nel browser (se non c'è, ritorna stringa vuota).
export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY) ?? ''
}

// Salva il token nel browser.
export function setStoredToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

// Cancella il token dal browser (usato al logout).
export function clearStoredToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

// Manda una richiesta al backend.
// path: es. "/account/". options: metodo, body, se serve il token.
export async function apiRequest(path, options = {}) {
  const method = options.method ?? 'GET'
  const body = options.body
  const needsAuth = options.auth === true
  const token = options.token ?? getStoredToken()

  // Prepara gli header (tipo di contenuto, token se serve).
  const headers = { ...(options.headers ?? {}) }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (needsAuth && token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Manda la chiamata vera e propria al server.
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // Legge la risposta: se è JSON la converte in oggetto, altrimenti la tiene come testo.
  const isJson = (response.headers.get('content-type') ?? '').includes('application/json')
  const payload = isJson ? await response.json() : await response.text()

  // Se il server ha risposto con un errore, lancia un'eccezione con il messaggio.
  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && (payload.error || payload.message)) ||
      'Richiesta non riuscita'
    const error = new Error(message)
    error.status = response.status
    error.details = payload
    throw error
  }

  return payload
}
