// Pagina /squadre: lista delle squadre in card con ricerca per nome.
// Il pulsante "Crea squadra" e visibile solo se sei loggato e usa
// automaticamente il tuo account come proprietario.

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded'
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
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { accountService } from '../services/accountService'
import { squadraService } from '../services/squadraService'

export default function SquadrePage() {
  const { currentAccount, isAuthenticated, token } = useAuth()
  const [squadre, setSquadre] = useState([])
  const [accounts, setAccounts] = useState([])
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [actionLoading, setActionLoading] = useState('')
  const [feedback, setFeedback] = useState(null)

  async function load() {
    try {
      setSquadre(await squadraService.getSquadre())
      if (token) {
        try {
          setAccounts(await accountService.getAccounts(token))
        } catch {
          // niente: accounts servono solo a contare i giocatori
        }
      }
    } catch (error) {
      setFeedback({ severity: 'error', message: error.message })
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function handleCreate(event) {
    event.preventDefault()
    if (!currentAccount) return
    setActionLoading('create')
    try {
      await squadraService.createSquadra({
        nome,
        id_proprietario: currentAccount.id,
      })
      setNome('')
      setCreateOpen(false)
      setFeedback({ severity: 'success', message: 'Squadra creata.' })
      await load()
    } catch (error) {
      setFeedback({ severity: 'error', message: error.message })
    } finally {
      setActionLoading('')
    }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return squadre
    return squadre.filter((sq) => (sq.nome ?? '').toLowerCase().includes(query))
  }, [squadre, search])

  function countMembers(idSquadra) {
    return accounts.filter((acc) => acc.id_squadra === idSquadra).length
  }

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
          <Typography variant="h4">Squadre</Typography>
          <Typography color="text.secondary" variant="body2">
            Esplora le squadre o crea la tua.
          </Typography>
        </Box>
        <Button
          disabled={!isAuthenticated}
          onClick={() => setCreateOpen(true)}
          startIcon={<AddRoundedIcon />}
          variant="contained"
        >
          Crea squadra
        </Button>
      </Stack>

      <Card variant="outlined">
        <CardContent>
          <TextField
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon />
                </InputAdornment>
              ),
            }}
            fullWidth
            label="Cerca squadra per nome"
            onChange={(event) => setSearch(event.target.value)}
            value={search}
          />
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Alert severity="info">Nessuna squadra trovata.</Alert>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((sq) => (
            <Grid item key={sq.id} md={4} sm={6} xs={12}>
              <Card sx={{ height: '100%' }} variant="outlined">
                <CardActionArea component={Link} to={`/squadra/${sq.id}`} sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack alignItems="flex-start" direction="row" spacing={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }} variant="rounded">
                        <Groups2RoundedIcon />
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="h6">{sq.nome}</Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                          <Chip
                            label={`${countMembers(sq.id)} giocatori`}
                            size="small"
                          />
                          {sq.id_proprietario === currentAccount?.id ? (
                            <Chip color="success" label="La tua squadra" size="small" />
                          ) : null}
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog fullWidth maxWidth="xs" onClose={() => setCreateOpen(false)} open={createOpen}>
        <DialogTitle>Nuova squadra</DialogTitle>
        <Box component="form" onSubmit={handleCreate}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                autoFocus
                fullWidth
                label="Nome"
                onChange={(event) => setNome(event.target.value)}
                required
                value={nome}
              />
              <Typography color="text.secondary" variant="caption">
                Sarai il proprietario della squadra e potrai invitare i
                giocatori dalla pagina della squadra.
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)}>Annulla</Button>
            <Button
              disabled={actionLoading === 'create' || !nome.trim()}
              type="submit"
              variant="contained"
            >
              {actionLoading === 'create' ? 'Creazione...' : 'Crea'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  )
}
