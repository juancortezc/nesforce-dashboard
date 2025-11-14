import { useState, useEffect } from 'react';
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
  Container,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from 'recharts';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MonthlyPoints {
  month: number;
  year: number;
  monthName: string;
  totalPoints: number;
}

interface KPIPoints {
  kpiId: string;
  kpiName: string;
  month: number;
  year: number;
  monthName: string;
  totalPoints: number;
  participantCount: number;
  avgPointsPerParticipant: number;
}

interface MonthlyAchievement {
  month: number;
  year: number;
  monthName: string;
  avgAchievementRate: number;
  totalParticipants: number;
}

interface FilterOptions {
  segments: string[];
  groups: string[];
  positions: string[];
  routes: string[];
  kpis: string[];
}

const COLORS = ['#1976d2', '#2e7d32', '#757575', '#212121', '#42a5f5', '#4caf50'];

export default function PointsPage() {
  const [filters, setFilters] = useState({
    segment: '',
    group: '',
    position: '',
    route: '',
    kpi: '',
  });

  // Load filter options - pasar segment para filtrar distribuidores
  const filterOptionsUrl = filters.segment
    ? `/api/results-filter-options?segment=${encodeURIComponent(filters.segment)}`
    : '/api/results-filter-options';

  const { data: filterOptions } = useSWR<{ success: boolean; data?: FilterOptions }>(
    filterOptionsUrl,
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
  }, [filterOptions, filters.position]);

  // Build query string with filters
  const queryParams = new URLSearchParams();
  if (filters.segment) queryParams.append('segment', filters.segment);
  if (filters.group) queryParams.append('group', filters.group);
  if (filters.position) queryParams.append('position', filters.position);
  if (filters.route) queryParams.append('route', filters.route);
  if (filters.kpi) queryParams.append('kpi', filters.kpi);
  const queryString = queryParams.toString();

  // Load points data with filters
  const { data, error, isLoading } = useSWR<{ success: boolean; data?: MonthlyPoints[] }>(
    `/api/points-monthly${queryString ? `?${queryString}` : ''}`,
    fetcher
  );

  // Load KPI points data
  const { data: kpiData, isLoading: isLoadingKpi } = useSWR<{ success: boolean; data?: KPIPoints[] }>(
    `/api/points-by-kpi${queryString ? `?${queryString}` : ''}`,
    fetcher
  );

  // Load achievement data
  const { data: achievementData, isLoading: isLoadingAchievement } = useSWR<{ success: boolean; data?: MonthlyAchievement[] }>(
    `/api/achievement-by-month${queryString ? `?${queryString}` : ''}`,
    fetcher
  );

  const handleFilterChange = (field: keyof typeof filters) => (event: SelectChangeEvent) => {
    const newValue = event.target.value;

    // Si cambia el segmento, resetear el distribuidor
    if (field === 'segment') {
      setFilters((prev) => ({
        ...prev,
        segment: newValue,
        group: '', // Resetear distribuidor
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [field]: newValue,
      }));
    }
  };

  const handleClearFilters = () => {
    const vendedor = filterOptions?.data?.positions.find(p => p.toLowerCase().includes('vendedor'));
    setFilters({
      segment: '',
      group: '',
      position: vendedor || filterOptions?.data?.positions[0] || '',
      route: '',
      kpi: '',
    });
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Paper>
      </Container>
    );
  }

  if (error || !data?.success) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper sx={{ p: 4 }}>
          <Typography color="error">Error cargando datos</Typography>
        </Paper>
      </Container>
    );
  }

  const chartData = data.data || [];
  const totalPoints = chartData.reduce((sum, item) => sum + item.totalPoints, 0);
  const hasFilters = Object.values(filters).some((v, i) => {
    if (i === 2) return false; // position is required
    return v !== '';
  });

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Filtros sticky */}
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
      </Box>

      {/* Fila 1: Gráfico y Tabla */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
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
        </Grid>

        <Grid item xs={12} md={6}>
          <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
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
        </Grid>
      </Grid>

      {/* Fila 2: Tabla de KPI y Gráfico de Achievement */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 500 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#212121' }}>
              Detalle por KPI
            </Typography>
            {isLoadingKpi ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: 420 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Mes</TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>KPI</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>
                        Puntos
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>
                        Participantes
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>
                        Pts Prom/Participante
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {kpiData?.data?.map((row, idx) => (
                      <TableRow key={`${row.kpiId}-${row.month}-${row.year}-${idx}`} hover>
                        <TableCell sx={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{row.monthName}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>{row.kpiName}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500 }}>
                          {row.totalPoints.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">{row.participantCount}</TableCell>
                        <TableCell align="right" sx={{ color: '#6750A4', fontWeight: 500 }}>
                          {row.avgPointsPerParticipant.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 500 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#212121' }}>
              % Logro Promedio por Mes
            </Typography>
            {isLoadingAchievement ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={420}>
                <LineChart data={achievementData?.data || []} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
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
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)}%`, '% Logro']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgAchievementRate"
                    stroke="#6750A4"
                    strokeWidth={3}
                    name="% Logro Promedio"
                    dot={{ r: 5, fill: '#6750A4' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
