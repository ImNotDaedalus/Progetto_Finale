// =============================================================================
// NotFoundPage.jsx - pagina mostrata quando l'utente va su un indirizzo
// che non esiste (vedi App.jsx, rotta "*" che reindirizza a /404).
// =============================================================================

import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import { Button, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import SectionCard from '../components/common/SectionCard'

export default function NotFoundPage() {
  return (
    // Riusiamo SectionCard per avere la solita intestazione "icona + titolo".
    <SectionCard
      icon={<ErrorOutlineRoundedIcon />}
      subtitle="La rotta richiesta non esiste nel frontend"
      title="Pagina non trovata"
    >
      <Stack spacing={2}>
        <Typography variant="body2">
          Usa il menu laterale per accedere alle sezioni disponibili.
        </Typography>
        {/* Link di "fallback" che porta a una pagina sicuramente esistente. */}
        <Button component={Link} to="/account" variant="contained">
          Vai agli account
        </Button>
      </Stack>
    </SectionCard>
  )
}
