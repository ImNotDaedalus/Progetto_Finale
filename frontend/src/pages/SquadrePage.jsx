// =============================================================================
// SquadrePage.jsx - pagina /squadre: lista di tutte le squadre.
//
// - Mostra le squadre come "card" cliccabili.
// - Permette di cercare per nome.
// - Se sei loggato, c'è il pulsante "Crea squadra" (apre un dialogo).
// - Cliccando su una squadra si va alla sua pagina di dettaglio.
// =============================================================================

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

  // Dati scaricati e stato della pagina.
  const [squadre, setSquadre] = useState([])         // lista squadre
  const [accounts, setAccounts] = useState([])       // tutti gli account (per contare i giocatori per squadra)
  const [search, setSearch] = useState('')           // testo digitato nella casella di ricerca
  const [createOpen, setCreateOpen] = useState(false)  // dialogo "Crea squadra" aperto?
  const [nome, setNome] = useState('')               // nome della nuova squadra in fase di creazione
  const [actionLoading, setActionLoading] = useState('')  // serve a disabilitare bottoni durante un'azione
  const [feedback, setFeedback] = useState(null)     // messaggio di successo/errore

  // Funzione che (ri)carica i dati dal backend.
  async function load() {
    try {
      setSquadre(await squadraService.getSquadre())
      // Se siamo loggati, scarichiamo anche gli account (per le statistiche).
      if (token) {
        try {
          setAccounts(await accountService.getAccounts(token))
        } catch {
          // gli account servono solo per contare i giocatori
        }
      }
    } catch (error) {
      setFeedback({ severity: 'error', message: error.message })
    }
  }

  // Quando il token cambia (login/logout) ricarichiamo i dati.
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Gestisce l'invio del form "Crea squadra".
  async function handleCreate(event) {
    event.preventDefault()                 // evita che il browser ricarichi la pagina
    if (!currentAccount) return
    setActionLoading('create')
    try {
      await squadraService.createSquadra({ nome, id_proprietario: currentAccount.id })
      setNome('')                          // svuota il campo nome
      setCreateOpen(false)                 // chiude il dialogo
      setFeedback({ severity: 'success', message: 'Squadra creata.' })
      await load()                         // aggiorna la lista
    } catch (error) {
      setFeedback({ severity: 'error', message: error.message })
    } finally {
      setActionLoading('')
    }
  }

  // Lista filtrata in base al testo di ricerca (calcolata "al volo").
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return squadre
    return squadre.filter((sq) => (sq.nome ?? '').toLowerCase().includes(query))
  }, [squadre, search])

  // Conta quanti utenti hanno id_squadra = idSquadra.
  const countMembers = (idSquadra) =>
    accounts.filter((acc) => acc.id_squadra === idSquadra).length

  return (
    <Stack spacing={3}>
      {/* Eventuale messaggio di feedback (verde/rosso) sopra a tutto. */}
      {feedback ? <Alert severity={feedback.severity}>{feedback.message}</Alert> : null}

      {/* INTESTAZIONE: titolo a sinistra, pulsante "Crea squadra" a destra. */}
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
          disabled={!isAuthenticated}            // se non sei loggato il bottone è grigio
          onClick={() => setCreateOpen(true)}    // apre il dialogo di creazione
          startIcon={<AddRoundedIcon />}
          variant="contained"
        >
          Crea squadra
        </Button>
      </Stack>

      {/* CASELLA di ricerca. */}
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

      {/* GRIGLIA delle squadre filtrate (o messaggio se vuota). */}
      {filtered.length === 0 ? (
        <Alert severity="info">Nessuna squadra trovata.</Alert>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((sq) => (
            // Grid item: 1 colonna su mobile (xs=12), 2 su tablet (sm=6), 3 su desktop (md=4).
            <Grid item key={sq.id} md={4} sm={6} xs={12}>
              <Card sx={{ height: '100%' }} variant="outlined">
                {/* Tutta la card è cliccabile e porta al dettaglio della squadra. */}
                <CardActionArea component={Link} to={`/squadra/${sq.id}`} sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack alignItems="flex-start" direction="row" spacing={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }} variant="rounded">
                        <Groups2RoundedIcon />
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="h6">{sq.nome}</Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                          <Chip label={`${countMembers(sq.id)} giocatori`} size="small" />
                          {/* Etichetta verde se la squadra è la TUA. */}
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

      {/* DIALOGO modale per creare una nuova squadra. */}
      <Dialog fullWidth maxWidth="xs" onClose={() => setCreateOpen(false)} open={createOpen}>
        <DialogTitle>Nuova squadra</DialogTitle>
        {/* Box con component="form": tutto al suo interno è un modulo HTML. */}
        <Box component="form" onSubmit={handleCreate}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                autoFocus               // mette subito il cursore qui
                fullWidth
                label="Nome"
                onChange={(event) => setNome(event.target.value)}
                required                // il browser non permette di inviare se vuoto
                value={nome}
              />
              <Typography color="text.secondary" variant="caption">
                Sarai il proprietario della squadra e potrai invitare i giocatori dalla pagina della squadra.
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
