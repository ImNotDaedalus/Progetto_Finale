// =============================================================================
// ProfilePage.jsx - pagina pubblica del profilo /profilo/:id.
//
// Mostra le informazioni di un utente: nome, email, nazionalità, indirizzo,
// e la squadra a cui appartiene (se ne ha una). Si arriva qui cliccando
// sui nomi dei giocatori in altre pagine. Serve essere loggati per vederla.
// =============================================================================

import EmailRoundedIcon from '@mui/icons-material/EmailRounded'
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded'
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { accountService } from '../services/accountService'
import { squadraService } from '../services/squadraService'

/** Mostra una "riga di info": icona + etichetta piccola + valore.
 *  Usato per Email, Nazionalità, Indirizzo, ecc. */
function InfoRow({ icon: Icon, label, value }) {
  return (
    <Stack alignItems="center" direction="row" spacing={1.5}>
      <Avatar sx={{ bgcolor: 'action.hover', color: 'text.secondary' }} variant="rounded">
        <Icon />
      </Avatar>
      <Box>
        <Typography color="text.secondary" variant="caption">
          {label}
        </Typography>
        {/* "—" è il trattino lungo, mostrato quando il valore è vuoto. */}
        <Typography variant="body1">{value || '—'}</Typography>
      </Box>
    </Stack>
  )
}

export default function ProfilePage() {
  // useParams legge i pezzi variabili dell'URL (qui :id, es. /profilo/42 -> id="42").
  const { id } = useParams()
  const { token, isAuthenticated } = useAuth()

  // Dati che la pagina mostrerà.
  const [account, setAccount] = useState(null)   // l'utente che si sta guardando
  const [squadra, setSquadra] = useState(null)   // la sua squadra (se ne ha una)
  const [error, setError] = useState('')         // eventuale messaggio di errore

  // useEffect = "esegui questo codice quando la pagina si carica o quando
  // cambiano i valori in [id, token, isAuthenticated]".
  useEffect(() => {
    if (!isAuthenticated) return  // non sei loggato? non scaricare nulla.
    let ignore = false            // bandiera per evitare di aggiornare lo stato se la pagina viene chiusa nel frattempo

    async function load() {
      try {
        // Scarica i dati dell'utente.
        const acc = await accountService.getAccountById(Number(id), token)
        if (ignore) return
        setAccount(acc)
        // Se l'utente ha una squadra, scarica anche quella.
        if (acc.id_squadra) {
          const sq = await squadraService.getSquadraById(acc.id_squadra)
          if (!ignore) setSquadra(sq)
        } else {
          setSquadra(null)
        }
      } catch (err) {
        // Se qualcosa va male (es. utente non trovato), mostriamo l'errore.
        if (!ignore) setError(err.message)
      }
    }
    load()

    // Cleanup: alza la bandiera se la pagina viene smontata.
    return () => {
      ignore = true
    }
  }, [id, token, isAuthenticated])

  // Caso 1: non loggato -> invito ad accedere.
  if (!isAuthenticated) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Alert severity="info">Effettua il login per vedere il profilo.</Alert>
          <Button component={Link} sx={{ mt: 2 }} to="/auth" variant="contained">
            Vai al login
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Caso 2: errore di caricamento.
  if (error) return <Alert severity="error">{error}</Alert>
  // Caso 3: dati non ancora arrivati -> mostriamo "Caricamento...".
  if (!account) return <Typography>Caricamento...</Typography>

  // Iniziali da mostrare nell'avatar tondo grande (es. "MR").
  const initials = `${account.nome?.charAt(0) ?? ''}${account.cognome?.charAt(0) ?? ''}`.toUpperCase()
  // Stile delle "etichette" sopra al gradiente blu.
  const chipSx = { bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }

  return (
    <Stack spacing={3}>
      {/* INTESTAZIONE BLU con avatar grande, nome e squadra. */}
      <Card
        sx={{
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1976d2 0%, #4ea3f5 100%)',
          color: '#fff',
        }}
        variant="outlined"
      >
        <CardContent>
          <Stack alignItems="center" direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', height: 88, width: 88, fontSize: 32 }}>
              {/* Se non ho iniziali (manca il nome) mostro l'icona omino. */}
              {initials || <PersonRoundedIcon />}
            </Avatar>
            <Box flex={1}>
              <Typography variant="overline">Profilo</Typography>
              <Typography variant="h4">
                {account.nome} {account.cognome}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mt: 1.5 }}>
                {/* Etichetta squadra: cliccabile se l'utente ne ha una. */}
                {squadra ? (
                  <Chip
                    component={Link}
                    clickable
                    label={`Squadra: ${squadra.nome}`}
                    sx={chipSx}
                    to={`/squadra/${squadra.id}`}
                  />
                ) : (
                  <Chip label="Nessuna squadra" sx={chipSx} />
                )}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* CARD "Informazioni": email, nazionalità, indirizzo. */}
      <Card variant="outlined">
        <CardContent>
          <Typography sx={{ mb: 2 }} variant="h6">
            Informazioni
          </Typography>
          <Stack spacing={2}>
            <InfoRow icon={EmailRoundedIcon} label="Email" value={account.email} />
            <InfoRow icon={LanguageRoundedIcon} label="Nazionalita" value={account.nazionalita} />
            <InfoRow icon={HomeWorkRoundedIcon} label="Indirizzo" value={account.indirizzo} />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
