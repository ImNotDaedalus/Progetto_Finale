// Pagina /gare: calendario di tutte le gare, raggruppate per torneo,
// con filtro per data. La creazione/modifica delle gare avviene dentro
// la pagina del torneo.

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

export default function GarePage() {
  const [gare, setGare] = useState([])
  const [tornei, setTornei] = useState([])
  const [filterDate, setFilterDate] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const [g, t] = await Promise.all([
          garaService.getGare(),
          torneoService.getTornei(),
        ])
        if (ignore) return
        setGare(g)
        setTornei(t)
      } catch (err) {
        if (!ignore) setError(err.message)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  // Raggruppa le gare per id_torneo (chiave 'libere' per quelle senza torneo).
  const grouped = useMemo(() => {
    const filtered = filterDate
      ? gare.filter((gara) => gara.data === filterDate)
      : gare
    const map = new Map()
    for (const gara of filtered) {
      const key = gara.id_torneo ?? 'libere'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(gara)
    }
    return map
  }, [gare, filterDate])

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Calendario gare</Typography>
        <Typography color="text.secondary" variant="body2">
          Tutte le partite in programma, raggruppate per torneo.
        </Typography>
      </Box>

      <Card variant="outlined">
        <CardContent>
          <TextField
            InputLabelProps={{ shrink: true }}
            label="Filtra per data"
            onChange={(event) => setFilterDate(event.target.value)}
            type="date"
            value={filterDate}
          />
        </CardContent>
      </Card>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {grouped.size === 0 ? (
        <Alert severity="info">Nessuna gara in calendario.</Alert>
      ) : (
        <Stack spacing={2}>
          {[...grouped.entries()].map(([key, listaGare]) => {
            const torneo = tornei.find((t) => t.id === key)
            return (
              <Card key={String(key)} variant="outlined">
                <CardContent>
                  <Stack alignItems="center" direction="row" justifyContent="space-between">
                    <Stack alignItems="center" direction="row" spacing={1.5}>
                      <Avatar sx={{ bgcolor: 'primary.main' }} variant="rounded">
                        <SportsScoreRoundedIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {torneo
                            ? torneo.nome
                            : key === 'libere'
                              ? 'Gare amichevoli'
                              : `Torneo ${key}`}
                        </Typography>
                        <Typography color="text.secondary" variant="caption">
                          {listaGare.length} gare
                        </Typography>
                      </Box>
                    </Stack>
                    {torneo ? (
                      <Chip
                        clickable
                        component={Link}
                        label="Apri torneo"
                        to={`/torneo/${torneo.id}`}
                      />
                    ) : null}
                  </Stack>
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    {[...listaGare]
                      .sort((a, b) =>
                        `${a.data ?? ''} ${a.ora ?? ''}`.localeCompare(
                          `${b.data ?? ''} ${b.ora ?? ''}`,
                        ),
                      )
                      .map((gara) => (
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
                            <Typography variant="body2">
                              {gara.data ?? 'Data da definire'}
                            </Typography>
                          </Stack>
                          <Typography variant="body2">
                            {gara.ora ?? '--:--'}
                          </Typography>
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
