// =============================================================================
// AppLayout.jsx - struttura di base di tutte le pagine "interne".
//
// Questo componente disegna:
//   - la SIDEBAR a sinistra con le voci del menu (Home, Tornei, Squadre, ecc.)
//   - l'HEADER in alto con il nome utente e il pulsante per il menu utente
//   - lo SPAZIO CENTRALE dove viene mostrata la pagina corrente
//
// La sidebar è permanente sui monitor grandi (lg = 1200+ pixel) e diventa
// "a comparsa" sui dispositivi piccoli (smartphone).
//
// <Outlet /> è il "buco" dove React Router inserisce la pagina corrente
// (es. HomePage, TournamentsPage, ecc.).
// =============================================================================

import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import PoolRoundedIcon from '@mui/icons-material/PoolRounded'
import {
  alpha,
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { navigationItems } from '../config/navigation'
import { useAuth } from '../context/useAuth'

// Larghezza fissa della sidebar (in pixel).
const drawerWidth = 260

/** Calcola le iniziali da mostrare nell'avatar (es. "MR" per Mario Rossi). */
function getInitials(account) {
  if (!account?.nome) return '?'
  return `${account.nome.charAt(0)}${(account.cognome ?? '').charAt(0)}`.toUpperCase()
}

export default function AppLayout() {
  const location = useLocation()              // ci dice in che pagina siamo (es. "/tornei")
  const navigate = useNavigate()              // ci permette di "andare" a un'altra pagina
  const { currentAccount, isAuthenticated, logout } = useAuth()
  // Stato per la sidebar mobile (aperta/chiusa).
  const [mobileOpen, setMobileOpen] = useState(false)
  // Stato per il menu utente in alto a destra (apre il menu vicino all'avatar).
  const [userMenuAnchor, setUserMenuAnchor] = useState(null)

  // Funzione comoda per chiudere il menu utente.
  const closeMenu = () => setUserMenuAnchor(null)

  // Esce dall'account e torna alla pagina di login.
  function handleLogout() {
    closeMenu()
    logout()
    navigate('/auth')
  }

  // Va alla pagina del proprio profilo.
  function goToProfile() {
    closeMenu()
    navigate('/account')
  }

  // ---- CONTENUTO DELLA SIDEBAR ----
  // È lo stesso sia per la sidebar permanente (desktop) sia per quella mobile.
  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo e titolo dell'app. */}
      <Box sx={{ p: 2.5 }}>
        <Stack alignItems="center" direction="row" spacing={1.5}>
          <Avatar sx={{ bgcolor: 'primary.main' }} variant="rounded">
            <PoolRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
              Pallanuoto Manager
            </Typography>
            <Typography color="text.secondary" variant="caption">
              Tornei, squadre, risultati
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Divider />

      {/* Voci di menu, generate dalla lista in config/navigation.js. */}
      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {navigationItems.map(({ icon: Icon, label, path, description }) => {
          // Decidiamo se la voce è "selezionata" confrontandola con l'URL corrente.
          const selected =
            path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
          return (
            <ListItemButton
              key={path}
              component={Link}                                 // si comporta come un link
              onClick={() => setMobileOpen(false)}             // su mobile chiude la sidebar dopo il click
              selected={selected}
              sx={{
                borderRadius: 2,
                mb: 0.75,
                // Sfondo colorato quando la voce è quella attiva.
                '&.Mui-selected': { backgroundColor: alpha('#1976d2', 0.12) },
                '&.Mui-selected:hover': { backgroundColor: alpha('#1976d2', 0.18) },
              }}
              to={path}
            >
              <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                <Icon />
              </ListItemIcon>
              <ListItemText
                primary={label}
                secondary={description}
                secondaryTypographyProps={{ color: 'text.secondary', fontSize: 12 }}
              />
            </ListItemButton>
          )
        })}
      </List>
      <Divider />

      {/* Piè di pagina della sidebar. */}
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary" variant="caption">
          v1.0 • presentazione 2026
        </Typography>
      </Box>
    </Box>
  )

  // Stile condiviso per le due Drawer (mobile e desktop).
  const drawerSx = {
    boxSizing: 'border-box',
    width: drawerWidth,
  }

  return (
    // Contenitore principale: sidebar + colonna di contenuto. Riempie tutta la finestra.
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Sidebar (occupa solo la sua larghezza sui monitor grandi). */}
      <Box component="nav" sx={{ flexShrink: { lg: 0 }, width: { lg: drawerWidth } }}>
        {/* Versione "mobile": appare solo su schermi piccoli, scompare su grandi. */}
        <Drawer
          ModalProps={{ keepMounted: true }}                  // tieni il DOM in memoria per essere più veloce
          onClose={() => setMobileOpen((o) => !o)}
          open={mobileOpen}
          sx={{ display: { lg: 'none' }, '& .MuiDrawer-paper': drawerSx }}
          variant="temporary"
        >
          {drawer}
        </Drawer>
        {/* Versione "desktop": sempre aperta, nascosta sotto i monitor lg. */}
        <Drawer
          open
          sx={{ display: { xs: 'none', lg: 'block' }, '& .MuiDrawer-paper': drawerSx }}
          variant="permanent"
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Colonna di destra: header + contenuto della pagina. */}
      <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', minWidth: 0 }}>
        {/* HEADER (AppBar). "sticky" = resta in alto anche scorrendo. */}
        <AppBar
          color="inherit"
          elevation={0}
          position="sticky"
          sx={{
            backdropFilter: 'blur(6px)',                       // sfondo leggermente sfumato
            backgroundColor: alpha('#ffffff', 0.85),
            borderBottom: `1px solid ${alpha('#000', 0.06)}`,
          }}
        >
          <Toolbar sx={{ gap: 1.5 }}>
            {/* Pulsante "hamburger" che apre la sidebar su mobile. */}
            <IconButton
              color="primary"
              onClick={() => setMobileOpen((o) => !o)}
              size="small"
              sx={{ display: { lg: 'none' } }}
            >
              <MenuRoundedIcon />
            </IconButton>

            {/* Saluto / titolo della pagina. */}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ lineHeight: 1.2 }}>
                {currentAccount ? `Ciao, ${currentAccount.nome}` : 'Benvenuto'}
              </Typography>
              <Typography color="text.secondary" variant="caption">
                {isAuthenticated ? 'Pannello di gestione' : 'Accedi o registrati per iniziare'}
              </Typography>
            </Box>

            {/* A destra: avatar+menu se loggato, oppure bottone "Accedi" se no. */}
            {isAuthenticated ? (
              <>
                <IconButton onClick={(event) => setUserMenuAnchor(event.currentTarget)}>
                  <Avatar sx={{ bgcolor: 'primary.main', height: 36, width: 36 }}>
                    {getInitials(currentAccount)}
                  </Avatar>
                </IconButton>
                {/* Menu a tendina che si apre vicino all'avatar. */}
                <Menu
                  anchorEl={userMenuAnchor}
                  onClose={closeMenu}
                  open={Boolean(userMenuAnchor)}
                >
                  <MenuItem onClick={goToProfile}>
                    <ListItemIcon>
                      <PersonRoundedIcon fontSize="small" />
                    </ListItemIcon>
                    Il mio profilo
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutRoundedIcon fontSize="small" />
                    </ListItemIcon>
                    Esci
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button color="primary" component={Link} to="/auth" variant="contained">
                Accedi
              </Button>
            )}
          </Toolbar>
        </AppBar>

        {/* CONTENUTO DELLA PAGINA. <Outlet /> = qui finisce la pagina selezionata. */}
        <Box component="main" sx={{ flex: 1, pb: 6 }}>
          <Container maxWidth="xl" sx={{ pt: 3 }}>
            <Outlet />
          </Container>
        </Box>
      </Box>
    </Box>
  )
}
