// Layout principale dell'app: sidebar a sinistra, header in alto con
// avatar utente e menu Profilo/Logout, contenuto a destra.

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

const drawerWidth = 260

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentAccount, isAuthenticated, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuAnchor, setUserMenuAnchor] = useState(null)

  function handleDrawerToggle() {
    setMobileOpen((open) => !open)
  }

  function handleLogout() {
    setUserMenuAnchor(null)
    logout()
    navigate('/auth')
  }

  function goToProfile() {
    setUserMenuAnchor(null)
    navigate('/account')
  }

  // Iniziali da mostrare nell'avatar (es. "MR" per Mario Rossi).
  const initials =
    currentAccount && currentAccount.nome
      ? `${currentAccount.nome.charAt(0)}${(currentAccount.cognome ?? '').charAt(0)}`.toUpperCase()
      : '?'

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {navigationItems.map((item) => {
          const Icon = item.icon
          const selected =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path)
          return (
            <ListItemButton
              key={item.path}
              component={Link}
              onClick={() => setMobileOpen(false)}
              selected={selected}
              sx={{
                borderRadius: 2,
                mb: 0.75,
                '&.Mui-selected': { backgroundColor: alpha('#1976d2', 0.12) },
                '&.Mui-selected:hover': { backgroundColor: alpha('#1976d2', 0.18) },
              }}
              to={item.path}
            >
              <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                <Icon />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                secondary={item.description}
                secondaryTypographyProps={{ color: 'text.secondary', fontSize: 12 }}
              />
            </ListItemButton>
          )
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary" variant="caption">
          v1.0 • presentazione 2026
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Box component="nav" sx={{ flexShrink: { lg: 0 }, width: { lg: drawerWidth } }}>
        <Drawer
          ModalProps={{ keepMounted: true }}
          onClose={handleDrawerToggle}
          open={mobileOpen}
          sx={{
            display: { lg: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          variant="temporary"
        >
          {drawer}
        </Drawer>
        <Drawer
          open
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          variant="permanent"
        >
          {drawer}
        </Drawer>
      </Box>

      <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', minWidth: 0 }}>
        <AppBar
          color="inherit"
          elevation={0}
          position="sticky"
          sx={{
            backdropFilter: 'blur(6px)',
            backgroundColor: alpha('#ffffff', 0.85),
            borderBottom: `1px solid ${alpha('#000', 0.06)}`,
          }}
        >
          <Toolbar sx={{ gap: 1.5 }}>
            <IconButton
              color="primary"
              onClick={handleDrawerToggle}
              size="small"
              sx={{ display: { lg: 'none' } }}
            >
              <MenuRoundedIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ lineHeight: 1.2 }}>
                {currentAccount ? `Ciao, ${currentAccount.nome}` : 'Benvenuto'}
              </Typography>
              <Typography color="text.secondary" variant="caption">
                {isAuthenticated
                  ? 'Pannello di gestione'
                  : 'Accedi o registrati per iniziare'}
              </Typography>
            </Box>
            {isAuthenticated ? (
              <>
                <IconButton onClick={(event) => setUserMenuAnchor(event.currentTarget)}>
                  <Avatar sx={{ bgcolor: 'primary.main', height: 36, width: 36 }}>
                    {initials}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={userMenuAnchor}
                  onClose={() => setUserMenuAnchor(null)}
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

        <Box component="main" sx={{ flex: 1, pb: 6 }}>
          <Container maxWidth="xl" sx={{ pt: 3 }}>
            <Outlet />
          </Container>
        </Box>
      </Box>
    </Box>
  )
}
