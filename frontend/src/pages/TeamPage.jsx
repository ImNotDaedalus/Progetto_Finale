// =============================================================================
// TeamPage.jsx - pagina /squadra/:id: dettaglio di una singola squadra.
//
// Mostra:
//   - intestazione con nome squadra, allenatore (proprietario), numero giocatori
//   - statistiche (vittorie / pareggi / sconfitte)
//   - "roster" (elenco giocatori)
//   - storico partite e iscrizioni a tornei
//   - se sei il proprietario: pulsanti per invitare un giocatore o iscrivere
//     la squadra a un torneo (entrambi aprono dialoghi modali)
// =============================================================================

import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
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
import { accountService } from '../services/accountService'
import { inviteService } from '../services/inviteService'
import { requestService } from '../services/requestService'
import { calcolaStatistiche, resultService } from '../services/resultService'
import { squadraService } from '../services/squadraService'
import { torneoService } from '../services/torneoService'

// Stile delle "etichette" mostrate sopra al gradiente blu (sfondo trasparente bianco).
const overlayChipSx = { bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }

// Mappe di traduzione per gli stati di richiesta/invito (es. "accepted" -> "Accettata").
const STATO_LABEL = { accepted: 'Accettata', rejected: 'Rifiutata', pending: 'In attesa' }
const INVITO_LABEL = { accepted: 'Accettato', rejected: 'Rifiutato', pending: 'In attesa' }
// Colore del Chip in base allo stato (success = verde, error = rosso, ecc.).
const statoColor = (stato) =>
  stato === 'accepted' ? 'success' : stato === 'rejected' ? 'error' : 'default'

/** Statistica singola dentro un riquadro: etichetta + numero grosso. */
function StatBox({ color = '#1976d2', label, value }) {
  return (
    <Paper
      sx={{ flex: 1, minWidth: 100, p: 2, textAlign: 'center', borderTop: `3px solid ${color}` }}
      variant="outlined"
    >
      <Typography color="text.secondary" variant="caption">{label}</Typography>
      <Typography variant="h5">{value}</Typography>
    </Paper>
  )
}

export default function TeamPage() {
  const { id } = useParams()
  const idSquadra = Number(id)              // l'id arriva come stringa: lo trasformiamo in numero
  const { currentAccount, isAuthenticated, token } = useAuth()

  // Stato della pagina.
  const [squadra, setSquadra] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [tornei, setTornei] = useState([])
  const [richieste, setRichieste] = useState([])     // richieste della squadra ai tornei
  const [risultati, setRisultati] = useState([])     // partite giocate
  const [inviti, setInviti] = useState([])           // inviti spediti dalla squadra
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState(null)

  // Stati dei due dialoghi modali (invito giocatore / iscrizione torneo).
  const [inviteOpen, setInviteOpen] = useState(false)
  const [invitedAccountId, setInvitedAccountId] = useState('')
  const [requestOpen, setRequestOpen] = useState(false)
  const [requestTorneoId, setRequestTorneoId] = useState('')

  // Funzione che (ri)carica tutti i dati necessari alla pagina.
  async function reload() {
    try {
      const sq = await squadraService.getSquadraById(idSquadra)
      setSquadra(sq)
      setAccounts(await accountService.getAccounts(token))
      setTornei(await torneoService.getTornei())
      setRichieste(requestService.getRichiestePerSquadra(idSquadra))
      setRisultati(resultService.getRisultatiPerSquadra(idSquadra))
      setInviti(inviteService.getInvitiPerSquadra(idSquadra))
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSquadra, token, isAuthenticated])

  // Sei il proprietario di questa squadra? Da questo dipendono molti pulsanti.
  const isOwner = useMemo(
    () => Boolean(squadra && currentAccount && squadra.id_proprietario === currentAccount.id),
    [squadra, currentAccount],
  )
  // Lista dei giocatori che hanno id_squadra = idSquadra.
  const giocatori = useMemo(
    () => accounts.filter((acc) => acc.id_squadra === idSquadra),
    [accounts, idSquadra],
  )
  // Statistiche della squadra (vittorie / pareggi / sconfitte).
  const statistiche = useMemo(
    () => calcolaStatistiche(risultati, idSquadra),
    [risultati, idSquadra],
  )
  // Account del proprietario (per mostrarlo come "Allenatore").
  const proprietario = useMemo(
    () => accounts.find((acc) => acc.id === squadra?.id_proprietario),
    [accounts, squadra],
  )

  // Gestisce l'invio dell'invito a un giocatore.
  function handleInvite(event) {
    event.preventDefault()
    setFeedback(null)
    const idTarget = Number(invitedAccountId)
    if (!idTarget) return

    const target = accounts.find((acc) => acc.id === idTarget)
    if (!target) {
      setFeedback({ severity: 'error', message: 'Account non trovato.' })
      return
    }
    // Se il giocatore è già in una squadra, niente invito.
    if (target.id_squadra) {
      setFeedback({ severity: 'warning', message: 'Questo giocatore e gia in una squadra.' })
      return
    }
    // Evita inviti doppi se ce n'è già uno in attesa.
    const giaInvitato = inviti.some(
      (i) => i.id_account === idTarget && i.stato === 'pending',
    )
    if (giaInvitato) {
      setFeedback({ severity: 'info', message: 'Hai gia un invito in attesa per questo giocatore.' })
      return
    }
    inviteService.createInvito(idSquadra, idTarget)
    setInviti(inviteService.getInvitiPerSquadra(idSquadra))
    setInvitedAccountId('')
    setInviteOpen(false)
    setFeedback({ severity: 'success', message: 'Invito inviato.' })
  }

  // Gestisce la richiesta di iscrizione a un torneo.
  function handleRequestTorneo(event) {
    event.preventDefault()
    setFeedback(null)
    const idTorneo = Number(requestTorneoId)
    if (!idTorneo) return
    // Evita richieste doppie.
    const giaInviata = richieste.some((r) => r.id_torneo === idTorneo && r.stato === 'pending')
    if (giaInviata) {
      setFeedback({ severity: 'info', message: 'Hai gia richiesto questo torneo.' })
      return
    }
    requestService.createRichiesta(idSquadra, idTorneo)
    setRichieste(requestService.getRichiestePerSquadra(idSquadra))
    setRequestTorneoId('')
    setRequestOpen(false)
    setFeedback({ severity: 'success', message: 'Richiesta inviata al torneo.' })
  }

  // Casi di errore / caricamento / non loggato.
  if (!isAuthenticated) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Alert severity="info">Effettua il login per vedere la squadra.</Alert>
          <Button component={Link} sx={{ mt: 2 }} to="/auth" variant="contained">
            Vai al login
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (error) return <Alert severity="error">{error}</Alert>
  if (!squadra) return <Typography>Caricamento...</Typography>

  // Lista degli account che si possono invitare (solo quelli senza squadra).
  const accountInvitabili = accounts.filter((acc) => !acc.id_squadra)

  return (
    <Stack spacing={3}>
      {feedback ? <Alert severity={feedback.severity}>{feedback.message}</Alert> : null}

      {/* INTESTAZIONE blu della squadra. */}
      <Card
        sx={{
          borderRadius: 4,
          background: 'linear-gradient(135deg, #134e5e 0%, #1976d2 70%, #71b7e6 100%)',
          color: '#fff',
        }}
        variant="outlined"
      >
        <CardContent>
          <Stack alignItems="flex-start" direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.18)', height: 64, width: 64 }} variant="rounded">
              <Groups2RoundedIcon fontSize="large" />
            </Avatar>
            <Box flex={1}>
              <Typography variant="overline">Squadra</Typography>
              <Typography variant="h4">{squadra.nome}</Typography>
              <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mt: 1.5 }}>
                <Chip label={`${giocatori.length} giocatori`} sx={overlayChipSx} />
                {/* Allenatore (link al suo profilo). */}
                {proprietario ? (
                  <Chip
                    component={Link}
                    clickable
                    label={`Allenatore: ${proprietario.nome} ${proprietario.cognome}`}
                    sx={overlayChipSx}
                    to={`/profilo/${proprietario.id}`}
                  />
                ) : null}
                {isOwner ? <Chip color="success" label="Sei il proprietario" /> : null}
              </Stack>
            </Box>
            {/* Pulsanti d'azione visibili SOLO al proprietario. */}
            {isOwner ? (
              <Stack direction={{ xs: 'row', md: 'column' }} spacing={1}>
                <Button
                  color="inherit"
                  onClick={() => setInviteOpen(true)}
                  startIcon={<PersonAddAlt1RoundedIcon />}
                  variant="contained"
                >
                  Invita
                </Button>
                <Button
                  onClick={() => setRequestOpen(true)}
                  startIcon={<EmojiEventsRoundedIcon />}
                  sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)' }}
                  variant="outlined"
                >
                  Iscrivi al torneo
                </Button>
              </Stack>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      {/* RIGA DI STATISTICHE: tre riquadri colorati. */}
      <Stack direction="row" flexWrap="wrap" gap={2}>
        <StatBox color="#2e7d32" label="Vittorie" value={statistiche.vittorie} />
        <StatBox color="#0288d1" label="Pareggi" value={statistiche.pareggi} />
        <StatBox color="#c62828" label="Sconfitte" value={statistiche.sconfitte} />
      </Stack>

      <Grid container spacing={2.5}>
        {/* COLONNA SINISTRA: roster (elenco giocatori). */}
        <Grid item md={6} xs={12}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Roster</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">
                I giocatori che fanno parte della squadra.
              </Typography>
              {giocatori.length === 0 ? (
                <Alert severity="info">Nessun giocatore nella squadra.</Alert>
              ) : (
                <Stack spacing={1}>
                  {giocatori.map((acc) => (
                    // Card cliccabile per ogni giocatore (porta al suo profilo).
                    <CardActionArea
                      component={Link}
                      key={acc.id}
                      sx={{ borderRadius: 2, p: 1.5, border: '1px solid', borderColor: 'divider' }}
                      to={`/profilo/${acc.id}`}
                    >
                      <Stack alignItems="center" direction="row" spacing={1.5}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {(acc.nome ?? '?').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="subtitle1">
                            {acc.nome} {acc.cognome}
                          </Typography>
                          <Typography color="text.secondary" variant="caption">
                            {acc.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardActionArea>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* COLONNA DESTRA: storico partite + iscrizioni a tornei. */}
        <Grid item md={6} xs={12}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack alignItems="center" direction="row" spacing={1.5}>
                <ScoreboardRoundedIcon color="primary" />
                <Typography variant="h6">Storico partite</Typography>
              </Stack>
              <Divider sx={{ my: 1.5 }} />
              {risultati.length === 0 ? (
                <Alert severity="info">Nessuna partita ancora giocata.</Alert>
              ) : (
                <Stack spacing={1}>
                  {risultati.map((risultato) => {
                    // Calcoliamo l'esito (vittoria / sconfitta / pareggio) dal punto di vista DI QUESTA squadra.
                    const isCasa = risultato.id_squadra_casa === idSquadra
                    const propri = isCasa ? risultato.gol_casa : risultato.gol_ospite
                    const avversari = isCasa ? risultato.gol_ospite : risultato.gol_casa
                    let esitoColor = 'default'
                    let esitoLabel = 'Pareggio'
                    if (propri > avversari) {
                      esitoColor = 'success'
                      esitoLabel = 'Vittoria'
                    } else if (propri < avversari) {
                      esitoColor = 'error'
                      esitoLabel = 'Sconfitta'
                    }
                    return (
                      <Paper key={risultato.id} sx={{ p: 1.5 }} variant="outlined">
                        <Stack alignItems="center" direction="row" justifyContent="space-between">
                          <Typography variant="body2">{propri} - {avversari}</Typography>
                          <Chip color={esitoColor} label={esitoLabel} size="small" />
                        </Stack>
                      </Paper>
                    )
                  })}
                </Stack>
              )}

              {/* Sezione "Iscrizioni ai tornei": appare solo se ci sono richieste. */}
              {richieste.length > 0 ? (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography sx={{ mb: 1 }} variant="subtitle2">
                    Iscrizioni ai tornei
                  </Typography>
                  <Stack spacing={1}>
                    {richieste.map((richiesta) => {
                      const torneo = tornei.find((t) => t.id === richiesta.id_torneo)
                      return (
                        <Paper key={richiesta.id} sx={{ p: 1.5 }} variant="outlined">
                          <Stack alignItems="center" direction="row" justifyContent="space-between">
                            <Typography variant="body2">
                              {torneo ? torneo.nome : 'Torneo rimosso'}
                            </Typography>
                            <Chip
                              color={statoColor(richiesta.stato)}
                              label={STATO_LABEL[richiesta.stato]}
                              size="small"
                            />
                          </Stack>
                        </Paper>
                      )
                    })}
                  </Stack>
                </>
              ) : null}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* DIALOGO: invito un nuovo giocatore. */}
      <Dialog fullWidth maxWidth="sm" onClose={() => setInviteOpen(false)} open={inviteOpen}>
        <DialogTitle>Invita un giocatore</DialogTitle>
        <Box component="form" onSubmit={handleInvite}>
          <DialogContent>
            <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">
              Seleziona un giocatore senza squadra. Riceverà l invito nelle sue notifiche.
            </Typography>
            <TextField
              fullWidth
              label="Giocatore"
              onChange={(e) => setInvitedAccountId(e.target.value)}
              required
              select
              value={invitedAccountId}
            >
              {/* Se non ci sono giocatori invitabili, mostro una voce disabilitata. */}
              {accountInvitabili.length === 0 ? (
                <MenuItem disabled value="">Nessun giocatore senza squadra</MenuItem>
              ) : null}
              {accountInvitabili.map((acc) => (
                <MenuItem key={acc.id} value={acc.id}>
                  {acc.nome} {acc.cognome} ({acc.email})
                </MenuItem>
              ))}
            </TextField>

            {/* Lista degli inviti già spediti dalla squadra (se ce ne sono). */}
            {inviti.length > 0 ? (
              <Box sx={{ mt: 3 }}>
                <Typography sx={{ mb: 1 }} variant="subtitle2">
                  Inviti gia spediti
                </Typography>
                <Stack spacing={0.5}>
                  {inviti.map((invito) => {
                    const acc = accounts.find((a) => a.id === invito.id_account)
                    return (
                      <Stack
                        alignItems="center"
                        direction="row"
                        justifyContent="space-between"
                        key={invito.id}
                      >
                        <Typography variant="body2">
                          {acc ? `${acc.nome} ${acc.cognome}` : 'Giocatore'}
                        </Typography>
                        <Chip
                          color={statoColor(invito.stato)}
                          label={INVITO_LABEL[invito.stato]}
                          size="small"
                        />
                      </Stack>
                    )
                  })}
                </Stack>
              </Box>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInviteOpen(false)}>Chiudi</Button>
            <Button disabled={!invitedAccountId} type="submit" variant="contained">
              Invia invito
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* DIALOGO: iscrizione della squadra a un torneo. */}
      <Dialog fullWidth maxWidth="sm" onClose={() => setRequestOpen(false)} open={requestOpen}>
        <DialogTitle>Iscrivi la squadra a un torneo</DialogTitle>
        <Box component="form" onSubmit={handleRequestTorneo}>
          <DialogContent>
            <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">
              La richiesta verra valutata dagli organizzatori del torneo.
            </Typography>
            <TextField
              fullWidth
              label="Torneo"
              onChange={(e) => setRequestTorneoId(e.target.value)}
              required
              select
              value={requestTorneoId}
            >
              {tornei.length === 0 ? (
                <MenuItem disabled value="">Nessun torneo disponibile</MenuItem>
              ) : null}
              {tornei.map((torneo) => (
                <MenuItem key={torneo.id} value={torneo.id}>
                  {torneo.nome} ({torneo.divisione})
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRequestOpen(false)}>Chiudi</Button>
            <Button disabled={!requestTorneoId} type="submit" variant="contained">
              Invia richiesta
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  )
}
