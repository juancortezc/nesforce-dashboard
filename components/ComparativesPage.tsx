import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputLabel,
  SelectChangeEvent,
  Button,
  CircularProgress,
  alpha,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  ComposedChart,
} from 'recharts';
import useSWR from 'swr';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import MD3Card from './MD3Card';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const MONTHS = ['Todos', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const YEARS = ['Todos', '2024', '2025'];

export default function ComparativesPage() {
  const [filters, setFilters] = useState({
    month: 'all',
    year: 'all',
    segment: 'all',
    group: 'all',
    position: '',
    route: 'all',
    kpi: 'all',
    mode: 'month-to-month',
  });

  // Load filter options - pasar segment para filtrar distribuidores
  const filterOptionsUrl = filters.segment && filters.segment !== 'all'
    ? `/api/results-filter-options?segment=${encodeURIComponent(filters.segment)}`
    : '/api/results-filter-options';

  const { data: filterOptions } = useSWR<{
    success: boolean;
    data?: { segments: string[]; groups: string[]; positions: string[]; routes: string[]; kpis: string[] };
  }>(filterOptionsUrl, fetcher);

  // Set default position to "Vendedor"
  useEffect(() => {
    if (filterOptions?.data?.positions && filterOptions.data.positions.length > 0 && !filters.position) {
      const vendedor = filterOptions.data.positions.find((p) => p.toLowerCase().includes('vendedor'));
      setFilters((prev) => ({
        ...prev,
        position: vendedor || filterOptions.data!.positions[0],
      }));
    }
  }, [filterOptions, filters.position]);

  // Build query string
  const buildQueryString = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') params.append(key, value);
    });
    return params.toString();
  };

  const queryString = buildQueryString();

  // Load data from APIs
  const { data: summaryData, isLoading: loadingSummary } = useSWR(
    `/api/comparatives-summary?${queryString}`,
    fetcher
  );
  const { data: trendData, isLoading: loadingTrend } = useSWR(
    `/api/comparatives-trend?${queryString}`,
    fetcher
  );
  const { data: kpiData, isLoading: loadingKpi } = useSWR(`/api/comparatives-by-kpi?${queryString}`, fetcher);
  const { data: distributorData, isLoading: loadingDistributor } = useSWR(
    `/api/comparatives-by-distributor?${queryString}`,
    fetcher
  );

  const handleFilterChange = (field: keyof typeof filters) => (event: SelectChangeEvent) => {
    const newValue = event.target.value;

    // Si cambia el segmento, resetear el distribuidor
    if (field === 'segment') {
      setFilters((prev) => ({
        ...prev,
        segment: newValue,
        group: 'all', // Resetear distribuidor
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [field]: newValue,
      }));
    }
  };

  const handleClearFilters = () => {
    const vendedor = filterOptions?.data?.positions.find((p) => p.toLowerCase().includes('vendedor'));
    setFilters({
      month: 'all',
      year: 'all',
      segment: 'all',
      group: 'all',
      position: vendedor || filterOptions?.data?.positions[0] || '',
      route: 'all',
      kpi: 'all',
      mode: 'month-to-month',
    });
  };

  const hasFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'position' || key === 'mode') return false;
    return value !== 'all' && value !== '';
  });

  const renderTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUpIcon sx={{ color: '#2e7d32', fontSize: 20 }} />;
    if (value < 0) return <TrendingDownIcon sx={{ color: '#d32f2f', fontSize: 20 }} />;
    return <TrendingFlatIcon sx={{ color: '#757575', fontSize: 20 }} />;
  };

  const formatNumber = (num: number) => num.toLocaleString('es-ES');
  const formatPercent = (num: number) => `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Filtros sticky */}
      <Box sx={{ position: 'sticky', top: 64, zIndex: 100, backgroundColor: '#fafafa', pb: 3, mb: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#212121' }}>
              Filtros Comparativos
            </Typography>
            {hasFilters && (
              <Button size="small" onClick={handleClearFilters} sx={{ textTransform: 'none' }}>
                Limpiar filtros
              </Button>
            )}
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={1.5}>
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

            <Grid item xs={12} sm={6} md={1.5}>
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

            <Grid item xs={12} sm={6} md={1.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Segmento</InputLabel>
                <Select value={filters.segment} label="Segmento" onChange={handleFilterChange('segment')}>
                  <MenuItem value="all">Todos</MenuItem>
                  {filterOptions?.data?.segments.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={1.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Distribuidor</InputLabel>
                <Select value={filters.group} label="Distribuidor" onChange={handleFilterChange('group')}>
                  <MenuItem value="all">Todos</MenuItem>
                  {filterOptions?.data?.groups.map((g) => (
                    <MenuItem key={g} value={g}>
                      {g}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={1.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Cargo *</InputLabel>
                <Select value={filters.position} label="Cargo *" onChange={handleFilterChange('position')}>
                  {filterOptions?.data?.positions.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={1.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Ruta</InputLabel>
                <Select value={filters.route} label="Ruta" onChange={handleFilterChange('route')}>
                  <MenuItem value="all">Todas</MenuItem>
                  {filterOptions?.data?.routes.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={1.5}>
              <FormControl fullWidth size="small">
                <InputLabel>KPI</InputLabel>
                <Select value={filters.kpi} label="KPI" onChange={handleFilterChange('kpi')}>
                  <MenuItem value="all">Todos</MenuItem>
                  {filterOptions?.data?.kpis.map((k) => (
                    <MenuItem key={k} value={k}>
                      {k}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={1.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Modo</InputLabel>
                <Select value={filters.mode} label="Modo" onChange={handleFilterChange('mode')}>
                  <MenuItem value="month-to-month">Mes a Mes</MenuItem>
                  <MenuItem value="quarter">Trimestre</MenuItem>
                  <MenuItem value="ytd">YTD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Cards de Resumen Comparativo */}
      {loadingSummary ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[
            {
              title: 'Total Achieved',
              current: summaryData?.data?.currentPeriod.achieved || 0,
              delta: summaryData?.data?.changes.achievedDelta || 0,
              deltaPct: summaryData?.data?.changes.achievedDeltaPct || 0,
            },
            {
              title: '% Cumplimiento',
              current: summaryData?.data?.currentPeriod.fulfillment || 0,
              delta: summaryData?.data?.changes.fulfillmentDelta || 0,
              deltaPct: 0,
              isPercent: true,
            },
            {
              title: 'Total Puntos',
              current: summaryData?.data?.currentPeriod.points || 0,
              delta: summaryData?.data?.changes.pointsDelta || 0,
              deltaPct: summaryData?.data?.changes.pointsDeltaPct || 0,
            },
            {
              title: 'Participantes',
              current: summaryData?.data?.currentPeriod.participants || 0,
              delta: summaryData?.data?.changes.participantsDelta || 0,
              deltaPct: summaryData?.data?.changes.participantsDeltaPct || 0,
            },
          ].map((metric, index) => {
            const gradients = ['gradient-primary', 'gradient-info', 'gradient-success', 'gradient-primary'];
            return (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <MD3Card variant={gradients[index] as any}>
                  <CardContent>
                    <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                      {metric.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                      {metric.isPercent ? `${metric.current.toFixed(1)}%` : formatNumber(metric.current)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        {renderTrendIcon(metric.delta)}
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {metric.isPercent ? `${metric.delta > 0 ? '+' : ''}${metric.delta.toFixed(1)}pp` : formatPercent(metric.deltaPct)}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        vs {summaryData?.data?.previousPeriod.label || 'anterior'}
                      </Typography>
                    </Box>
                  </CardContent>
                </MD3Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Gráfico de Tendencia Temporal */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0px 6px 12px rgba(103, 80, 164, 0.12)' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#6750A4' }}>
          Tendencia Temporal
        </Typography>
        {loadingTrend ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={trendData?.data?.periods || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="monthName" tick={{ fontSize: 11, fill: '#757575' }} tickLine={false} stroke="#e0e0e0" />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#757575' }}
                tickLine={false}
                stroke="#e0e0e0"
                tickFormatter={(value) => value.toLocaleString()}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: '#757575' }}
                tickLine={false}
                stroke="#e0e0e0"
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="achieved" fill="#1976d2" name="Achieved" radius={[8, 8, 0, 0]} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="fulfillment"
                stroke="#2e7d32"
                strokeWidth={2}
                name="% Cumplimiento"
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* Tabla Comparativa Detallada */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0px 6px 12px rgba(103, 80, 164, 0.12)' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#6750A4' }}>
          Detalle por Período
        </Typography>
        {loadingTrend ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Período</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>
                    Target
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>
                    Achieved
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>
                    % Cumplimiento
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>
                    Puntos
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>
                    Δ Achieved
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>
                    Δ %
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>
                    Tendencia
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trendData?.data?.periods.map((period: any, index: number) => {
                  const comparison = trendData?.data?.comparisons[index];
                  return (
                    <TableRow key={`${period.year}-${period.month}`} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{period.monthName}</TableCell>
                      <TableCell align="right">{formatNumber(period.target)}</TableCell>
                      <TableCell align="right">{formatNumber(period.achieved)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500 }}>
                        {period.fulfillment.toFixed(1)}%
                      </TableCell>
                      <TableCell align="right">{formatNumber(period.points)}</TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: comparison?.achievedDelta > 0 ? '#2e7d32' : comparison?.achievedDelta < 0 ? '#d32f2f' : '#757575',
                        }}
                      >
                        {comparison?.achievedDelta ? formatNumber(comparison.achievedDelta) : '-'}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: comparison?.achievedDeltaPct > 0 ? '#2e7d32' : comparison?.achievedDeltaPct < 0 ? '#d32f2f' : '#757575',
                        }}
                      >
                        {comparison?.achievedDeltaPct ? formatPercent(comparison.achievedDeltaPct) : '-'}
                      </TableCell>
                      <TableCell align="center">
                        {comparison?.achievedDelta !== 0 && renderTrendIcon(comparison?.achievedDelta || 0)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Comparación por KPI y Distribuidor */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0px 6px 12px rgba(103, 80, 164, 0.12)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#6750A4' }}>
              Comparación por KPI
            </Typography>
            {loadingKpi ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={kpiData?.data || []} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#757575' }} tickLine={false} stroke="#e0e0e0" />
                  <YAxis
                    type="category"
                    dataKey="kpi"
                    width={100}
                    tick={{ fontSize: 10, fill: '#757575' }}
                    tickLine={false}
                    stroke="#e0e0e0"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  <Bar dataKey="currentAchieved" fill="#1976d2" name="Actual" radius={[0, 8, 8, 0]} />
                  <Bar dataKey="previousAchieved" fill="#757575" name="Anterior" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0px 6px 12px rgba(103, 80, 164, 0.12)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#6750A4' }}>
              Top 10 Distribuidores
            </Typography>
            {loadingDistributor ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Distribuidor</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>
                        Actual
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>
                        Δ %
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>
                        Rank
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {distributorData?.data?.map((dist: any) => (
                      <TableRow key={dist.distributor} hover>
                        <TableCell sx={{ fontSize: '0.875rem' }}>{dist.distributor}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500 }}>
                          {formatNumber(dist.currentAchieved)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color: dist.deltaPct > 0 ? '#2e7d32' : dist.deltaPct < 0 ? '#d32f2f' : '#757575',
                            fontWeight: 500,
                          }}
                        >
                          {formatPercent(dist.deltaPct)}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {dist.currentRank}
                            </Typography>
                            {dist.rankChange > 0 && (
                              <Typography variant="caption" sx={{ color: '#2e7d32' }}>
                                ↑{dist.rankChange}
                              </Typography>
                            )}
                            {dist.rankChange < 0 && (
                              <Typography variant="caption" sx={{ color: '#d32f2f' }}>
                                ↓{Math.abs(dist.rankChange)}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
