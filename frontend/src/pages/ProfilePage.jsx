// Pagina pubblica del profilo /profilo/:id.

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
        <Typography variant="body1">{value || '—'}</Typography>
      </Box>
    </Stack>
  )
}

export default function ProfilePage() {
  const { id } = useParams()
  const { token, isAuthenticated } = useAuth()

  const [account, setAccount] = useState(null)
  const [squadra, setSquadra] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return
    let ignore = false
    async function load() {
      try {
        const acc = await accountService.getAccountById(Number(id), token)
        if (ignore) return
        setAccount(acc)
        if (acc.id_squadra) {
          const sq = await squadraService.getSquadraById(acc.id_squadra)
          if (!ignore) setSquadra(sq)
        } else if (!ignore) {
          setSquadra(null)
        }
      } catch (err) {
        if (!ignore) setError(err.message)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [id, token, isAuthenticated])

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

  if (error) return <Alert severity="error">{error}</Alert>
  if (!account) return <Typography>Caricamento...</Typography>

  const initials = `${account.nome?.charAt(0) ?? ''}${account.cognome?.charAt(0) ?? ''}`.toUpperCase()

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          borderRadius: 4,
          background:
            'linear-gradient(135deg, #1976d2 0%, #4ea3f5 100%)',
          color: '#fff',
        }}
        variant="outlined"
      >
        <CardContent>
          <Stack alignItems="center" direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', height: 88, width: 88, fontSize: 32 }}>
              {initials || <PersonRoundedIcon />}
            </Avatar>
            <Box flex={1}>
              <Typography variant="overline">Profilo</Typography>
              <Typography variant="h4">
                {account.nome} {account.cognome}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mt: 1.5 }}>
                {squadra ? (
                  <Chip
                    component={Link}
                    clickable
                    label={`Squadra: ${squadra.nome}`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }}
                    to={`/squadra/${squadra.id}`}
                  />
                ) : (
                  <Chip
                    label="Nessuna squadra"
                    sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }}
                  />
                )}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography sx={{ mb: 2 }} variant="h6">
            Informazioni
          </Typography>
          <Stack spacing={2}>
            <InfoRow icon={EmailRoundedIcon} label="Email" value={account.email} />
            <InfoRow
              icon={LanguageRoundedIcon}
              label="Nazionalita"
              value={account.nazionalita}
            />
            <InfoRow
              icon={HomeWorkRoundedIcon}
              label="Indirizzo"
              value={account.indirizzo}
            />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
