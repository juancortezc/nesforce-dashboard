import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
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
} from '@mui/material';
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from 'recharts';
import useSWR from 'swr';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarsIcon from '@mui/icons-material/Stars';
import PeopleIcon from '@mui/icons-material/People';
import { PageHeader } from './PageHeader';
import { FiltersCard } from './FiltersCard';
import { KPICards } from './KPICards';
import { DateRange } from './Header';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const MONTHS = ['Todos', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const YEARS = ['Todos', '2024', '2025'];

interface ComparativesPageProps {
  currentIndex?: number;
  totalPages?: number;
  onPrevious?: () => void;
  onNext?: () => void;
  dateRange?: DateRange;
}

export default function ComparativesPage({ currentIndex = 4, totalPages = 5, onPrevious, onNext, dateRange }: ComparativesPageProps) {
  const [filters, setFilters] = useState({
    region: '',
    month: 'all',
    year: 'all',
    segment: 'all',
    group: 'all',
    position: '',
    route: 'all',
    kpi: 'all',
    mode: 'month-to-month',
  });

  const filterOptionsUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.region) params.append('region', filters.region);
    if (filters.segment) params.append('segment', filters.segment);
    return `/api/results-filter-options${params.toString() ? `?${params.toString()}` : ''}`;
  }, [filters.region, filters.segment]);

  const { data: filterOptions } = useSWR<{
    success: boolean;
    data?: { regions: string[]; segments: string[]; groups: string[]; positions: string[]; routes: string[]; kpis: string[] };
  }>(filterOptionsUrl, fetcher);

  useEffect(() => {
    if (filterOptions?.data?.positions && filterOptions.data.positions.length > 0 && !filters.position) {
      const vendedor = filterOptions.data.positions.find((p) => p.toLowerCase().includes('vendedor'));
      setFilters((prev) => ({
        ...prev,
        position: vendedor || filterOptions.data!.positions[0],
      }));
    }
  }, [filterOptions, filters.position]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') params.append(key, value);
    });
    return params.toString();
  }, [filters]);

  const { data: summaryData, isLoading: loadingSummary } = useSWR(`/api/comparatives-summary?${queryString}`, fetcher);
  const { data: trendData, isLoading: loadingTrend } = useSWR(`/api/comparatives-trend?${queryString}`, fetcher);
  const { data: kpiData, isLoading: loadingKpi } = useSWR(`/api/comparatives-by-kpi?${queryString}`, fetcher);
  const { data: distributorData, isLoading: loadingDistributor } = useSWR(`/api/comparatives-by-distributor?${queryString}`, fetcher);

  const handleFilterChange = (field: keyof typeof filters) => (event: SelectChangeEvent) => {
    const newValue = event.target.value;

    if (field === 'region') {
      setFilters((prev) => ({ ...prev, region: newValue, segment: '', group: '' }));
    } else if (field === 'segment') {
      setFilters((prev) => ({ ...prev, segment: newValue, group: 'all' }));
    } else {
      setFilters((prev) => ({ ...prev, [field]: newValue }));
    }
  };

  const handleClearFilters = () => {
    const vendedor = filterOptions?.data?.positions.find((p) => p.toLowerCase().includes('vendedor'));
    setFilters({
      region: '',
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
    <Box>
      <PageHeader
        title="Comparativos"
        currentIndex={currentIndex}
        totalPages={totalPages}
        onPrevious={onPrevious}
        onNext={onNext}
      />

      <FiltersCard title="Filtros Comparativos">
        <FormControl size="small" sx={{ minWidth: 90 }}>
          <InputLabel>Mes</InputLabel>
          <Select value={filters.month} label="Mes" onChange={handleFilterChange('month')}>
            {MONTHS.map((m, i) => (
              <MenuItem key={i} value={i === 0 ? 'all' : i.toString()}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 80 }}>
          <InputLabel>Año</InputLabel>
          <Select value={filters.year} label="Año" onChange={handleFilterChange('year')}>
            {YEARS.map((y) => (
              <MenuItem key={y} value={y === 'Todos' ? 'all' : y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Región</InputLabel>
          <Select value={filters.region} label="Región" onChange={handleFilterChange('region')}>
            <MenuItem value="">Todas</MenuItem>
            {filterOptions?.data?.regions?.map((region) => (
              <MenuItem key={region} value={region}>{region}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Segmento</InputLabel>
          <Select value={filters.segment} label="Segmento" onChange={handleFilterChange('segment')}>
            <MenuItem value="all">Todos</MenuItem>
            {filterOptions?.data?.segments.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Distribuidor</InputLabel>
          <Select value={filters.group} label="Distribuidor" onChange={handleFilterChange('group')}>
            <MenuItem value="all">Todos</MenuItem>
            {filterOptions?.data?.groups.map((g) => (
              <MenuItem key={g} value={g}>{g}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Cargo *</InputLabel>
          <Select value={filters.position} label="Cargo *" onChange={handleFilterChange('position')}>
            {filterOptions?.data?.positions.map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 90 }}>
          <InputLabel>Ruta</InputLabel>
          <Select value={filters.route} label="Ruta" onChange={handleFilterChange('route')}>
            <MenuItem value="all">Todas</MenuItem>
            {filterOptions?.data?.routes.map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 90 }}>
          <InputLabel>KPI</InputLabel>
          <Select value={filters.kpi} label="KPI" onChange={handleFilterChange('kpi')}>
            <MenuItem value="all">Todos</MenuItem>
            {filterOptions?.data?.kpis.map((k) => (
              <MenuItem key={k} value={k}>{k}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Modo</InputLabel>
          <Select value={filters.mode} label="Modo" onChange={handleFilterChange('mode')}>
            <MenuItem value="month-to-month">Mes a Mes</MenuItem>
            <MenuItem value="quarter">Trimestre</MenuItem>
            <MenuItem value="ytd">YTD</MenuItem>
          </Select>
        </FormControl>

        {hasFilters && (
          <Button size="small" onClick={handleClearFilters} sx={{ textTransform: 'none' }}>
            Limpiar
          </Button>
        )}
      </FiltersCard>

      {/* KPIs */}
      <KPICards
        loading={loadingSummary}
        items={[
          {
            title: 'Total Achieved',
            value: summaryData?.data?.currentPeriod.achieved || 0,
            format: 'number',
            change: summaryData?.data?.changes.achievedDeltaPct || 0,
            icon: <AssessmentIcon sx={{ fontSize: 18 }} />,
            color: '#003399',
          },
          {
            title: '% Cumplimiento',
            value: summaryData?.data?.currentPeriod.fulfillment || 0,
            format: 'percent',
            change: summaryData?.data?.changes.fulfillmentDelta || 0,
            icon: <CheckCircleIcon sx={{ fontSize: 18 }} />,
            color: '#4CAF50',
          },
          {
            title: 'Total Puntos',
            value: summaryData?.data?.currentPeriod.points || 0,
            format: 'number',
            change: summaryData?.data?.changes.pointsDeltaPct || 0,
            icon: <StarsIcon sx={{ fontSize: 18 }} />,
            color: '#0052CC',
          },
          {
            title: 'Participantes',
            value: summaryData?.data?.currentPeriod.participants || 0,
            format: 'number',
            change: summaryData?.data?.changes.participantsDeltaPct || 0,
            icon: <PeopleIcon sx={{ fontSize: 18 }} />,
            color: '#FF9800',
          },
        ]}
      />

      {/* Gráfico de Tendencia */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: { xs: 2, sm: 3 } }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>
            Tendencia Temporal
          </Typography>
          {loadingTrend ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={trendData?.data?.periods || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="monthName" tick={{ fontSize: 10, fill: '#666' }} tickLine={false} stroke="#e0e0e0" />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#666' }} tickLine={false} stroke="#e0e0e0" tickFormatter={(value) => value.toLocaleString()} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#666' }} tickLine={false} stroke="#e0e0e0" domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: 8 }} />
                <Legend />
                <Bar yAxisId="left" dataKey="achieved" fill="#003399" name="Achieved" radius={[6, 6, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="fulfillment" stroke="#2e7d32" strokeWidth={2} name="% Cumplimiento" dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Detalle por Período */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: { xs: 2, sm: 3 } }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>
            Detalle por Período
          </Typography>
          {loadingTrend ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Período</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Target</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Achieved</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>%</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Puntos</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Δ</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trendData?.data?.periods.map((period: any, index: number) => {
                    const comparison = trendData?.data?.comparisons[index];
                    return (
                      <TableRow key={`${period.year}-${period.month}`} hover>
                        <TableCell sx={{ fontWeight: 500, fontSize: '0.8rem' }}>{period.monthName}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{formatNumber(period.target)}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{formatNumber(period.achieved)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>{period.fulfillment.toFixed(1)}%</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{formatNumber(period.points)}</TableCell>
                        <TableCell align="right" sx={{ color: comparison?.achievedDeltaPct > 0 ? '#2e7d32' : comparison?.achievedDeltaPct < 0 ? '#d32f2f' : '#757575', fontSize: '0.8rem' }}>
                          {comparison?.achievedDeltaPct ? formatPercent(comparison.achievedDeltaPct) : '-'}
                        </TableCell>
                        <TableCell align="center">{comparison?.achievedDelta !== 0 && renderTrendIcon(comparison?.achievedDelta || 0)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Comparación por KPI y Distribuidor */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: 450 }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>
                Comparación por KPI
              </Typography>
              {loadingKpi ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={kpiData?.data || []} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#666' }} tickLine={false} stroke="#e0e0e0" />
                    <YAxis type="category" dataKey="kpi" width={80} tick={{ fontSize: 9, fill: '#666' }} tickLine={false} stroke="#e0e0e0" />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: 8 }} />
                    <Legend />
                    <Bar dataKey="currentAchieved" fill="#003399" name="Actual" radius={[0, 6, 6, 0]} />
                    <Bar dataKey="previousAchieved" fill="#999" name="Anterior" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: 450 }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>
                Top 10 Distribuidores
              </Typography>
              {loadingDistributor ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
              ) : (
                <TableContainer sx={{ maxHeight: 350 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Distribuidor</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Actual</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Δ %</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Rank</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {distributorData?.data?.map((dist: any) => (
                        <TableRow key={dist.distributor} hover>
                          <TableCell sx={{ fontSize: '0.8rem' }}>{dist.distributor}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>{formatNumber(dist.currentAchieved)}</TableCell>
                          <TableCell align="right" sx={{ color: dist.deltaPct > 0 ? '#2e7d32' : dist.deltaPct < 0 ? '#d32f2f' : '#757575', fontWeight: 500, fontSize: '0.8rem' }}>{formatPercent(dist.deltaPct)}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>{dist.currentRank}</Typography>
                              {dist.rankChange > 0 && <Typography variant="caption" sx={{ color: '#2e7d32' }}>↑{dist.rankChange}</Typography>}
                              {dist.rankChange < 0 && <Typography variant="caption" sx={{ color: '#d32f2f' }}>↓{Math.abs(dist.rankChange)}</Typography>}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
