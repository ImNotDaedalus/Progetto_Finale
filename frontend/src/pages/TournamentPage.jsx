// Pagina /torneo/:id: dettaglio del torneo.
// - intestazione con info principali
// - squadre partecipanti (richieste accettate)
// - gestione richieste pending (accetta / rifiuta)
// - gare programmate per questo torneo + creazione di una nuova gara
// - registrazione risultati

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import ScoreboardRoundedIcon from '@mui/icons-material/ScoreboardRounded'
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
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { garaService } from '../services/garaService'
import { requestService } from '../services/requestService'
import { resultService } from '../services/resultService'
import { squadraService } from '../services/squadraService'
import { torneoService } from '../services/torneoService'

const emptyResultForm = {
  id_gara: '',
  id_squadra_casa: '',
  id_squadra_ospite: '',
  gol_casa: '',
  gol_ospite: '',
}

const emptyGaraForm = { data: '', ora: '' }

export default function TournamentPage() {
  const { id } = useParams()
  const idTorneo = Number(id)
  const { currentAccount, isAuthenticated, token } = useAuth()

  const [torneo, setTorneo] = useState(null)
  const [squadre, setSquadre] = useState([])
  const [richieste, setRichieste] = useState([])
  const [gare, setGare] = useState([])
  const [risultati, setRisultati] = useState([])
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState(null)

  const [resultOpen, setResultOpen] = useState(false)
  const [resultForm, setResultForm] = useState(emptyResultForm)
  const [garaOpen, setGaraOpen] = useState(false)
  const [garaForm, setGaraForm] = useState(emptyGaraForm)

  async function reload() {
    try {
      setTorneo(await torneoService.getTorneoById(idTorneo))
      setSquadre(await squadraService.getSquadre())
      setGare((await garaService.getGare()).filter((gara) => gara.id_torneo === idTorneo))
      setRichieste(requestService.getRichiestePerTorneo(idTorneo))
      setRisultati(resultService.getRisultatiPerTorneo(idTorneo))
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idTorneo, isAuthenticated])

  const squadrePartecipanti = useMemo(
    () =>
      richieste
        .filter((r) => r.stato === 'accepted')
        .map((r) => squadre.find((sq) => sq.id === r.id_squadra))
        .filter(Boolean),
    [richieste, squadre],
  )

  const richiestePending = richieste.filter((r) => r.stato === 'pending')

  // Sei il proprietario di questo torneo?
  const isOwner = useMemo(
    () => Boolean(torneo && currentAccount && torneo.id_proprietario === currentAccount.id),
    [torneo, currentAccount],
  )

  function setResultField(field, value) {
    setResultForm((current) => ({ ...current, [field]: value }))
  }

  function setGaraField(field, value) {
    setGaraForm((current) => ({ ...current, [field]: value }))
  }

  function handleApprove(idRichiesta) {
    if (!isOwner) {
      setFeedback({
        severity: 'error',
        message: 'Solo il proprietario del torneo puo accettare le richieste.',
      })
      return
    }
    requestService.setStato(idRichiesta, 'accepted')
    setRichieste(requestService.getRichiestePerTorneo(idTorneo))
    setFeedback({ severity: 'success', message: 'Richiesta accettata.' })
  }

  function handleReject(idRichiesta) {
    if (!isOwner) {
      setFeedback({
        severity: 'error',
        message: 'Solo il proprietario del torneo puo rifiutare le richieste.',
      })
      return
    }
    requestService.setStato(idRichiesta, 'rejected')
    setRichieste(requestService.getRichiestePerTorneo(idTorneo))
    setFeedback({ severity: 'info', message: 'Richiesta rifiutata.' })
  }

  function handleSaveResult(event) {
    event.preventDefault()
    if (
      !resultForm.id_gara ||
      !resultForm.id_squadra_casa ||
      !resultForm.id_squadra_ospite
    ) {
      setFeedback({ severity: 'warning', message: 'Compila gara e squadre.' })
      return
    }
    if (resultForm.id_squadra_casa === resultForm.id_squadra_ospite) {
      setFeedback({ severity: 'warning', message: 'Le due squadre devono essere diverse.' })
      return
    }
    resultService.createRisultato({
      id_gara: Number(resultForm.id_gara),
      id_torneo: idTorneo,
      id_squadra_casa: Number(resultForm.id_squadra_casa),
      id_squadra_ospite: Number(resultForm.id_squadra_ospite),
      gol_casa: Number(resultForm.gol_casa) || 0,
      gol_ospite: Number(resultForm.gol_ospite) || 0,
    })
    setRisultati(resultService.getRisultatiPerTorneo(idTorneo))
    setResultForm(emptyResultForm)
    setResultOpen(false)
    setFeedback({ severity: 'success', message: 'Risultato salvato.' })
  }

  async function handleCreateGara(event) {
    event.preventDefault()
    try {
      await garaService.createGara(
        {
          data: garaForm.data,
          ora: garaForm.ora,
          id_torneo: idTorneo,
          id_gara_precedente: null,
        },
        token,
      )
      setGaraForm(emptyGaraForm)
      setGaraOpen(false)
      setFeedback({ severity: 'success', message: 'Gara aggiunta al calendario.' })
      await reload()
    } catch (err) {
      setFeedback({ severity: 'error', message: err.message })
    }
  }

  if (!isAuthenticated) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Alert severity="info">Effettua il login per vedere il torneo.</Alert>
          <Button component={Link} sx={{ mt: 2 }} to="/auth" variant="contained">
            Vai al login
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (error) return <Alert severity="error">{error}</Alert>
  if (!torneo) return <Typography>Caricamento...</Typography>

  return (
    <Stack spacing={3}>
      {feedback ? <Alert severity={feedback.severity}>{feedback.message}</Alert> : null}

      <Card
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          background:
            'linear-gradient(135deg, #0d3b66 0%, #1976d2 70%, #4ea3f5 100%)',
          color: '#fff',
        }}
        variant="outlined"
      >
        <CardContent>
          <Stack alignItems="flex-start" direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.16)', height: 64, width: 64 }} variant="rounded">
              <EmojiEventsRoundedIcon fontSize="large" />
            </Avatar>
            <Box flex={1}>
              <Typography variant="overline">Torneo</Typography>
              <Typography variant="h4">{torneo.nome}</Typography>
              <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mt: 1.5 }}>
                <Chip
                  icon={<EventRoundedIcon />}
                  label={`${torneo.data_inizio} → ${torneo.data_fine}`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: '#fff' }}
                />
                <Chip
                  icon={<PlaceRoundedIcon />}
                  label={torneo.luogo}
                  sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: '#fff' }}
                />
                <Chip
                  label={`Divisione ${torneo.divisione}`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.24)', color: '#fff', fontWeight: 600 }}
                />
                {isOwner ? (
                  <Chip
                    color="success"
                    label="Sei il proprietario"
                    sx={{ fontWeight: 600 }}
                  />
                ) : null}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        {/* Squadre partecipanti */}
        <Grid item md={6} xs={12}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Squadre partecipanti</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">
                Le squadre con iscrizione confermata.
              </Typography>
              {squadrePartecipanti.length === 0 ? (
                <Alert severity="info">Ancora nessuna squadra confermata.</Alert>
              ) : (
                <Stack spacing={1}>
                  {squadrePartecipanti.map((sq) => (
                    <CardActionArea
                      component={Link}
                      key={sq.id}
                      sx={{ borderRadius: 2, p: 1.5, border: '1px solid', borderColor: 'divider' }}
                      to={`/squadra/${sq.id}`}
                    >
                      <Stack alignItems="center" direction="row" justifyContent="space-between">
                        <Stack alignItems="center" direction="row" spacing={1.5}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {(sq.nome ?? '?').charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="subtitle1">{sq.nome}</Typography>
                        </Stack>
                        <Chip label="Apri" size="small" />
                      </Stack>
                    </CardActionArea>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Richieste pending */}
        <Grid item md={6} xs={12}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack alignItems="center" direction="row" spacing={1.5}>
                <HowToRegRoundedIcon color="primary" />
                <Typography variant="h6">Richieste di iscrizione</Typography>
              </Stack>
              <Typography color="text.secondary" sx={{ mb: 2, mt: 0.5 }} variant="body2">
                {isOwner
                  ? 'Approva o rifiuta le squadre che chiedono di partecipare.'
                  : 'Solo il proprietario del torneo puo approvare le richieste.'}
              </Typography>
              {richiestePending.length === 0 ? (
                <Alert severity="info">Nessuna richiesta in attesa.</Alert>
              ) : (
                <Stack spacing={1}>
                  {richiestePending.map((richiesta) => {
                    const sq = squadre.find((s) => s.id === richiesta.id_squadra)
                    return (
                      <Paper key={richiesta.id} sx={{ p: 1.5 }} variant="outlined">
                        <Stack
                          alignItems={{ sm: 'center' }}
                          direction={{ xs: 'column', sm: 'row' }}
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Typography variant="subtitle1">
                            {sq ? sq.nome : 'Squadra rimossa'}
                          </Typography>
                          {isOwner ? (
                            <Stack direction="row" spacing={1}>
                              <Button
                                color="success"
                                onClick={() => handleApprove(richiesta.id)}
                                size="small"
                                variant="contained"
                              >
                                Accetta
                              </Button>
                              <Button
                                color="error"
                                onClick={() => handleReject(richiesta.id)}
                                size="small"
                                variant="outlined"
                              >
                                Rifiuta
                              </Button>
                            </Stack>
                          ) : (
                            <Chip label="In attesa" size="small" />
                          )}
                        </Stack>
                      </Paper>
                    )
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Calendario gare */}
        <Grid item md={6} xs={12}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack alignItems="center" direction="row" justifyContent="space-between">
                <Stack alignItems="center" direction="row" spacing={1.5}>
                  <EventRoundedIcon color="primary" />
                  <Typography variant="h6">Gare in programma</Typography>
                </Stack>
                {isOwner ? (
                  <Button
                    onClick={() => setGaraOpen(true)}
                    size="small"
                    startIcon={<AddRoundedIcon />}
                  >
                    Aggiungi
                  </Button>
                ) : null}
              </Stack>
              <Divider sx={{ my: 1.5 }} />
              {gare.length === 0 ? (
                <Alert severity="info">Nessuna gara in programma.</Alert>
              ) : (
                <Stack spacing={1}>
                  {gare.map((gara) => (
                    <Paper
                      key={gara.id}
                      sx={{
                        alignItems: 'center',
                        display: 'flex',
                        justifyContent: 'space-between',
                        p: 1.5,
                      }}
                      variant="outlined"
                    >
                      <Typography variant="body2">{gara.data}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        {gara.ora ?? '--:--'}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Risultati */}
        <Grid item md={6} xs={12}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack alignItems="center" direction="row" justifyContent="space-between">
                <Stack alignItems="center" direction="row" spacing={1.5}>
                  <ScoreboardRoundedIcon color="primary" />
                  <Typography variant="h6">Risultati</Typography>
                </Stack>
                {isOwner ? (
                  <Button
                    disabled={squadrePartecipanti.length < 2 || gare.length === 0}
                    onClick={() => setResultOpen(true)}
                    size="small"
                    startIcon={<AddRoundedIcon />}
                  >
                    Registra
                  </Button>
                ) : null}
              </Stack>
              <Divider sx={{ my: 1.5 }} />
              {risultati.length === 0 ? (
                <Alert severity="info">Nessun risultato registrato.</Alert>
              ) : (
                <Stack spacing={1}>
                  {risultati.map((risultato) => {
                    const casa = squadre.find((s) => s.id === risultato.id_squadra_casa)
                    const ospite = squadre.find((s) => s.id === risultato.id_squadra_ospite)
                    return (
                      <Paper key={risultato.id} sx={{ p: 1.5 }} variant="outlined">
                        <Stack
                          alignItems="center"
                          direction="row"
                          justifyContent="space-between"
                        >
                          <Typography sx={{ flex: 1 }} variant="body2">
                            {casa ? casa.nome : '—'}
                          </Typography>
                          <Chip
                            color="primary"
                            label={`${risultato.gol_casa} - ${risultato.gol_ospite}`}
                            sx={{ fontWeight: 600 }}
                          />
                          <Typography sx={{ flex: 1, textAlign: 'right' }} variant="body2">
                            {ospite ? ospite.nome : '—'}
                          </Typography>
                        </Stack>
                      </Paper>
                    )
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog: nuova gara */}
      <Dialog fullWidth maxWidth="xs" onClose={() => setGaraOpen(false)} open={garaOpen}>
        <DialogTitle>Nuova gara</DialogTitle>
        <Box component="form" onSubmit={handleCreateGara}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                InputLabelProps={{ shrink: true }}
                fullWidth
                label="Data"
                onChange={(event) => setGaraField('data', event.target.value)}
                required
                type="date"
                value={garaForm.data}
              />
              <TextField
                InputLabelProps={{ shrink: true }}
                fullWidth
                label="Ora"
                onChange={(event) => setGaraField('ora', event.target.value)}
                required
                type="time"
                value={garaForm.ora}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGaraOpen(false)}>Annulla</Button>
            <Button type="submit" variant="contained">
              Aggiungi
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Dialog: nuovo risultato */}
      <Dialog fullWidth maxWidth="sm" onClose={() => setResultOpen(false)} open={resultOpen}>
        <DialogTitle>Registra risultato</DialogTitle>
        <Box component="form" onSubmit={handleSaveResult}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Gara"
                onChange={(event) => setResultField('id_gara', event.target.value)}
                required
                select
                value={resultForm.id_gara}
              >
                {gare.map((gara) => (
                  <MenuItem key={gara.id} value={gara.id}>
                    {gara.data} {gara.ora ?? ''}
                  </MenuItem>
                ))}
              </TextField>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Squadra casa"
                  onChange={(event) => setResultField('id_squadra_casa', event.target.value)}
                  required
                  select
                  value={resultForm.id_squadra_casa}
                >
                  {squadrePartecipanti.map((sq) => (
                    <MenuItem key={sq.id} value={sq.id}>
                      {sq.nome}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="Squadra ospite"
                  onChange={(event) => setResultField('id_squadra_ospite', event.target.value)}
                  required
                  select
                  value={resultForm.id_squadra_ospite}
                >
                  {squadrePartecipanti.map((sq) => (
                    <MenuItem key={sq.id} value={sq.id}>
                      {sq.nome}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Gol casa"
                  onChange={(event) => setResultField('gol_casa', event.target.value)}
                  type="number"
                  value={resultForm.gol_casa}
                />
                <TextField
                  fullWidth
                  label="Gol ospite"
                  onChange={(event) => setResultField('gol_ospite', event.target.value)}
                  type="number"
                  value={resultForm.gol_ospite}
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResultOpen(false)}>Annulla</Button>
            <Button type="submit" variant="contained">
              Salva
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  )
}
