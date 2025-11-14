import { useState, useEffect } from 'react';
import { Box, Container, FormControl, Select, MenuItem, Typography, Paper, Grid, InputLabel, Button } from '@mui/material';
import useSWR from 'swr';
import TopParticipantsCard from './TopParticipantsCard';
import KPIPerformanceCard from './KPIPerformanceCard';
import SegmentComparisonCard from './SegmentComparisonCard';
import GroupPerformanceCard from './GroupPerformanceCard';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const MONTHS = ['Todos', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const YEARS = ['Todos', '2024', '2025'];

export default function ResultsAnalysisPage() {
  const [month, setMonth] = useState('all');
  const [year, setYear] = useState('all');
  const [segment, setSegment] = useState('all');
  const [group, setGroup] = useState('all');
  const [position, setPosition] = useState(''); // Iniciar vacío, se setea después
  const [route, setRoute] = useState('all');
  const [kpi, setKpi] = useState('all');

  // Load filter options - pasar segment para filtrar distribuidores
  const filterOptionsUrl = segment && segment !== 'all'
    ? `/api/results-filter-options?segment=${encodeURIComponent(segment)}`
    : '/api/results-filter-options';

  const { data: filterOptions } = useSWR<{ success: boolean; data?: { segments: string[]; groups: string[]; positions: string[]; routes: string[]; kpis: string[] } }>(
    filterOptionsUrl,
    fetcher
  );

  const segments = filterOptions?.data?.segments || [];
  const groups = filterOptions?.data?.groups || [];
  const positions = filterOptions?.data?.positions || [];
  const routes = filterOptions?.data?.routes || [];
  const kpis = filterOptions?.data?.kpis || [];

  // Setear "Vendedor" por defecto cuando carguen las posiciones
  useEffect(() => {
    if (positions.length > 0 && !position) {
      const vendedor = positions.find(p => p.toLowerCase().includes('vendedor'));
      setPosition(vendedor || positions[0]);
    }
  }, [positions, position]);

  const handleClearFilters = () => {
    const vendedor = positions.find(p => p.toLowerCase().includes('vendedor'));
    setMonth('all');
    setYear('all');
    setSegment('all');
    setGroup('all');
    setPosition(vendedor || positions[0] || '');
    setRoute('all');
    setKpi('all');
  };

  const hasFilters = month !== 'all' || year !== 'all' || segment !== 'all' || group !== 'all' || route !== 'all' || kpi !== 'all';

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Barra de filtros sticky */}
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
          <Grid item xs={12} sm={6} md={1.7}>
            <FormControl fullWidth size="small">
              <InputLabel>Mes</InputLabel>
              <Select
                value={month}
                label="Mes"
                onChange={(e) => setMonth(e.target.value)}
                displayEmpty
              >
                {MONTHS.map((m, i) => (
                  <MenuItem key={i} value={i === 0 ? 'all' : i.toString()}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={1.7}>
            <FormControl fullWidth size="small">
              <InputLabel>Año</InputLabel>
              <Select
                value={year}
                label="Año"
                onChange={(e) => setYear(e.target.value)}
                displayEmpty
              >
                {YEARS.map((y) => (
                  <MenuItem key={y} value={y === 'Todos' ? 'all' : y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={1.7}>
            <FormControl fullWidth size="small">
              <InputLabel>Segmento</InputLabel>
              <Select
                value={segment}
                label="Segmento"
                onChange={(e) => {
                  setSegment(e.target.value);
                  setGroup('all'); // Resetear distribuidor cuando cambia segmento
                }}
                displayEmpty
              >
                <MenuItem value="all">Todos</MenuItem>
                {segments.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={1.7}>
            <FormControl fullWidth size="small">
              <InputLabel>Distribuidor</InputLabel>
              <Select
                value={group}
                label="Distribuidor"
                onChange={(e) => setGroup(e.target.value)}
                displayEmpty
              >
                <MenuItem value="all">Todos</MenuItem>
                {groups.map((g) => (
                  <MenuItem key={g} value={g}>{g}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={1.7}>
            <FormControl fullWidth size="small" required>
              <InputLabel>Cargo *</InputLabel>
              <Select
                value={position}
                label="Cargo *"
                onChange={(e) => setPosition(e.target.value)}
                displayEmpty
              >
                {positions.map((p) => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={1.7}>
            <FormControl fullWidth size="small">
              <InputLabel>Ruta</InputLabel>
              <Select
                value={route}
                label="Ruta"
                onChange={(e) => setRoute(e.target.value)}
                displayEmpty
              >
                <MenuItem value="all">Todas</MenuItem>
                {routes.map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={1.7}>
            <FormControl fullWidth size="small">
              <InputLabel>KPI</InputLabel>
              <Select
                value={kpi}
                label="KPI"
                onChange={(e) => setKpi(e.target.value)}
                displayEmpty
              >
                <MenuItem value="all">Todos</MenuItem>
                {kpis.map((k) => (
                  <MenuItem key={k} value={k}>{k}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

          <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#757575', fontStyle: 'italic' }}>
            * El filtro de Cargo es obligatorio. Los supervisores suman los resultados de sus vendedores.
          </Typography>
        </Paper>
      </Box>

      {/* Cards con datos - todas reciben los filtros */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TopParticipantsCard
            month={month}
            year={year}
            segment={segment}
            group={group}
            position={position}
            route={route}
            kpi={kpi}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <KPIPerformanceCard
            month={month}
            year={year}
            segment={segment}
            group={group}
            position={position}
            route={route}
            kpi={kpi}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <SegmentComparisonCard
            month={month}
            year={year}
            group={group}
            position={position}
            route={route}
            kpi={kpi}
          />
        </Grid>

        <Grid item xs={12}>
          <GroupPerformanceCard
            month={month}
            year={year}
            segment={segment}
            position={position}
            route={route}
            kpi={kpi}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
