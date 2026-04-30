// =============================================================================
// navigation.js - elenco delle voci del menu laterale (sidebar).
//
// Ogni voce ha:
//   - label: il testo che si vede
//   - path: l'indirizzo del sito a cui porta (es. /tornei)
//   - icon: l'icona da mostrare (presa dalla libreria Material UI)
//   - description: testo piccolo mostrato sotto la voce
//
// Tenere queste voci in un file separato rende facile aggiungerne / toglierne
// senza dover toccare il layout principale.
// =============================================================================

import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded'
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded'
import SportsScoreRoundedIcon from '@mui/icons-material/SportsScoreRounded'

export const navigationItems = [
  {
    label: 'Home',
    path: '/home',
    icon: HomeRoundedIcon,
    description: 'La tua dashboard',
  },
  {
    label: 'Tornei',
    path: '/tornei',
    icon: EmojiEventsRoundedIcon,
    description: 'Calendario e iscrizioni',
  },
  {
    label: 'Squadre',
    path: '/squadre',
    icon: Groups2RoundedIcon,
    description: 'Roster e statistiche',
  },
  {
    label: 'Calendario',
    path: '/gare',
    icon: SportsScoreRoundedIcon,
    description: 'Tutte le gare in programma',
  },
  {
    label: 'Notifiche',
    path: '/notifiche',
    icon: NotificationsActiveRoundedIcon,
    description: 'Inviti e richieste',
  },
  {
    label: 'Profilo',
    path: '/account',
    icon: ManageAccountsRoundedIcon,
    description: 'I tuoi dati',
  },
]
