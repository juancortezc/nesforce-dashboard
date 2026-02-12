import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import StorageIcon from '@mui/icons-material/Storage';
import CalculateIcon from '@mui/icons-material/Calculate';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';

export interface DataSourceInfo {
  dataset: string;
  table: string;
  description: string;
}

export interface CalculationInfo {
  name: string;
  description: string;
  formula?: string;
}

export interface FilterInfo {
  name: string;
  description: string;
  isExclusion?: boolean;
}

export interface PageInfoConfig {
  title: string;
  dataSources: DataSourceInfo[];
  calculations: CalculationInfo[];
  filters: FilterInfo[];
  notes?: string[];
}

interface PageInfoDialogProps {
  config: PageInfoConfig;
}

export default function PageInfoDialog({ config }: PageInfoDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        size="small"
        sx={{
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
        title="Información de la página"
      >
        <SettingsIcon fontSize="small" />
      </IconButton>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              {config.title} - Información Técnica
            </Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {/* Fuentes de Datos */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StorageIcon color="primary" fontSize="small" />
                <Typography fontWeight={600}>Fuentes de Datos</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {config.dataSources.map((source, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Chip label={source.dataset} size="small" color="primary" variant="outlined" />
                    <Chip label={source.table} size="small" color="secondary" variant="outlined" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {source.description}
                  </Typography>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>

          {/* Cálculos */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalculateIcon color="primary" fontSize="small" />
                <Typography fontWeight={600}>Cálculos y Métricas</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense disablePadding>
                {config.calculations.map((calc, index) => (
                  <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={600} color="primary.main">
                      {calc.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {calc.description}
                    </Typography>
                    {calc.formula && (
                      <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {calc.formula}
                      </Box>
                    )}
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Filtros y Exclusiones */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterAltIcon color="primary" fontSize="small" />
                <Typography fontWeight={600}>Filtros y Reglas</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense disablePadding>
                {config.filters.map((filter, index) => (
                  <ListItem key={index} sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {filter.isExclusion ? (
                        <WarningAmberIcon color="warning" fontSize="small" />
                      ) : (
                        <FilterAltIcon color="action" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" fontWeight={500}>
                            {filter.name}
                          </Typography>
                          {filter.isExclusion && (
                            <Chip label="Exclusión" size="small" color="warning" sx={{ height: 20, fontSize: '0.7rem' }} />
                          )}
                        </Box>
                      }
                      secondary={filter.description}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Notas Adicionales */}
          {config.notes && config.notes.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1, opacity: 0.9 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: 'info.dark' }}>
                Notas Importantes
              </Typography>
              {config.notes.map((note, index) => (
                <Typography key={index} variant="body2" sx={{ color: 'info.dark', mb: 0.5 }}>
                  • {note}
                </Typography>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
