"use client";

import { Box, Card, CardContent, Typography, Grid, Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

interface KPIItem {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: string;
  format?: 'number' | 'currency' | 'percent';
}

interface KPICardsProps {
  items: KPIItem[];
  loading?: boolean;
}

export function KPICards({ items, loading = false }: KPICardsProps) {
  const formatValue = (value: string | number, format?: string) => {
    if (typeof value === 'string') return value;
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString('es-ES')}`;
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString('es-ES');
    }
  };

  const renderTrendIcon = (change?: number) => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUpIcon sx={{ color: '#4CAF50', fontSize: 16 }} />;
    if (change < 0) return <TrendingDownIcon sx={{ color: '#F44336', fontSize: 16 }} />;
    return <TrendingFlatIcon sx={{ color: '#757575', fontSize: 16 }} />;
  };

  const getChangeColor = (change?: number) => {
    if (change === undefined) return 'text.secondary';
    if (change > 0) return '#4CAF50';
    if (change < 0) return '#F44336';
    return 'text.secondary';
  };

  if (loading) {
    return (
      <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={6} sm={6} md={3} key={i}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="80%" height={36} />
                <Skeleton variant="text" width="40%" height={16} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }} sx={{ mb: { xs: 2, sm: 3 } }}>
      {items.map((kpi, index) => (
        <Grid item xs={6} sm={6} md={3} key={index}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                {kpi.icon && (
                  <Box sx={{ color: kpi.color || 'primary.main', display: 'flex', alignItems: 'center' }}>
                    {kpi.icon}
                  </Box>
                )}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {kpi.title}
                </Typography>
              </Box>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                  color: kpi.color || 'text.primary',
                  lineHeight: 1.2,
                  mb: 0.5,
                }}
              >
                {formatValue(kpi.value, kpi.format)}
              </Typography>

              {(kpi.change !== undefined || kpi.changeLabel) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {renderTrendIcon(kpi.change)}
                  <Typography
                    variant="caption"
                    sx={{
                      color: getChangeColor(kpi.change),
                      fontWeight: 500,
                      fontSize: { xs: '0.6rem', sm: '0.7rem' },
                    }}
                  >
                    {kpi.change !== undefined && `${kpi.change > 0 ? '+' : ''}${kpi.change.toFixed(1)}%`}
                    {kpi.changeLabel && ` ${kpi.changeLabel}`}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
