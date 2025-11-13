import { AppBar, Toolbar, Tabs, Tab, Container, Box } from '@mui/material';
import { useState } from 'react';

interface HeaderProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <AppBar position="static" color="default" elevation={0}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => onTabChange(newValue)}
              sx={{ height: { xs: 56, sm: 64 } }}
            >
              <Tab label="Results" />
              <Tab label="Transactions" />
            </Tabs>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
