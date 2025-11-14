import { AppBar, Toolbar, Container, Box, Chip, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';

interface HeaderProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
  lastChange?: string;
  pages?: string[];
}

export default function Header({ activeTab, onTabChange, lastChange, pages = ['Results', 'Transactions'] }: HeaderProps) {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #6750A4 0%, #7E6DB3 50%, #9A8FC8 100%)',
        boxShadow: '0px 4px 12px rgba(103, 80, 164, 0.20)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 }, gap: 3 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              color: '#FFFFFF',
              display: { xs: 'none', md: 'block' },
              textShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
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
                gap: 1,
                '& .MuiToggleButton-root': {
                  px: 3,
                  py: 1,
                  border: 'none',
                  borderRadius: '24px',
                  textTransform: 'none',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.8)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                  },
                  '&.Mui-selected': {
                    bgcolor: '#FFFFFF',
                    color: '#6750A4',
                    boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.16)',
                    '&:hover': {
                      bgcolor: '#FFFFFF',
                      transform: 'translateY(-2px)',
                      boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.20)',
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
                background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                color: 'white',
                fontWeight: 500,
                display: { xs: 'none', sm: 'flex' },
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            />
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
