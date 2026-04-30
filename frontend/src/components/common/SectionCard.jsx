// =============================================================================
// SectionCard.jsx - una "card" riutilizzabile con titolo, sottotitolo, icona.
//
// Quando vogliamo mostrare una sezione con intestazione standard (icona +
// titolo + eventuale azione a destra) usiamo questo componente per evitare
// di scrivere lo stesso codice in più pagine.
//
// Props (parametri):
//   - title:    titolo principale (testo)
//   - subtitle: sottotitolo opzionale (testo grigio sotto al titolo)
//   - icon:     icona opzionale a sinistra
//   - action:   bottone/elemento opzionale mostrato a destra dell'intestazione
//   - children: il contenuto vero e proprio della card
//   - sx:       stili extra per personalizzazioni puntuali
// =============================================================================

import { Avatar, Box, Card, CardContent, Stack, Typography } from '@mui/material'

export default function SectionCard({
  action,
  children,
  icon,
  subtitle,
  title,
  sx,
}) {
  return (
    // Card che si stira in altezza per riempire il suo contenitore.
    <Card sx={{ height: '100%', ...sx }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
        {/* Riga di intestazione: a sinistra icona+titolo, a destra l'azione. */}
        <Stack
          alignItems="flex-start"
          direction="row"
          justifyContent="space-between"
          spacing={1.5}
        >
          <Stack alignItems="center" direction="row" spacing={1.25}>
            {icon ? (
              // Icona dentro un avatar quadrato colorato col primary del tema.
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  height: 34,
                  width: 34,
                }}
                variant="rounded"
              >
                {icon}
              </Avatar>
            ) : null}
            <Box>
              <Typography variant="subtitle1">
                {title}
              </Typography>
              {subtitle ? (
                <Typography color="text.secondary" variant="body2">
                  {subtitle}
                </Typography>
              ) : null}
            </Box>
          </Stack>
          {/* Eventuale bottone/azione mostrato a destra dell'intestazione. */}
          {action}
        </Stack>
        {/* Tutto il contenuto vero e proprio della card. */}
        {children}
      </CardContent>
    </Card>
  )
}
