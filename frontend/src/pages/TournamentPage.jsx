// =============================================================================
// TournamentPage.jsx - pagina /torneo/:id: dettaglio di un singolo torneo.
//
// Mostra:
//   - intestazione con info principali (date, luogo, divisione)
//   - squadre partecipanti (richieste accettate)
//   - richieste in attesa: il proprietario può accettarle/rifiutarle
//   - calendario gare del torneo (il proprietario può aggiungerne)
//   - risultati (il proprietario può registrarli)
// =============================================================================

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

// Form vuoti usati come stato iniziale dei due dialoghi modali.
const emptyResultForm = {
  id_gara: '',
  id_squadra_casa: '',
  id_squadra_ospite: '',
  gol_casa: '',
  gol_ospite: '',
}
const emptyGaraForm = { data: '', ora: '' }

// Stile delle "etichette" sopra al gradiente blu.
const overlayChipSx = { bgcolor: 'rgba(255,255,255,0.16)', color: '#fff' }

export default function TournamentPage() {
  const { id } = useParams()
  const idTorneo = Number(id)
  const { currentAccount, isAuthenticated, token } = useAuth()

  // Stato della pagina.
  const [torneo, setTorneo] = useState(null)
  const [squadre, setSquadre] = useState([])
  const [richieste, setRichieste] = useState([])
  const [gare, setGare] = useState([])
  const [risultati, setRisultati] = useState([])
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState(null)

  // Stati dei dialoghi (Aggiungi gara, Registra risultato).
  const [resultOpen, setResultOpen] = useState(false)
  const [resultForm, setResultForm] = useState(emptyResultForm)
  const [garaOpen, setGaraOpen] = useState(false)
  const [garaForm, setGaraForm] = useState(emptyGaraForm)

  // (Ri)carica tutti i dati necessari alla pagina.
  async function reload() {
    try {
      setTorneo(await torneoService.getTorneoById(idTorneo))
      setSquadre(await squadraService.getSquadre())
      // Filtriamo solo le gare di questo torneo (il backend ritorna tutte).
      setGare((await garaService.getGare()).filter((g) => g.id_torneo === idTorneo))
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

  // Lista delle squadre confermate (richieste accettate).
  const squadrePartecipanti = useMemo(
    () =>
      richieste
        .filter((r) => r.stato === 'accepted')
        .map((r) => squadre.find((sq) => sq.id === r.id_squadra))
        .filter(Boolean),                          // togli eventuali "undefined"
    [richieste, squadre],
  )

  // Le richieste ancora da approvare.
  const richiestePending = richieste.filter((r) => r.stato === 'pending')

  // Sei il proprietario di questo torneo? Da questo dipendono molti pulsanti.
  const isOwner = useMemo(
    () => Boolean(torneo && currentAccount && torneo.id_proprietario === currentAccount.id),
    [torneo, currentAccount],
  )

  // Helper per aggiornare un campo dei form.
  const setResultField = (field, value) => setResultForm((c) => ({ ...c, [field]: value }))
  const setGaraField = (field, value) => setGaraForm((c) => ({ ...c, [field]: value }))

  // Cambia lo stato di una richiesta (accettata o rifiutata) — solo se sei proprietario.
  function setRichiestaStato(idRichiesta, stato) {
    if (!isOwner) {
      setFeedback({
        severity: 'error',
        message: `Solo il proprietario del torneo puo ${stato === 'accepted' ? 'accettare' : 'rifiutare'} le richieste.`,
      })
      return
    }
    requestService.setStato(idRichiesta, stato)
    setRichieste(requestService.getRichiestePerTorneo(idTorneo))
    setFeedback(
      stato === 'accepted'
        ? { severity: 'success', message: 'Richiesta accettata.' }
        : { severity: 'info', message: 'Richiesta rifiutata.' },
    )
  }

  // Salva un nuovo risultato. Vari controlli: gara/squadre obbligatorie, squadre diverse...
  function handleSaveResult(event) {
    event.preventDefault()
    if (!resultForm.id_gara || !resultForm.id_squadra_casa || !resultForm.id_squadra_ospite) {
      setFeedback({ severity: 'warning', message: 'Compila gara e squadre.' })
      return
    }
    if (resultForm.id_squadra_casa === resultForm.id_squadra_ospite) {
      setFeedback({ severity: 'warning', message: 'Le due squadre devono essere diverse.' })
      return
    }
    // Convertiamo i campi in numeri (i form HTML restituiscono stringhe).
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

  // Crea una nuova gara (chiama il backend).
  async function handleCreateGara(event) {
    event.preventDefault()
    try {
      await garaService.createGara(
        { data: garaForm.data, ora: garaForm.ora, id_torneo: idTorneo, id_gara_precedente: null },
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

  // Casi di non-loggato / errore / caricamento.
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

      {/* INTESTAZIONE blu del torneo: nome, date, luogo, divisione. */}
      <Card
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0d3b66 0%, #1976d2 70%, #4ea3f5 100%)',
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
                  sx={overlayChipSx}
                />
                <Chip icon={<PlaceRoundedIcon />} label={torneo.luogo} sx={overlayChipSx} />
                <Chip
                  label={`Divisione ${torneo.divisione}`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.24)', color: '#fff', fontWeight: 600 }}
                />
                {isOwner ? (
                  <Chip color="success" label="Sei il proprietario" sx={{ fontWeight: 600 }} />
                ) : null}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        {/* RIQUADRO 1: Squadre partecipanti. */}
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

        {/* RIQUADRO 2: Richieste in attesa, accetta/rifiuta (solo proprietario). */}
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
                          {/* Bottoni Accetta/Rifiuta solo se sono il proprietario. */}
                          {isOwner ? (
                            <Stack direction="row" spacing={1}>
                              <Button
                                color="success"
                                onClick={() => setRichiestaStato(richiesta.id, 'accepted')}
                                size="small"
                                variant="contained"
                              >
                                Accetta
                              </Button>
                              <Button
                                color="error"
                                onClick={() => setRichiestaStato(richiesta.id, 'rejected')}
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

        {/* RIQUADRO 3: Calendario gare del torneo. */}
        <Grid item md={6} xs={12}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack alignItems="center" direction="row" justifyContent="space-between">
                <Stack alignItems="center" direction="row" spacing={1.5}>
                  <EventRoundedIcon color="primary" />
                  <Typography variant="h6">Gare in programma</Typography>
                </Stack>
                {/* Solo il proprietario può aggiungere gare. */}
                {isOwner ? (
                  <Button onClick={() => setGaraOpen(true)} size="small" startIcon={<AddRoundedIcon />}>
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

        {/* RIQUADRO 4: Risultati. */}
        <Grid item md={6} xs={12}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack alignItems="center" direction="row" justifyContent="space-between">
                <Stack alignItems="center" direction="row" spacing={1.5}>
                  <ScoreboardRoundedIcon color="primary" />
                  <Typography variant="h6">Risultati</Typography>
                </Stack>
                {/* Bottone "Registra" abilitato solo se ci sono almeno 2 squadre e 1 gara. */}
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
                    // Cerco i nomi delle due squadre per mostrarli accanto al punteggio.
                    const casa = squadre.find((s) => s.id === risultato.id_squadra_casa)
                    const ospite = squadre.find((s) => s.id === risultato.id_squadra_ospite)
                    return (
                      <Paper key={risultato.id} sx={{ p: 1.5 }} variant="outlined">
                        <Stack alignItems="center" direction="row" justifyContent="space-between">
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

      {/* DIALOGO: aggiungi una nuova gara al calendario. */}
      <Dialog fullWidth maxWidth="xs" onClose={() => setGaraOpen(false)} open={garaOpen}>
        <DialogTitle>Nuova gara</DialogTitle>
        <Box component="form" onSubmit={handleCreateGara}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                InputLabelProps={{ shrink: true }}
                fullWidth
                label="Data"
                onChange={(e) => setGaraField('data', e.target.value)}
                required
                type="date"
                value={garaForm.data}
              />
              <TextField
                InputLabelProps={{ shrink: true }}
                fullWidth
                label="Ora"
                onChange={(e) => setGaraField('ora', e.target.value)}
                required
                type="time"
                value={garaForm.ora}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGaraOpen(false)}>Annulla</Button>
            <Button type="submit" variant="contained">Aggiungi</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* DIALOGO: registra il risultato di una gara. */}
      <Dialog fullWidth maxWidth="sm" onClose={() => setResultOpen(false)} open={resultOpen}>
        <DialogTitle>Registra risultato</DialogTitle>
        <Box component="form" onSubmit={handleSaveResult}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Gara"
                onChange={(e) => setResultField('id_gara', e.target.value)}
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
              {/* Squadra casa / ospite affiancate sui monitor grandi. */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Squadra casa"
                  onChange={(e) => setResultField('id_squadra_casa', e.target.value)}
                  required
                  select
                  value={resultForm.id_squadra_casa}
                >
                  {squadrePartecipanti.map((sq) => (
                    <MenuItem key={sq.id} value={sq.id}>{sq.nome}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="Squadra ospite"
                  onChange={(e) => setResultField('id_squadra_ospite', e.target.value)}
                  required
                  select
                  value={resultForm.id_squadra_ospite}
                >
                  {squadrePartecipanti.map((sq) => (
                    <MenuItem key={sq.id} value={sq.id}>{sq.nome}</MenuItem>
                  ))}
                </TextField>
              </Stack>
              {/* Goal segnati dalle due squadre. */}
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Gol casa"
                  onChange={(e) => setResultField('gol_casa', e.target.value)}
                  type="number"
                  value={resultForm.gol_casa}
                />
                <TextField
                  fullWidth
                  label="Gol ospite"
                  onChange={(e) => setResultField('gol_ospite', e.target.value)}
                  type="number"
                  value={resultForm.gol_ospite}
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResultOpen(false)}>Annulla</Button>
            <Button type="submit" variant="contained">Salva</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  )
}
