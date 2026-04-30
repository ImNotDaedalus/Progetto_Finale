// =============================================================================
// HomePage.jsx - dashboard / pagina iniziale dell'utente loggato.
//
// Mostra:
//   - una grande "intestazione blu" con saluto e pulsanti rapidi
//   - quattro contatori (tornei, squadre, gare, inviti)
//   - le squadre dell'utente
//   - le prossime gare in calendario
//
// Se l'utente NON è loggato, mostra invece un pannello di benvenuto con
// inviti a registrarsi/accedere.
// =============================================================================

import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded'
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded'
import SportsScoreRoundedIcon from '@mui/icons-material/SportsScoreRounded'
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { garaService } from '../services/garaService'
import { inviteService } from '../services/inviteService'
import { squadraService } from '../services/squadraService'
import { torneoService } from '../services/torneoService'

// Sfondo sfumato dell'intestazione (riusato in più punti).
const HERO_GRADIENT = 'linear-gradient(135deg, #0d3b66 0%, #1976d2 70%, #4ea3f5 100%)'

/** Piccolo componente: una card colorata che mostra una statistica
 *  (icona, etichetta, valore). Riutilizzato 4 volte nei contatori. */
function StatCard({ color, icon: Icon, label, value }) {
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        background: alpha(color, 0.08),                  // sfondo del colore richiesto, ma molto trasparente
        border: `1px solid ${alpha(color, 0.18)}`,
      }}
      variant="outlined"
    >
      <Stack alignItems="center" direction="row" spacing={2}>
        <Avatar sx={{ bgcolor: color, color: '#fff' }} variant="rounded">
          <Icon />
        </Avatar>
        <Box>
          <Typography color="text.secondary" variant="caption">
            {label}
          </Typography>
          <Typography variant="h5">{value}</Typography>
        </Box>
      </Stack>
    </Paper>
  )
}

// Configurazione dei 4 contatori. Tenerli in una lista permette di disegnarli
// con un solo ciclo (vedi più sotto: STATS.map(...)).
const STATS = [
  { color: '#1976d2', icon: EmojiEventsRoundedIcon, label: 'Tornei attivi', key: 'tornei' },
  { color: '#2e7d32', icon: Groups2RoundedIcon, label: 'Squadre', key: 'squadre' },
  { color: '#9c27b0', icon: SportsScoreRoundedIcon, label: 'Gare in calendario', key: 'gare' },
  { color: '#ef6c00', icon: NotificationsActiveRoundedIcon, label: 'Inviti da leggere', key: 'inviti' },
]

export default function HomePage() {
  const { currentAccount, isAuthenticated } = useAuth()
  const [tornei, setTornei] = useState([])
  const [squadre, setSquadre] = useState([])
  const [gare, setGare] = useState([])

  // Quando l'utente è loggato, scarichiamo tornei/squadre/gare in parallelo.
  useEffect(() => {
    if (!isAuthenticated) return
    let ignore = false
    Promise.all([torneoService.getTornei(), squadraService.getSquadre(), garaService.getGare()])
      .then(([t, s, g]) => {
        if (ignore) return
        setTornei(t)
        setSquadre(s)
        setGare(g)
      })
      .catch(() => {
        // i singoli pannelli mostrano "0" se la chiamata fallisce
      })
    return () => {
      ignore = true
    }
  }, [isAuthenticated])

  // Inviti "in attesa" ricevuti dall'utente corrente (calcolati dal localStorage).
  const inviti = useMemo(() => {
    if (!currentAccount) return []
    return inviteService
      .getInvitiPerAccount(currentAccount.id)
      .filter((i) => i.stato === 'pending')
  }, [currentAccount])

  // Le squadre "mie": quelle di cui sono proprietario o di cui sono membro.
  const mieSquadre = useMemo(() => {
    if (!currentAccount) return []
    return squadre.filter(
      (sq) => sq.id_proprietario === currentAccount.id || currentAccount.id_squadra === sq.id,
    )
  }, [squadre, currentAccount])

  // Le 5 prossime gare in ordine di data/ora (ignorando quelle già passate).
  const prossimeGare = useMemo(() => {
    const oggi = new Date().toISOString().slice(0, 10)   // data di oggi nel formato AAAA-MM-GG
    return [...gare]
      .filter((g) => (g.data ?? '') >= oggi)
      .sort((a, b) =>
        `${a.data ?? ''} ${a.ora ?? ''}`.localeCompare(`${b.data ?? ''} ${b.ora ?? ''}`),
      )
      .slice(0, 5)
  }, [gare])

  // ---- VISTA 1: utente NON loggato ----
  // Pannello di benvenuto con due CTA (call to action).
  if (!isAuthenticated) {
    return (
      <Stack spacing={3}>
        <Paper
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, #0d3b66 0%, #1976d2 60%, #4ea3f5 100%)',
            color: '#fff',
          }}
          variant="outlined"
        >
          <Typography variant="overline">Pallanuoto Manager</Typography>
          <Typography variant="h3" sx={{ mt: 1, mb: 2, maxWidth: 720 }}>
            Organizza tornei, gestisci squadre e segui i risultati in un unico posto.
          </Typography>
          <Typography sx={{ maxWidth: 640, opacity: 0.9 }}>
            Crea il tuo profilo, fonda una squadra, invita i giocatori e iscrivi la squadra a un
            torneo. Quando arrivano i risultati, l albo della squadra si aggiorna automaticamente.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
            <Button color="inherit" component={Link} size="large" to="/auth" variant="contained">
              Accedi
            </Button>
            <Button
              component={Link}
              size="large"
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)' }}
              to="/auth"
              variant="outlined"
            >
              Crea un account
            </Button>
          </Stack>
        </Paper>
      </Stack>
    )
  }

  // Mappa dei contatori: chiave -> numero da mostrare nelle StatCard.
  const counts = {
    tornei: tornei.length,
    squadre: squadre.length,
    gare: gare.length,
    inviti: inviti.length,
  }

  // ---- VISTA 2: utente loggato (dashboard) ----
  return (
    <Stack spacing={3}>
      {/* INTESTAZIONE blu con saluto e pulsanti rapidi. */}
      <Paper
        sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, background: HERO_GRADIENT, color: '#fff' }}
        variant="outlined"
      >
        <Typography variant="overline">Dashboard</Typography>
        <Typography variant="h4" sx={{ mt: 0.5 }}>
          Bentornato{currentAccount ? `, ${currentAccount.nome}` : ''}.
        </Typography>
        <Typography sx={{ mt: 1, opacity: 0.9, maxWidth: 720 }}>
          Da qui puoi creare un torneo, fondare una squadra o controllare gli inviti che hai ricevuto.
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mt: 3 }}>
          <Button
            color="inherit"
            component={Link}
            startIcon={<EmojiEventsRoundedIcon />}
            to="/tornei"
            variant="contained"
          >
            Vai ai tornei
          </Button>
          <Button
            component={Link}
            startIcon={<Groups2RoundedIcon />}
            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)' }}
            to="/squadre"
            variant="outlined"
          >
            Vai alle squadre
          </Button>
        </Stack>
      </Paper>

      {/* RIGA DEI CONTATORI: 4 statistiche, generate dal ciclo su STATS. */}
      <Grid container spacing={2}>
        {STATS.map((stat) => (
          <Grid item key={stat.key} md={3} sm={6} xs={12}>
            <StatCard color={stat.color} icon={stat.icon} label={stat.label} value={counts[stat.key]} />
          </Grid>
        ))}
      </Grid>

      {/* DUE COLONNE: "Le tue squadre" e "Prossime gare". */}
      <Grid container spacing={2.5}>
        {/* COLONNA SINISTRA: le tue squadre. */}
        <Grid item md={6} xs={12}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Le tue squadre</Typography>
                <Button component={Link} size="small" to="/squadre">
                  Tutte
                </Button>
              </Stack>
              <Box sx={{ mt: 2 }}>
                {mieSquadre.length === 0 ? (
                  <Typography color="text.secondary" variant="body2">
                    Non sei ancora in nessuna squadra. Creane una o accetta un invito.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {mieSquadre.map((sq) => (
                      // Ogni "card cliccabile" porta alla pagina della squadra.
                      <CardActionArea
                        component={Link}
                        key={sq.id}
                        sx={{ borderRadius: 2, p: 1.5, border: '1px solid', borderColor: 'divider' }}
                        to={`/squadra/${sq.id}`}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <Groups2RoundedIcon fontSize="small" />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1">{sq.nome}</Typography>
                              <Typography color="text.secondary" variant="caption">
                                {sq.id_proprietario === currentAccount?.id
                                  ? 'Sei il proprietario'
                                  : 'Giocatore'}
                              </Typography>
                            </Box>
                          </Stack>
                          <Chip label="Apri" size="small" />
                        </Stack>
                      </CardActionArea>
                    ))}
                  </Stack>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* COLONNA DESTRA: prossime gare in calendario. */}
        <Grid item md={6} xs={12}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Prossime gare</Typography>
                <Button component={Link} size="small" to="/gare">
                  Calendario
                </Button>
              </Stack>
              <Box sx={{ mt: 2 }}>
                {prossimeGare.length === 0 ? (
                  <Typography color="text.secondary" variant="body2">
                    Non ci sono gare programmate.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {prossimeGare.map((gara) => {
                      // Per ogni gara cerco il torneo a cui appartiene (per mostrare il nome).
                      const torneo = tornei.find((t) => t.id === gara.id_torneo)
                      return (
                        <Paper key={gara.id} sx={{ p: 1.5 }} variant="outlined">
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="subtitle2">
                                {torneo ? torneo.nome : 'Gara amichevole'}
                              </Typography>
                              <Typography color="text.secondary" variant="caption">
                                {gara.data} • {gara.ora ?? '--:--'}
                              </Typography>
                            </Box>
                            {torneo ? (
                              <Button component={Link} size="small" to={`/torneo/${torneo.id}`}>
                                Apri
                              </Button>
                            ) : null}
                          </Stack>
                        </Paper>
                      )
                    })}
                  </Stack>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  )
}
