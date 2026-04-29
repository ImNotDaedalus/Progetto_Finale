// Pagina /tornei: lista dei tornei in formato card con ricerca per
// nome, filtro per divisione, pulsante "Crea torneo" che apre un Dialog.

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { torneoService } from '../services/torneoService'

const DIVISIONI = ['A1', 'A2', 'B', 'C']
const emptyForm = {
  nome: '',
  data_inizio: '',
  data_fine: '',
  luogo: '',
  divisione: '',
}

export default function TournamentsPage() {
  const { isAuthenticated, token } = useAuth()

  const [tornei, setTornei] = useState([])
  const [search, setSearch] = useState('')
  const [filterDivisione, setFilterDivisione] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [feedback, setFeedback] = useState(null)
  const [actionLoading, setActionLoading] = useState('')

  async function load() {
    try {
      setTornei(await torneoService.getTornei())
    } catch (error) {
      setFeedback({ severity: 'error', message: error.message })
    }
  }

  useEffect(() => {
    load()
  }, [])

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleCreate(event) {
    event.preventDefault()
    setActionLoading('create')
    try {
      await torneoService.createTorneo(form, token)
      setForm(emptyForm)
      setCreateOpen(false)
      setFeedback({ severity: 'success', message: 'Torneo creato.' })
      await load()
    } catch (error) {
      setFeedback({ severity: 'error', message: error.message })
    } finally {
      setActionLoading('')
    }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return tornei.filter((torneo) => {
      if (filterDivisione && torneo.divisione !== filterDivisione) return false
      if (query && !`${torneo.nome ?? ''} ${torneo.luogo ?? ''}`.toLowerCase().includes(query))
        return false
      return true
    })
  }, [tornei, search, filterDivisione])

  return (
    <Stack spacing={3}>
      {feedback ? <Alert severity={feedback.severity}>{feedback.message}</Alert> : null}

      <Stack
        alignItems={{ md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography variant="h4">Tornei</Typography>
          <Typography color="text.secondary" variant="body2">
            Naviga la lista dei tornei o creane uno tuo.
          </Typography>
        </Box>
        <Button
          disabled={!isAuthenticated}
          onClick={() => setCreateOpen(true)}
          startIcon={<AddRoundedIcon />}
          variant="contained"
        >
          Crea torneo
        </Button>
      </Stack>

      <Card variant="outlined">
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon />
                  </InputAdornment>
                ),
              }}
              label="Cerca per nome o luogo"
              onChange={(event) => setSearch(event.target.value)}
              sx={{ flex: 1 }}
              value={search}
            />
            <TextField
              label="Divisione"
              onChange={(event) => setFilterDivisione(event.target.value)}
              select
              sx={{ minWidth: 180 }}
              value={filterDivisione}
            >
              <MenuItem value="">Tutte</MenuItem>
              {DIVISIONI.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Alert severity="info">Nessun torneo corrispondente.</Alert>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((torneo) => (
            <Grid item key={torneo.id} md={4} sm={6} xs={12}>
              <Card sx={{ height: '100%' }} variant="outlined">
                <CardActionArea component={Link} to={`/torneo/${torneo.id}`} sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack alignItems="flex-start" direction="row" spacing={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }} variant="rounded">
                        <EmojiEventsRoundedIcon />
                      </Avatar>
                      <Box flex={1} minWidth={0}>
                        <Typography noWrap variant="h6">
                          {torneo.nome}
                        </Typography>
                        <Chip
                          color="primary"
                          label={`Divisione ${torneo.divisione}`}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Stack>
                    <Stack spacing={1} sx={{ mt: 2 }}>
                      <Stack alignItems="center" direction="row" spacing={1}>
                        <EventRoundedIcon color="action" fontSize="small" />
                        <Typography color="text.secondary" variant="body2">
                          {torneo.data_inizio} → {torneo.data_fine}
                        </Typography>
                      </Stack>
                      <Stack alignItems="center" direction="row" spacing={1}>
                        <PlaceRoundedIcon color="action" fontSize="small" />
                        <Typography color="text.secondary" variant="body2">
                          {torneo.luogo}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog fullWidth maxWidth="sm" onClose={() => setCreateOpen(false)} open={createOpen}>
        <DialogTitle>Nuovo torneo</DialogTitle>
        <Box component="form" onSubmit={handleCreate}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Nome"
                onChange={(event) => setField('nome', event.target.value)}
                required
                value={form.nome}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  label="Data inizio"
                  onChange={(event) => setField('data_inizio', event.target.value)}
                  required
                  type="date"
                  value={form.data_inizio}
                />
                <TextField
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  label="Data fine"
                  onChange={(event) => setField('data_fine', event.target.value)}
                  required
                  type="date"
                  value={form.data_fine}
                />
              </Stack>
              <TextField
                fullWidth
                label="Luogo"
                onChange={(event) => setField('luogo', event.target.value)}
                required
                value={form.luogo}
              />
              <TextField
                fullWidth
                label="Divisione"
                onChange={(event) => setField('divisione', event.target.value)}
                required
                select
                value={form.divisione}
              >
                {DIVISIONI.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)}>Annulla</Button>
            <Button disabled={actionLoading === 'create'} type="submit" variant="contained">
              {actionLoading === 'create' ? 'Creazione...' : 'Crea'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  )
}
