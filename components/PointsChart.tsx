import { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MonthlyPoints {
  month: number;
  year: number;
  monthName: string;
  totalPoints: number;
}

interface FilterOptions {
  segments: string[];
  groups: string[];
  positions: string[];
  routes: string[];
  kpis: string[];
}

const COLORS = ['#1976d2', '#2e7d32', '#757575', '#212121', '#42a5f5', '#4caf50'];

export default function PointsChart() {
  const [filters, setFilters] = useState({
    segment: '',
    group: '',
    position: '',
    route: '',
    kpi: '',
  });

  // Load filter options
  const { data: filterOptions } = useSWR<{ success: boolean; data?: FilterOptions }>(
    '/api/results-filter-options',
    fetcher
  );

  // Set default position to "Vendedor" when positions load
  useEffect(() => {
    if (filterOptions?.data?.positions && filterOptions.data.positions.length > 0 && !filters.position) {
      const vendedor = filterOptions.data.positions.find(p => p.toLowerCase().includes('vendedor'));
      setFilters(prev => ({
        ...prev,
        position: vendedor || filterOptions.data!.positions[0]
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterOptions]);

  // Build query string with filters using useMemo to prevent infinite re-renders
  const queryString = useMemo(() => {
    const queryParams = new URLSearchParams();
    if (filters.segment) queryParams.append('segment', filters.segment);
    if (filters.group) queryParams.append('group', filters.group);
    if (filters.position) queryParams.append('position', filters.position);
    if (filters.route) queryParams.append('route', filters.route);
    if (filters.kpi) queryParams.append('kpi', filters.kpi);
    return queryParams.toString();
  }, [filters.segment, filters.group, filters.position, filters.route, filters.kpi]);

  // Load points data with filters
  const { data, error, isLoading } = useSWR<{ success: boolean; data?: MonthlyPoints[] }>(
    `/api/points-monthly${queryString ? `?${queryString}` : ''}`,
    fetcher
  );

  const handleFilterChange = (field: keyof typeof filters) => (event: SelectChangeEvent) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      segment: '',
      group: '',
      position: '',
      route: '',
      kpi: '',
    });
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error || !data?.success) {
    return (
      <Paper sx={{ p: 4 }}>
        <Typography color="error">Error cargando datos</Typography>
      </Paper>
    );
  }

  const chartData = data.data || [];
  const totalPoints = chartData.reduce((sum, item) => sum + item.totalPoints, 0);
  const hasFilters = Object.values(filters).some((v) => v !== '');

  return (
    <Box>
      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 2 }}>
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
          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth size="small">
              <InputLabel>Segmento</InputLabel>
              <Select
                value={filters.segment}
                label="Segmento"
                onChange={handleFilterChange('segment')}
              >
                <MenuItem value="">Todos</MenuItem>
                {filterOptions?.data?.segments.map((segment) => (
                  <MenuItem key={segment} value={segment}>
                    {segment}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth size="small">
              <InputLabel>Distribuidor</InputLabel>
              <Select
                value={filters.group}
                label="Distribuidor"
                onChange={handleFilterChange('group')}
              >
                <MenuItem value="">Todos</MenuItem>
                {filterOptions?.data?.groups.map((group) => (
                  <MenuItem key={group} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth size="small">
              <InputLabel>Cargo</InputLabel>
              <Select
                value={filters.position}
                label="Cargo"
                onChange={handleFilterChange('position')}
              >
                {filterOptions?.data?.positions.map((position) => (
                  <MenuItem key={position} value={position}>
                    {position}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth size="small">
              <InputLabel>Ruta</InputLabel>
              <Select
                value={filters.route}
                label="Ruta"
                onChange={handleFilterChange('route')}
              >
                <MenuItem value="">Todas</MenuItem>
                {filterOptions?.data?.routes.map((route) => (
                  <MenuItem key={route} value={route}>
                    {route}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth size="small">
              <InputLabel>KPI</InputLabel>
              <Select value={filters.kpi} label="KPI" onChange={handleFilterChange('kpi')}>
                <MenuItem value="">Todos</MenuItem>
                {filterOptions?.data?.kpis.map((kpi) => (
                  <MenuItem key={kpi} value={kpi}>
                    {kpi}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Gráfico */}
      <Paper sx={{ p: 3, height: '100%', mb: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#212121' }}>
            Puntos Entregados por Mes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total: {totalPoints.toLocaleString()} puntos
          </Typography>
        </Box>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="monthName"
              tick={{ fontSize: 11, fill: '#757575' }}
              tickLine={false}
              stroke="#e0e0e0"
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#757575' }}
              tickLine={false}
              stroke="#e0e0e0"
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              formatter={(value: number) => [value.toLocaleString(), 'Puntos']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: 8,
              }}
            />
            <Bar dataKey="totalPoints" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Tabla */}
      <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Mes</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>
                Puntos
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {chartData.map((row) => (
              <TableRow key={`${row.year}-${row.month}`} hover>
                <TableCell>{row.monthName}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 500 }}>
                  {row.totalPoints.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
