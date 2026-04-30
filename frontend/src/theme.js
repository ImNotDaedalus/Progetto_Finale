// =============================================================================
// theme.js - "tema grafico" dell'intera applicazione.
//
// Material UI (MUI) è la libreria di componenti grafici che usiamo (bottoni,
// card, ecc.). Il tema definisce in un solo posto come devono essere fatti:
// quali colori, quale font, quali bordi, ecc. Tutti i componenti del sito
// poi pescano da qui i loro stili.
// =============================================================================

import { alpha, createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  // ---- PALETTE: i colori principali del sito. ----
  palette: {
    mode: 'light',                       // tema chiaro
    primary: {
      main: '#1976d2',                   // azzurro principale (sfondo header, bottoni primari)
      dark: '#115293',
      light: '#63a4ff',
      contrastText: '#ffffff',           // colore del testo sopra il primary (bianco)
    },
    secondary: {
      main: '#546e7a',                   // grigio bluastro per cose secondarie
      dark: '#29434e',
      light: '#819ca9',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',                // colore di sfondo generale
      paper: '#ffffff',                  // colore delle "schede" (Card, Paper...)
    },
    success: { main: '#2f7d5d' },        // verde per successi
    error:   { main: '#bc3f4e' },        // rosso per errori
    warning: { main: '#c58226' },        // arancione per avvisi
    info:    { main: '#2d79a7' },        // azzurro per info
  },

  // Angoli arrotondati di default per tutti i componenti (raggio 8 px).
  shape: {
    borderRadius: 8,
  },

  // ---- TIPOGRAFIA: font e dimensioni. ----
  typography: {
    fontFamily: '"Aptos", "Segoe UI", sans-serif',  // font principale
    h3: { fontWeight: 700 },             // titoli grandi in grassetto
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    button: {
      fontSize: '0.92rem',
      fontWeight: 700,
      textTransform: 'none',             // evitiamo il TUTTO MAIUSCOLO sui bottoni
    },
  },

  // ---- COMPONENTI: regole specifiche per alcuni componenti MUI. ----
  components: {
    // Barra superiore (AppBar): colore e nessuna ombra.
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1976d2',
          boxShadow: 'none',
        },
      },
    },
    // Le "card" hanno sfondo bianco, ombra leggera e bordo sottile.
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
          border: `1px solid ${alpha('#000000', 0.08)}`,
        },
      },
    },
    // Padding interno standard delle card.
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 20,
          '&:last-child': { paddingBottom: 20 },  // evita il padding doppio in fondo
        },
      },
    },
    // Tutti i Paper hanno angoli arrotondati di 8 px.
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 8 },
      },
    },
    // Bottoni: dimensione "small" come default, allineati a sinistra, padding contenuto.
    MuiButton: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          alignSelf: 'flex-start',
          borderRadius: 8,
          minWidth: 'auto',
          padding: '7px 14px',
        },
      },
    },
    // Campi di testo: dimensione "small" come default.
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    // Sfondo bianco per i campi con bordo (OutlinedInput).
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: '#ffffff' },
      },
    },
    // I "Chip" (etichette piccole) sono in grassetto, dimensione "small".
    MuiChip: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    // Pulsanti del menu laterale: altezza minima e padding verticale.
    MuiListItemButton: {
      styleOverrides: {
        root: { minHeight: 44, paddingBlock: 8 },
      },
    },
    // Drawer (cassetto laterale): sfondo bianco con bordo destro grigio.
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          color: '#1f1f1f',
          borderRight: `1px solid ${alpha('#000000', 0.08)}`,
        },
      },
    },
  },
})
