// =============================================================================
// AuthPage.jsx - pagina /auth: login e registrazione.
//
// È divisa in due colonne:
//   - SINISTRA (pannello blu marketing): logo + frasi e funzionalità del sito.
//   - DESTRA (form): scheda Login oppure Registrazione, scegli con un Tab.
//
// Se sei già loggato vieni rimandato alla home automaticamente.
// =============================================================================

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

// "Modulo vuoto" usato come stato iniziale del form di login.
const emptyLoginForm = { email: '', password: '' }
// "Modulo vuoto" della registrazione: ha tutti i campi richiesti dal backend.
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

// Le 3 "feature" mostrate nel pannello blu di sinistra (riga icona + titolo + testo).
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

  // Stato locale: quale tab è selezionata, contenuto dei due form, ecc.
  const [authMode, setAuthMode] = useState('login')         // 'login' o 'register'
  const [loginForm, setLoginForm] = useState(emptyLoginForm)
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm)
  const [loadingAction, setLoadingAction] = useState('')    // serve a disabilitare i pulsanti
  const [feedback, setFeedback] = useState(null)            // messaggio di errore/successo

  // Se sei già loggato, ti porto alla home senza nemmeno mostrare la pagina.
  if (isAuthenticated) return <Navigate replace to="/home" />

  // Funzioni di utilità per aggiornare un singolo campo dei form.
  const updateLoginField = (field, value) =>
    setLoginForm((c) => ({ ...c, [field]: value }))
  const updateRegisterField = (field, value) =>
    setRegisterForm((c) => ({ ...c, [field]: value }))

  // ---- LOGIN ----
  async function handleLogin(event) {
    event.preventDefault()
    setFeedback(null)
    setLoadingAction('login')
    try {
      // login() viene dal contesto di autenticazione: chiama il backend e
      // salva il token JWT se va a buon fine.
      await login(loginForm)
      navigate('/home')                              // ti porto alla home
    } catch (error) {
      setFeedback({ severity: 'error', message: error.message })
    } finally {
      setLoadingAction('')
    }
  }

  // ---- REGISTRAZIONE ----
  async function handleRegister(event) {
    event.preventDefault()
    setFeedback(null)
    setLoadingAction('register')
    try {
      await accountService.register(registerForm)
      setFeedback({ severity: 'success', message: 'Account creato. Effettua il login per entrare.' })
      setRegisterForm(emptyRegisterForm)
      setAuthMode('login')                           // dopo la registrazione mostro la scheda Login
    } catch (error) {
      setFeedback({ severity: 'error', message: error.message })
    } finally {
      setLoadingAction('')
    }
  }

  return (
    // Sfondo a tutta pagina con gradiente blu (centra il box bianco al centro).
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 4,
        background: 'linear-gradient(135deg, #0d3b66 0%, #1976d2 60%, #4ea3f5 100%)',
      }}
    >
      {/* CONTENITORE A 2 COLONNE: marketing | form. Su mobile diventa 1 colonna. */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 1100,
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        }}
      >
        {/* COLONNA SINISTRA: pannello blu di marketing. */}
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

          {/* Le 3 feature, generate dal ciclo su FEATURES. */}
          <Stack spacing={2}>
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <Stack alignItems="flex-start" direction="row" key={title} spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: '#fff' }} variant="rounded">
                  <Icon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">{title}</Typography>
                  <Typography sx={{ opacity: 0.85 }} variant="body2">
                    {text}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Paper>

        {/* COLONNA DESTRA: form di login/registrazione. */}
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

          {/* TAB per scegliere tra Login e Registrazione. */}
          <Tabs
            onChange={(_, value) => setAuthMode(value)}
            sx={{ px: { xs: 1, sm: 2 }, pt: 2 }}
            value={authMode}
          >
            <Tab icon={<LoginRoundedIcon fontSize="small" />} iconPosition="start" label="Login" value="login" />
            <Tab icon={<HowToRegRoundedIcon fontSize="small" />} iconPosition="start" label="Registrati" value="register" />
          </Tabs>

          <Divider />

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Eventuale messaggio di feedback (errore / successo) sopra al form. */}
            {feedback ? (
              <Alert severity={feedback.severity} sx={{ mb: 2 }}>
                {feedback.message}
              </Alert>
            ) : null}

            {/* IN BASE alla tab attiva mostriamo il form di login o quello di registrazione. */}
            {authMode === 'login' ? (
              // ---- FORM LOGIN ----
              <Stack component="form" onSubmit={handleLogin} spacing={2}>
                <TextField
                  fullWidth
                  label="Email"
                  onChange={(e) => updateLoginField('email', e.target.value)}
                  type="email"
                  value={loginForm.email}
                />
                <TextField
                  fullWidth
                  label="Password"
                  onChange={(e) => updateLoginField('password', e.target.value)}
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
              // ---- FORM REGISTRAZIONE ----
              <Stack component="form" onSubmit={handleRegister} spacing={2}>
                {/* Griglia a 2 colonne (1 sola su schermi piccoli) per i campi. */}
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  }}
                >
                  <TextField
                    label="Nome"
                    onChange={(e) => updateRegisterField('nome', e.target.value)}
                    required
                    value={registerForm.nome}
                  />
                  <TextField
                    label="Cognome"
                    onChange={(e) => updateRegisterField('cognome', e.target.value)}
                    required
                    value={registerForm.cognome}
                  />
                  <TextField
                    label="Email"
                    onChange={(e) => updateRegisterField('email', e.target.value)}
                    required
                    sx={{ gridColumn: { sm: '1 / -1' } }}     // l'email occupa entrambe le colonne
                    type="email"
                    value={registerForm.email}
                  />
                  <TextField
                    label="Password"
                    onChange={(e) => updateRegisterField('password', e.target.value)}
                    required
                    type="password"
                    value={registerForm.password}
                  />
                  <TextField
                    label="Nazionalita"
                    onChange={(e) => updateRegisterField('nazionalita', e.target.value)}
                    required
                    value={registerForm.nazionalita}
                  />
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    label="Data di nascita"
                    onChange={(e) => updateRegisterField('data_nascita', e.target.value)}
                    required
                    type="date"
                    value={registerForm.data_nascita}
                  />
                  <TextField
                    label="Sesso"
                    onChange={(e) => updateRegisterField('sesso', e.target.value)}
                    required
                    select
                    value={registerForm.sesso}
                  >
                    <MenuItem value="Maschio">Maschio</MenuItem>
                    <MenuItem value="Femmina">Femmina</MenuItem>
                  </TextField>
                  <TextField
                    label="Indirizzo"
                    onChange={(e) => updateRegisterField('indirizzo', e.target.value)}
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
