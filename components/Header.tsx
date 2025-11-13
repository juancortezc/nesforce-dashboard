import { AppBar, Toolbar, Tabs, Tab, Container, Box, Chip } from '@mui/material';

interface HeaderProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
  lastChange?: string;
}

export default function Header({ activeTab, onTabChange, lastChange }: HeaderProps) {
  return (
    <AppBar position="static" color="default" elevation={0}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => onTabChange(newValue)}
              sx={{ height: { xs: 56, sm: 64 } }}
            >
              <Tab label="Results" />
              <Tab label="Transactions" />
            </Tabs>
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
