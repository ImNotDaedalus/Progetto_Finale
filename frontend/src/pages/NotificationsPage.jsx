// =============================================================================
// NotificationsPage.jsx - pagina /notifiche: inviti ricevuti dalle squadre.
//
// L'utente può:
//   - vedere gli inviti pendenti ricevuti da varie squadre
//   - accettarli (entra nella squadra) o rifiutarli
//   - vedere lo storico (inviti già accettati o rifiutati)
//
// Per accettare serve reinserire la password (il backend richiede la password
// in update); accettare cambia il proprio "id_squadra".
// =============================================================================

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded'
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { accountService } from '../services/accountService'
import { inviteService } from '../services/inviteService'
import { squadraService } from '../services/squadraService'

export default function NotificationsPage() {
  const { currentAccount, isAuthenticated, refreshProfile, token } = useAuth()

  const [inviti, setInviti] = useState([])           // inviti dell'utente (dal localStorage)
  const [squadre, setSquadre] = useState([])         // squadre (per mostrarne i nomi)
  const [feedback, setFeedback] = useState(null)

  // Stato del dialogo di conferma password (per accettare un invito).
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingInvite, setPendingInvite] = useState(null)
  const [password, setPassword] = useState('')
  const [actionLoading, setActionLoading] = useState('')

  // Funzione che ricarica gli inviti dell'utente e la lista delle squadre.
  async function reload() {
    if (!currentAccount) return
    setInviti(inviteService.getInvitiPerAccount(currentAccount.id))
    try {
      setSquadre(await squadraService.getSquadre())
    } catch {
      setSquadre([])
    }
  }

  // Quando l'utente cambia (login/logout) o c'è un altro evento, ricarichiamo.
  useEffect(() => {
    if (!isAuthenticated) return
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentAccount])

  if (!isAuthenticated) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Alert severity="info">Effettua il login per vedere le notifiche.</Alert>
          <Button component={Link} sx={{ mt: 2 }} to="/auth" variant="contained">
            Vai al login
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Apre il dialogo di conferma password per accettare un certo invito.
  function openConfirm(invito) {
    setPendingInvite(invito)
    setPassword('')
    setConfirmOpen(true)
  }

  // Conferma dell'accettazione dell'invito.
  async function handleConfirmAccept(event) {
    event.preventDefault()
    if (!pendingInvite || !currentAccount) return

    // Non si può entrare in due squadre contemporaneamente.
    if (currentAccount.id_squadra) {
      setFeedback({
        severity: 'warning',
        message: 'Sei gia in una squadra. Esci da quella prima di accettare.',
      })
      setConfirmOpen(false)
      return
    }
    setActionLoading('accept')
    try {
      // Aggiorniamo il proprio account impostando id_squadra a quello dell'invito.
      // Il backend richiede TUTTI i campi anche se modifichiamo solo uno.
      await accountService.updateAccount(
        currentAccount.id,
        {
          nome: currentAccount.nome,
          cognome: currentAccount.cognome,
          email: currentAccount.email,
          password,
          nazionalita: currentAccount.nazionalita,
          data_nascita: currentAccount.data_nascita,
          sesso: currentAccount.sesso,
          indirizzo: currentAccount.indirizzo,
          id_squadra: pendingInvite.id_squadra,
        },
        token,
      )
      // Marca l'invito come accettato e ricarica i dati.
      inviteService.setStato(pendingInvite.id, 'accepted')
      await refreshProfile(token)
      await reload()
      setConfirmOpen(false)
      setPassword('')
      setFeedback({ severity: 'success', message: 'Sei entrato nella squadra.' })
    } catch (err) {
      setFeedback({ severity: 'error', message: err.message })
    } finally {
      setActionLoading('')
    }
  }

  // Rifiuta un invito (non chiede password: è solo un cambio di stato locale).
  function handleReject(invito) {
    inviteService.setStato(invito.id, 'rejected')
    setInviti(inviteService.getInvitiPerAccount(currentAccount.id))
    setFeedback({ severity: 'info', message: 'Invito rifiutato.' })
  }

  // Separiamo gli inviti in due gruppi: in attesa e già gestiti (storico).
  const pending = inviti.filter((i) => i.stato === 'pending')
  const storico = inviti.filter((i) => i.stato !== 'pending')

  // Stile condiviso dei "box riga" per non ripeterlo.
  const itemSx = {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 2,
  }

  return (
    <Stack spacing={3}>
      {feedback ? <Alert severity={feedback.severity}>{feedback.message}</Alert> : null}

      <Box>
        <Typography variant="h4">Notifiche</Typography>
        <Typography color="text.secondary" variant="body2">
          Gli inviti che hai ricevuto dalle squadre.
        </Typography>
      </Box>

      {/* CARD inviti in attesa di risposta. */}
      <Card variant="outlined">
        <CardContent>
          <Stack alignItems="center" direction="row" spacing={1.5}>
            <MarkEmailReadRoundedIcon color="primary" />
            <Typography variant="h6">In attesa di risposta</Typography>
          </Stack>
          <Divider sx={{ my: 1.5 }} />
          {pending.length === 0 ? (
            <Alert severity="info">Nessun invito in sospeso.</Alert>
          ) : (
            <Stack spacing={1.5}>
              {pending.map((invito) => {
                // Cerco la squadra che mi ha invitato per mostrarne il nome.
                const sq = squadre.find((s) => s.id === invito.id_squadra)
                return (
                  <Stack
                    alignItems={{ sm: 'center' }}
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    key={invito.id}
                    spacing={1.5}
                    sx={{ ...itemSx, p: 1.75 }}
                  >
                    <Stack alignItems="center" direction="row" spacing={1.5}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {(sq?.nome ?? '?').charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">{sq ? sq.nome : 'Squadra'}</Typography>
                        <Typography color="text.secondary" variant="caption">
                          Ti ha invitato a unirti alla squadra
                        </Typography>
                      </Box>
                    </Stack>
                    {/* Due pulsanti: Accetta (verde) e Rifiuta (rosso). */}
                    <Stack direction="row" spacing={1}>
                      <Button
                        color="success"
                        onClick={() => openConfirm(invito)}
                        startIcon={<CheckCircleRoundedIcon />}
                        variant="contained"
                      >
                        Accetta
                      </Button>
                      <Button
                        color="error"
                        onClick={() => handleReject(invito)}
                        startIcon={<HighlightOffRoundedIcon />}
                        variant="outlined"
                      >
                        Rifiuta
                      </Button>
                    </Stack>
                  </Stack>
                )
              })}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* CARD storico inviti (già accettati o rifiutati). */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6">Storico</Typography>
          <Divider sx={{ my: 1.5 }} />
          {storico.length === 0 ? (
            <Typography color="text.secondary" variant="body2">
              Non c e ancora storico.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {storico.map((invito) => {
                const sq = squadre.find((s) => s.id === invito.id_squadra)
                const accepted = invito.stato === 'accepted'
                return (
                  <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                    key={invito.id}
                    sx={{ ...itemSx, px: 2, py: 1.25 }}
                  >
                    <Typography variant="body2">{sq ? sq.nome : 'Squadra'}</Typography>
                    <Chip
                      color={accepted ? 'success' : 'error'}
                      label={accepted ? 'Accettato' : 'Rifiutato'}
                      size="small"
                    />
                  </Stack>
                )
              })}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* DIALOGO password: si apre quando si clicca "Accetta". */}
      <Dialog fullWidth maxWidth="xs" onClose={() => setConfirmOpen(false)} open={confirmOpen}>
        <DialogTitle>Conferma con la password</DialogTitle>
        <Box component="form" onSubmit={handleConfirmAccept}>
          <DialogContent>
            <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">
              Per entrare nella squadra dobbiamo aggiornare il tuo profilo: reinserisci la tua password.
            </Typography>
            <TextField
              autoFocus
              fullWidth
              label="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              value={password}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Annulla</Button>
            <Button
              disabled={!password || actionLoading === 'accept'}
              type="submit"
              variant="contained"
            >
              {actionLoading === 'accept' ? 'Conferma...' : 'Conferma'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  )
}
