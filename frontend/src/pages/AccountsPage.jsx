// =============================================================================
// AccountsPage.jsx - pagina /account: profilo personale dell'utente loggato.
//
// Permette di:
//   - vedere i propri dati anagrafici e la propria squadra
//   - modificare i dati (chiede conferma con la password attuale)
//   - eliminare il proprio account (apre un dialogo di conferma)
//
// Cambiare l'email comporta logout automatico (perché il token JWT è legato
// alla vecchia email e quindi non sarebbe più valido).
// =============================================================================

import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
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
  DialogContentText,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { accountService } from '../services/accountService'
import { squadraService } from '../services/squadraService'

// Modulo "vuoto" usato come stato iniziale e quando non c'è un utente.
const emptyProfileForm = {
  nome: '',
  cognome: '',
  email: '',
  password: '',
  nazionalita: '',
  data_nascita: '',
  sesso: '',
  indirizzo: '',
}

/** Riempie il modulo con i dati di un account (lasciando la password vuota:
 *  l'utente la deve reinserire ogni volta che vuole salvare). */
const accountToForm = (acc) => ({
  nome: acc.nome ?? '',
  cognome: acc.cognome ?? '',
  email: acc.email ?? '',
  password: '',
  nazionalita: acc.nazionalita ?? '',
  data_nascita: acc.data_nascita ?? '',
  sesso: acc.sesso ?? '',
  indirizzo: acc.indirizzo ?? '',
})

export default function AccountsPage() {
  const navigate = useNavigate()
  const { currentAccount, isAuthenticated, logout, refreshProfile, token } = useAuth()

  // Stato del form e della pagina.
  const [form, setForm] = useState(emptyProfileForm)
  const [squadra, setSquadra] = useState(null)         // squadra dell'utente (se ne ha una)
  const [actionLoading, setActionLoading] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)  // dialogo di conferma cancellazione

  // Quando i dati dell'utente cambiano, riempiamo il modulo con i suoi valori.
  useEffect(() => {
    setForm(currentAccount ? accountToForm(currentAccount) : emptyProfileForm)
  }, [currentAccount])

  // Se l'utente ha una squadra, scarichiamone i dati per mostrarli nell'header.
  useEffect(() => {
    if (!currentAccount?.id_squadra) {
      setSquadra(null)
      return
    }
    let ignore = false
    squadraService
      .getSquadraById(currentAccount.id_squadra)
      .then((sq) => !ignore && setSquadra(sq))
      .catch(() => !ignore && setSquadra(null))
    return () => {
      ignore = true
    }
  }, [currentAccount])

  // Se non sei loggato, mostro un invito ad accedere.
  if (!isAuthenticated) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6">Profilo</Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Effettua il login per gestire il tuo profilo.
          </Alert>
          <Button component={Link} sx={{ mt: 2 }} to="/auth" variant="contained">
            Vai al login
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Helper per cambiare un singolo campo del form.
  const setField = (field, value) => setForm((c) => ({ ...c, [field]: value }))

  // Gestisce il "Salva modifiche".
  async function handleSave(event) {
    event.preventDefault()
    if (!currentAccount) return
    // La password attuale è obbligatoria per confermare le modifiche.
    if (!form.password) {
      setFeedback({
        severity: 'warning',
        message: 'Inserisci la tua password per confermare le modifiche.',
      })
      return
    }

    // Se l'utente sta cambiando la propria email, dovrà rifare il login dopo.
    const emailChanged = currentAccount.email !== form.email
    setFeedback(null)
    setActionLoading('save')
    try {
      await accountService.updateAccount(
        currentAccount.id,
        // Manteniamo la stessa squadra: questa pagina non la cambia.
        { ...form, id_squadra: currentAccount.id_squadra ?? null },
        token,
      )
      // Email cambiata: faccio logout perché il vecchio token non è più valido.
      if (emailChanged) {
        logout()
        navigate('/auth')
        return
      }
      // Aggiorno i dati dell'utente in memoria con le nuove informazioni.
      await refreshProfile(token)
      setFeedback({ severity: 'success', message: 'Profilo aggiornato.' })
      // Svuoto il campo password dopo il salvataggio (per sicurezza).
      setForm((c) => ({ ...c, password: '' }))
    } catch (error) {
      setFeedback({ severity: 'error', message: error.message })
    } finally {
      setActionLoading('')
    }
  }

  // Conferma definitiva di eliminazione account.
  async function handleConfirmDelete() {
    if (!currentAccount) return
    setActionLoading('delete')
    try {
      await accountService.deleteAccount(currentAccount.id, token)
      logout()
      navigate('/auth')
    } catch (error) {
      setFeedback({ severity: 'error', message: error.message })
      setActionLoading('')
      setDeleteOpen(false)
    }
  }

  // Iniziali dell'avatar grande in alto (es. "MR").
  const initials = currentAccount?.nome
    ? `${currentAccount.nome.charAt(0)}${(currentAccount.cognome ?? '').charAt(0)}`.toUpperCase()
    : '?'

  return (
    <Stack spacing={3}>
      {feedback ? <Alert severity={feedback.severity}>{feedback.message}</Alert> : null}

      {/* CARD INTESTAZIONE: avatar, nome, email, squadra, link al profilo pubblico. */}
      <Card variant="outlined">
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', height: 80, width: 80, fontSize: 28 }}>
              {initials}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h5">
                {currentAccount?.nome} {currentAccount?.cognome}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {currentAccount?.email}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                {squadra ? (
                  <Chip
                    component={Link}
                    clickable
                    color="primary"
                    label={`Squadra: ${squadra.nome}`}
                    to={`/squadra/${squadra.id}`}
                  />
                ) : (
                  <Chip label="Nessuna squadra" />
                )}
              </Stack>
            </Box>
            {currentAccount ? (
              <Button
                component={Link}
                endIcon={<OpenInNewRoundedIcon />}
                to={`/profilo/${currentAccount.id}`}
                variant="outlined"
              >
                Profilo pubblico
              </Button>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      {/* CARD DI MODIFICA DATI: form con campi nome, email, ecc. + password di conferma. */}
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ManageAccountsRoundedIcon color="primary" />
            <Typography variant="h6">Modifica i tuoi dati</Typography>
          </Stack>
          <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }} variant="body2">
            Inserisci la tua password attuale per confermare ogni modifica.
          </Typography>

          <Stack component="form" onSubmit={handleSave} spacing={2}>
            <Grid container spacing={2}>
              <Grid item sm={6} xs={12}>
                <TextField
                  fullWidth
                  label="Nome"
                  onChange={(e) => setField('nome', e.target.value)}
                  value={form.nome}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField
                  fullWidth
                  label="Cognome"
                  onChange={(e) => setField('cognome', e.target.value)}
                  value={form.cognome}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  onChange={(e) => setField('email', e.target.value)}
                  type="email"
                  value={form.email}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField
                  fullWidth
                  label="Nazionalita"
                  onChange={(e) => setField('nazionalita', e.target.value)}
                  value={form.nazionalita}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="Data di nascita"
                  onChange={(e) => setField('data_nascita', e.target.value)}
                  type="date"
                  value={form.data_nascita}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField
                  fullWidth
                  label="Sesso"
                  onChange={(e) => setField('sesso', e.target.value)}
                  select
                  value={form.sesso}
                >
                  <MenuItem value="Maschio">Maschio</MenuItem>
                  <MenuItem value="Femmina">Femmina</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Indirizzo"
                  onChange={(e) => setField('indirizzo', e.target.value)}
                  value={form.indirizzo}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Conferma con la tua password"
                  onChange={(e) => setField('password', e.target.value)}
                  type="password"
                  value={form.password}
                />
              </Grid>
            </Grid>
            {/* Pulsanti in basso a destra: "Elimina" (rosso) e "Salva" (blu). */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
              <Button
                color="error"
                onClick={() => setDeleteOpen(true)}
                startIcon={<DeleteOutlineRoundedIcon />}
                variant="outlined"
              >
                Elimina account
              </Button>
              <Button
                disabled={actionLoading === 'save'}
                startIcon={<SaveRoundedIcon />}
                type="submit"
                variant="contained"
              >
                {actionLoading === 'save' ? 'Salvataggio...' : 'Salva modifiche'}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* DIALOGO di conferma eliminazione: si apre cliccando "Elimina account". */}
      <Dialog onClose={() => setDeleteOpen(false)} open={deleteOpen}>
        <DialogTitle>Eliminare l account?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Questa operazione e permanente. Verrai disconnesso e non potrai recuperare i tuoi dati.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Annulla</Button>
          <Button
            color="error"
            disabled={actionLoading === 'delete'}
            onClick={handleConfirmDelete}
            variant="contained"
          >
            {actionLoading === 'delete' ? 'Eliminazione...' : 'Elimina'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
