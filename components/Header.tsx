import { AppBar, Toolbar, Container, Box, Chip, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';

interface HeaderProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
  lastChange?: string;
  pages?: string[];
}

export default function Header({ activeTab, onTabChange, lastChange, pages = ['Results', 'Transactions'] }: HeaderProps) {
  return (
    <AppBar position="static" color="default" elevation={0}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 }, gap: 3 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              display: { xs: 'none', md: 'block' },
            }}
          >
            DASHBOARD NESFORCE
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <ToggleButtonGroup
              value={activeTab}
              exclusive
              onChange={(_, newValue) => newValue !== null && onTabChange(newValue)}
              sx={{
                '& .MuiToggleButton-root': {
                  px: 3,
                  py: 1,
                  border: 'none',
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                },
              }}
            >
              {pages.map((page, index) => (
                <ToggleButton key={page} value={index}>
                  {page}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {lastChange && (
            <Chip
              label={lastChange}
              size="small"
              sx={{
                bgcolor: 'success.light',
                color: 'white',
                fontWeight: 500,
                display: { xs: 'none', sm: 'flex' },
              }}
            />
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
