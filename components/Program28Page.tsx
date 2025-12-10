import { useState } from 'react';
import { Box, Container, FormControl, Select, MenuItem, Typography, Paper, Grid, InputLabel, Button, SelectChangeEvent } from '@mui/material';
import useSWR from 'swr';
import Program28SummaryCard from './Program28SummaryCard';
import TopAwardsCard from './TopAwardsCard';
import TopParticipantsRedemptionCard from './TopParticipantsRedemptionCard';
import CategoryAnalysisCard from './CategoryAnalysisCard';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const MONTHS = ['Todos', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const YEARS = ['Todos', '2024', '2025'];

export default function Program28Page() {
  const [filters, setFilters] = useState({
    region: '',
    month: 'all',
    year: 'all',
    category: 'all',
    segment: 'all',
  });

  const { data: filterOptions } = useSWR<{ success: boolean; data?: { regions: string[]; categories: string[]; segments: string[] } }>(
    '/api/program28-filter-options',
    fetcher
  );

  const regions = filterOptions?.data?.regions || [];
  const categories = filterOptions?.data?.categories || [];
  const segments = filterOptions?.data?.segments || [];

  const handleFilterChange = (field: keyof typeof filters) => (event: SelectChangeEvent) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      region: '',
      month: 'all',
      year: 'all',
      category: 'all',
      segment: 'all',
    });
  };

  const hasFilters = filters.region !== '' || filters.month !== 'all' || filters.year !== 'all' || filters.category !== 'all' || filters.segment !== 'all';

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ position: 'sticky', top: 64, zIndex: 100, backgroundColor: '#fafafa', pb: 3, mb: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#212121' }}>
              Filtros
            </Typography>
            {hasFilters && (
              <Button size="small" onClick={handleClearFilters} sx={{ textTransform: 'none' }}>
                Limpiar filtros
              </Button>
            )}
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Mes</InputLabel>
                <Select value={filters.month} label="Mes" onChange={handleFilterChange('month')}>
                  {MONTHS.map((m, i) => (
                    <MenuItem key={i} value={i === 0 ? 'all' : i.toString()}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Año</InputLabel>
                <Select value={filters.year} label="Año" onChange={handleFilterChange('year')}>
                  {YEARS.map((y) => (
                    <MenuItem key={y} value={y === 'Todos' ? 'all' : y}>
                      {y}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Categoría</InputLabel>
                <Select value={filters.category} label="Categoría" onChange={handleFilterChange('category')}>
                  <MenuItem value="all">Todas</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Región</InputLabel>
              <Select
                value={filters.region}
                label="Región"
                onChange={handleFilterChange('region')}
              >
                <MenuItem value="">Todas</MenuItem>
                {regions.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Segmento</InputLabel>
                <Select value={filters.segment} label="Segmento" onChange={handleFilterChange('segment')}>
                  <MenuItem value="all">Todos</MenuItem>
                  {segments.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Program28SummaryCard month={filters.month} year={filters.year} region={filters.region} category={filters.category} segment={filters.segment} />
      <TopAwardsCard month={filters.month} year={filters.year} region={filters.region} category={filters.category} segment={filters.segment} />
      <TopParticipantsRedemptionCard month={filters.month} year={filters.year} region={filters.region} category={filters.category} segment={filters.segment} />
      <CategoryAnalysisCard month={filters.month} year={filters.year} region={filters.region} category={filters.category} segment={filters.segment} />
    </Container>
  );
}
