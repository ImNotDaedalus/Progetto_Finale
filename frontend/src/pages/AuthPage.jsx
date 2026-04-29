// Pagina di accesso: a sinistra un pannello "marketing", a destra le
// schede Login / Registrazione.

import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded'
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded'
import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import PoolRoundedIcon from '@mui/icons-material/PoolRounded'
import SportsScoreRoundedIcon from '@mui/icons-material/SportsScoreRounded'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Divider,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { accountService } from '../services/accountService'

const emptyLoginForm = { email: '', password: '' }
const emptyRegisterForm = {
  nome: '',
  cognome: '',
  email: '',
  password: '',
  nazionalita: '',
  data_nascita: '',
  sesso: '',
  indirizzo: '',
}

const FEATURES = [
  {
    icon: EmojiEventsRoundedIcon,
    title: 'Crea i tuoi tornei',
    text: 'Definisci date, divisione e luogo: ricevi le iscrizioni delle squadre.',
  },
  {
    icon: Groups2RoundedIcon,
    title: 'Componi la squadra',
    text: 'Invita i giocatori e gestisci il roster con un click.',
  },
  {
    icon: SportsScoreRoundedIcon,
    title: 'Segna i risultati',
    text: 'Statistiche aggiornate per ogni squadra dopo ogni gara.',
  },
]

export default function AuthPage() {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()

  const [authMode, setAuthMode] = useState('login')
  const [loginForm, setLoginForm] = useState(emptyLoginForm)
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm)
  const [loadingAction, setLoadingAction] = useState('')
  const [feedback, setFeedback] = useState(null)

  if (isAuthenticated) {
    return <Navigate replace to="/home" />
  }

  function updateLoginField(field, value) {
    setLoginForm((current) => ({ ...current, [field]: value }))
  }

  function updateRegisterField(field, value) {
    setRegisterForm((current) => ({ ...current, [field]: value }))
  }

  async function handleLogin(event) {
    event.preventDefault()
    setFeedback(null)
    setLoadingAction('login')
    try {
      await login(loginForm)
      navigate('/home')
    } catch (error) {
      setFeedback({ severity: 'error', message: error.message })
    } finally {
      setLoadingAction('')
    }
  }

  async function handleRegister(event) {
    event.preventDefault()
    setFeedback(null)
    setLoadingAction('register')
    try {
      await accountService.register(registerForm)
      setFeedback({
        severity: 'success',
        message: 'Account creato. Effettua il login per entrare.',
      })
      setRegisterForm(emptyRegisterForm)
      setAuthMode('login')
    } catch (error) {
      setFeedback({ severity: 'error', message: error.message })
    } finally {
      setLoadingAction('')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 4,
        background:
          'linear-gradient(135deg, #0d3b66 0%, #1976d2 60%, #4ea3f5 100%)',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 1100,
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        }}
      >
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            background: 'rgba(13,59,102,0.85)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
          variant="outlined"
        >
          <Stack alignItems="center" direction="row" spacing={1.5}>
            <Avatar sx={{ bgcolor: '#fff', color: 'primary.main' }} variant="rounded">
              <PoolRoundedIcon />
            </Avatar>
            <Typography variant="h5">Pallanuoto Manager</Typography>
          </Stack>

          <Typography variant="h4" sx={{ lineHeight: 1.2 }}>
            La piattaforma per organizzare la tua stagione di pallanuoto.
          </Typography>

          <Stack spacing={2}>
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <Stack alignItems="flex-start" direction="row" key={feature.title} spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.16)',
                      color: '#fff',
                    }}
                    variant="rounded"
                  >
                    <Icon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">{feature.title}</Typography>
                    <Typography sx={{ opacity: 0.85 }} variant="body2">
                      {feature.text}
                    </Typography>
                  </Box>
                </Stack>
              )
            })}
          </Stack>
        </Paper>

        <Paper sx={{ borderRadius: 4, overflow: 'hidden' }} variant="outlined">
          <Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 } }}>
            <Typography variant="h5">
              {authMode === 'login' ? 'Accedi al tuo account' : 'Crea un nuovo account'}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
              {authMode === 'login'
                ? 'Inserisci email e password per entrare.'
                : 'Compila i dati per iscriverti alla piattaforma.'}
            </Typography>
          </Box>

          <Tabs
            onChange={(_, value) => setAuthMode(value)}
            sx={{ px: { xs: 1, sm: 2 }, pt: 2 }}
            value={authMode}
          >
            <Tab
              icon={<LoginRoundedIcon fontSize="small" />}
              iconPosition="start"
              label="Login"
              value="login"
            />
            <Tab
              icon={<HowToRegRoundedIcon fontSize="small" />}
              iconPosition="start"
              label="Registrati"
              value="register"
            />
          </Tabs>

          <Divider />

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {feedback ? (
              <Alert severity={feedback.severity} sx={{ mb: 2 }}>
                {feedback.message}
              </Alert>
            ) : null}

            {authMode === 'login' ? (
              <Stack component="form" onSubmit={handleLogin} spacing={2}>
                <TextField
                  fullWidth
                  label="Email"
                  onChange={(event) => updateLoginField('email', event.target.value)}
                  type="email"
                  value={loginForm.email}
                />
                <TextField
                  fullWidth
                  label="Password"
                  onChange={(event) => updateLoginField('password', event.target.value)}
                  type="password"
                  value={loginForm.password}
                />
                <Button
                  disabled={loadingAction === 'login'}
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                >
                  {loadingAction === 'login' ? 'Accesso in corso...' : 'Accedi'}
                </Button>
              </Stack>
            ) : (
              <Stack component="form" onSubmit={handleRegister} spacing={2}>
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  }}
                >
                  <TextField
                    label="Nome"
                    onChange={(event) => updateRegisterField('nome', event.target.value)}
                    required
                    value={registerForm.nome}
                  />
                  <TextField
                    label="Cognome"
                    onChange={(event) => updateRegisterField('cognome', event.target.value)}
                    required
                    value={registerForm.cognome}
                  />
                  <TextField
                    label="Email"
                    onChange={(event) => updateRegisterField('email', event.target.value)}
                    required
                    sx={{ gridColumn: { sm: '1 / -1' } }}
                    type="email"
                    value={registerForm.email}
                  />
                  <TextField
                    label="Password"
                    onChange={(event) => updateRegisterField('password', event.target.value)}
                    required
                    type="password"
                    value={registerForm.password}
                  />
                  <TextField
                    label="Nazionalita"
                    onChange={(event) => updateRegisterField('nazionalita', event.target.value)}
                    required
                    value={registerForm.nazionalita}
                  />
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    label="Data di nascita"
                    onChange={(event) =>
                      updateRegisterField('data_nascita', event.target.value)
                    }
                    required
                    type="date"
                    value={registerForm.data_nascita}
                  />
                  <TextField
                    label="Sesso"
                    onChange={(event) => updateRegisterField('sesso', event.target.value)}
                    required
                    select
                    value={registerForm.sesso}
                  >
                    <MenuItem value="Maschio">Maschio</MenuItem>
                    <MenuItem value="Femmina">Femmina</MenuItem>
                  </TextField>
                  <TextField
                    label="Indirizzo"
                    onChange={(event) => updateRegisterField('indirizzo', event.target.value)}
                    required
                    sx={{ gridColumn: { sm: '1 / -1' } }}
                    value={registerForm.indirizzo}
                  />
                </Box>
                <Button
                  disabled={loadingAction === 'register'}
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                >
                  {loadingAction === 'register' ? 'Creazione...' : 'Crea il mio account'}
                </Button>
              </Stack>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}
