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
    <Card sx={{ height: '100%', ...sx }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
        <Stack
          alignItems="flex-start"
          direction="row"
          justifyContent="space-between"
          spacing={1.5}
        >
          <Stack alignItems="center" direction="row" spacing={1.25}>
            {icon ? (
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
          {action}
        </Stack>
        {children}
      </CardContent>
    </Card>
  )
}
