// Pagina /account: il profilo personale dell'utente loggato.
// Permette di aggiornare i propri dati o di cancellare il proprio
// account. Niente piu pannello di amministrazione.

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

export default function AccountsPage() {
  const navigate = useNavigate()
  const { currentAccount, isAuthenticated, logout, refreshProfile, token } =
    useAuth()

  const [form, setForm] = useState(emptyProfileForm)
  const [squadra, setSquadra] = useState(null)
  const [actionLoading, setActionLoading] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (!currentAccount) {
      setForm(emptyProfileForm)
      return
    }
    setForm({
      nome: currentAccount.nome ?? '',
      cognome: currentAccount.cognome ?? '',
      email: currentAccount.email ?? '',
      password: '',
      nazionalita: currentAccount.nazionalita ?? '',
      data_nascita: currentAccount.data_nascita ?? '',
      sesso: currentAccount.sesso ?? '',
      indirizzo: currentAccount.indirizzo ?? '',
    })
  }, [currentAccount])

  useEffect(() => {
    if (!currentAccount?.id_squadra) {
      setSquadra(null)
      return
    }
    let ignore = false
    squadraService
      .getSquadraById(currentAccount.id_squadra)
      .then((sq) => {
        if (!ignore) setSquadra(sq)
      })
      .catch(() => {
        if (!ignore) setSquadra(null)
      })
    return () => {
      ignore = true
    }
  }, [currentAccount])

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

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSave(event) {
    event.preventDefault()
    if (!currentAccount) return

    if (!form.password) {
      setFeedback({
        severity: 'warning',
        message: 'Inserisci la tua password per confermare le modifiche.',
      })
      return
    }

    const emailChanged = currentAccount.email !== form.email
    setFeedback(null)
    setActionLoading('save')
    try {
      await accountService.updateAccount(
        currentAccount.id,
        { ...form, id_squadra: currentAccount.id_squadra ?? null },
        token,
      )
      if (emailChanged) {
        logout()
        navigate('/auth')
        return
      }
      await refreshProfile(token)
      setFeedback({ severity: 'success', message: 'Profilo aggiornato.' })
      setForm((current) => ({ ...current, password: '' }))
    } catch (error) {
      setFeedback({ severity: 'error', message: error.message })
    } finally {
      setActionLoading('')
    }
  }

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

  const initials =
    currentAccount && currentAccount.nome
      ? `${currentAccount.nome.charAt(0)}${(currentAccount.cognome ?? '').charAt(0)}`.toUpperCase()
      : '?'

  return (
    <Stack spacing={3}>
      {feedback ? <Alert severity={feedback.severity}>{feedback.message}</Alert> : null}

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
                  onChange={(event) => setField('nome', event.target.value)}
                  value={form.nome}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField
                  fullWidth
                  label="Cognome"
                  onChange={(event) => setField('cognome', event.target.value)}
                  value={form.cognome}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  onChange={(event) => setField('email', event.target.value)}
                  type="email"
                  value={form.email}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField
                  fullWidth
                  label="Nazionalita"
                  onChange={(event) => setField('nazionalita', event.target.value)}
                  value={form.nazionalita}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="Data di nascita"
                  onChange={(event) => setField('data_nascita', event.target.value)}
                  type="date"
                  value={form.data_nascita}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField
                  fullWidth
                  label="Sesso"
                  onChange={(event) => setField('sesso', event.target.value)}
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
                  onChange={(event) => setField('indirizzo', event.target.value)}
                  value={form.indirizzo}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Conferma con la tua password"
                  onChange={(event) => setField('password', event.target.value)}
                  type="password"
                  value={form.password}
                />
              </Grid>
            </Grid>
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

      <Dialog onClose={() => setDeleteOpen(false)} open={deleteOpen}>
        <DialogTitle>Eliminare l account?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Questa operazione e permanente. Verrai disconnesso e non potrai
            recuperare i tuoi dati.
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
