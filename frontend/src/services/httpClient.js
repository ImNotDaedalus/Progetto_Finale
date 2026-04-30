// =============================================================================
// httpClient.js - "il telefono" del frontend per parlare col backend.
//
// Cosa fa? Quando una pagina del sito vuole chiedere qualcosa al server
// (esempio: "dammi la lista dei tornei"), passa di qui. Questo file:
//   1) prepara la richiesta (l'indirizzo, il metodo, eventuali dati);
//   2) la spedisce al server con la funzione "fetch" (integrata nel browser);
//   3) legge la risposta e la trasforma in un oggetto utilizzabile;
//   4) se il server risponde con un errore, lancia un'eccezione descrittiva.
//
// Inoltre gestisce il "token" JWT, cioè la "tessera digitale" che serve a
// dimostrare al server che siamo loggati.
// =============================================================================

// Indirizzo base del backend. Di default usiamo "/api" così il proxy di Vite
// (configurato in vite.config.js) gira le richieste al server giusto. In
// produzione si può sovrascrivere con la variabile d'ambiente VITE_API_BASE_URL.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

// Nome della "casella" del browser dove salviamo il token JWT.
// (localStorage = un piccolo archivio del browser che dura anche dopo aver chiuso la pagina.)
const TOKEN_STORAGE_KEY = 'fedi_access_token'

// Funzioni semplici per leggere / salvare / cancellare il token.
export const getStoredToken = () => localStorage.getItem(TOKEN_STORAGE_KEY) ?? ''
export const setStoredToken = (token) => localStorage.setItem(TOKEN_STORAGE_KEY, token)
export const clearStoredToken = () => localStorage.removeItem(TOKEN_STORAGE_KEY)

/**
 * Manda una richiesta al backend.
 *
 * @param {string} path - es. "/account/" (verrà unito a API_BASE_URL).
 * @param {object} options - parametri opzionali:
 *    - method: "GET" (default), "POST", "PUT", "DELETE"
 *    - body: oggetto da spedire come JSON (se serve)
 *    - auth: true/false, se true allega il token JWT
 *    - token: token specifico (se non passato, prende quello salvato)
 *    - headers: header HTTP aggiuntivi
 */
export async function apiRequest(path, { method = 'GET', body, auth, token, headers = {} } = {}) {
  // Prepara gli "header" della richiesta (informazioni di servizio).
  const finalHeaders = { ...headers }
  // Se stiamo mandando un body, dichiariamo che sarà in formato JSON.
  if (body !== undefined) finalHeaders['Content-Type'] = 'application/json'
  // Se la richiesta richiede autenticazione, aggiungiamo il token.
  if (auth) {
    const t = token ?? getStoredToken()
    if (t) finalHeaders['Authorization'] = `Bearer ${t}`
  }

  // Spedizione della richiesta vera e propria. "fetch" è la funzione del
  // browser che parla con la rete. "await" = aspetta che la risposta arrivi.
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    // Il body deve essere trasformato in stringa prima di essere spedito.
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // Decidiamo come interpretare la risposta:
  // se il server dice "ti mando JSON" la trasformiamo in oggetto, altrimenti la teniamo come testo.
  const isJson = (response.headers.get('content-type') ?? '').includes('application/json')
  const payload = isJson ? await response.json() : await response.text()

  // Se il server ha risposto con un errore (es. 404, 500), lanciamo un'eccezione
  // con un messaggio leggibile, così le pagine possono mostrarlo all'utente.
  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && (payload.error || payload.message)) ||
      'Richiesta non riuscita'
    const error = new Error(message)
    error.status = response.status   // codice HTTP (es. 401, 404...)
    error.details = payload          // contenuto della risposta (utile per il debug)
    throw error
  }

  // Tutto ok: restituiamo i dati al chiamante.
  return payload
}
