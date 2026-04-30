// =============================================================================
// GarePage.jsx - pagina /gare: calendario di tutte le partite.
//
// Mostra l'elenco delle gare raggruppate per torneo. C'è un filtro per data
// che permette di vedere solo le gare di un giorno specifico.
// La creazione e modifica delle gare avviene dentro la pagina del torneo.
// =============================================================================

import EventRoundedIcon from '@mui/icons-material/EventRounded'
import SportsScoreRoundedIcon from '@mui/icons-material/SportsScoreRounded'
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { garaService } from '../services/garaService'
import { torneoService } from '../services/torneoService'

// Funzione di confronto: ordina due gare in base a data + ora.
// localeCompare confronta due stringhe come farebbe un dizionario.
const sortByDateTime = (a, b) =>
  `${a.data ?? ''} ${a.ora ?? ''}`.localeCompare(`${b.data ?? ''} ${b.ora ?? ''}`)

export default function GarePage() {
  const [gare, setGare] = useState([])           // tutte le gare scaricate
  const [tornei, setTornei] = useState([])       // tutti i tornei (per nomi/link)
  const [filterDate, setFilterDate] = useState('')  // data selezionata nel filtro
  const [error, setError] = useState('')

  // Al caricamento della pagina, scarichiamo gare e tornei in parallelo.
  useEffect(() => {
    let ignore = false
    Promise.all([garaService.getGare(), torneoService.getTornei()])
      .then(([g, t]) => {
        if (ignore) return
        setGare(g)
        setTornei(t)
      })
      .catch((err) => !ignore && setError(err.message))
    return () => {
      ignore = true
    }
  }, [])

  // useMemo = "ricalcola questo valore SOLO quando cambia gare o filterDate".
  // Serve a non rifare il raggruppamento ogni volta che la pagina si ri-disegna.
  const grouped = useMemo(() => {
    // Se c'è un filtro per data, teniamo solo le gare di quel giorno.
    const filtered = filterDate ? gare.filter((g) => g.data === filterDate) : gare
    // Costruiamo una "mappa" dove la chiave è l'id_torneo e il valore è la lista delle sue gare.
    const map = new Map()
    for (const gara of filtered) {
      const key = gara.id_torneo ?? 'libere'    // gare senza torneo finiscono nel gruppo 'libere'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(gara)
    }
    return map
  }, [gare, filterDate])

  return (
    <Stack spacing={3}>
      {/* TITOLO della pagina. */}
      <Box>
        <Typography variant="h4">Calendario gare</Typography>
        <Typography color="text.secondary" variant="body2">
          Tutte le partite in programma, raggruppate per torneo.
        </Typography>
      </Box>

      {/* CARD del filtro per data. */}
      <Card variant="outlined">
        <CardContent>
          <TextField
            InputLabelProps={{ shrink: true }}     // tieni l'etichetta sempre in alto
            label="Filtra per data"
            onChange={(event) => setFilterDate(event.target.value)}
            type="date"
            value={filterDate}
          />
        </CardContent>
      </Card>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {/* Se non ci sono gruppi mostriamo un messaggio, altrimenti elenchiamo i gruppi. */}
      {grouped.size === 0 ? (
        <Alert severity="info">Nessuna gara in calendario.</Alert>
      ) : (
        <Stack spacing={2}>
          {/* Per ogni gruppo (torneo) creiamo una card con dentro la lista delle sue gare. */}
          {[...grouped.entries()].map(([key, listaGare]) => {
            const torneo = tornei.find((t) => t.id === key)
            // Decidiamo il titolo della card: nome del torneo, "amichevoli" o fallback.
            const titolo = torneo ? torneo.nome : key === 'libere' ? 'Gare amichevoli' : `Torneo ${key}`
            return (
              <Card key={String(key)} variant="outlined">
                <CardContent>
                  {/* Intestazione del gruppo: icona + titolo + numero gare + bottone. */}
                  <Stack alignItems="center" direction="row" justifyContent="space-between">
                    <Stack alignItems="center" direction="row" spacing={1.5}>
                      <Avatar sx={{ bgcolor: 'primary.main' }} variant="rounded">
                        <SportsScoreRoundedIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{titolo}</Typography>
                        <Typography color="text.secondary" variant="caption">
                          {listaGare.length} gare
                        </Typography>
                      </Box>
                    </Stack>
                    {/* Se è un torneo vero, mostro il pulsante per aprirlo. */}
                    {torneo ? (
                      <Chip
                        clickable
                        component={Link}
                        label="Apri torneo"
                        to={`/torneo/${torneo.id}`}
                      />
                    ) : null}
                  </Stack>

                  {/* Lista delle singole gare del gruppo, ordinate per data/ora. */}
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    {[...listaGare].sort(sortByDateTime).map((gara) => (
                      <Stack
                        alignItems="center"
                        direction="row"
                        justifyContent="space-between"
                        key={gara.id}
                        spacing={2}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          px: 2,
                          py: 1.25,
                        }}
                      >
                        <Stack alignItems="center" direction="row" spacing={1.5}>
                          <EventRoundedIcon color="action" fontSize="small" />
                          <Typography variant="body2">{gara.data ?? 'Data da definire'}</Typography>
                        </Stack>
                        <Typography variant="body2">{gara.ora ?? '--:--'}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )
          })}
        </Stack>
      )}
    </Stack>
  )
}
