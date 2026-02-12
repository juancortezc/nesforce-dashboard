import { useState, useEffect, useMemo } from 'react';
import {
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
  Card,
  CardContent,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from 'recharts';
import useSWR from 'swr';
import StarsIcon from '@mui/icons-material/Stars';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { PageHeader } from './PageHeader';
import { FiltersCard } from './FiltersCard';
import { KPICards } from './KPICards';
import { DateRange } from './Header';
import { pointsPageInfo } from '@/config/pageInfoConfigs';

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
  regions: string[];
  segments: string[];
  groups: string[];
  positions: string[];
  routes: string[];
  kpis: string[];
}

interface PointsPageProps {
  currentIndex?: number;
  totalPages?: number;
  onPrevious?: () => void;
  onNext?: () => void;
  dateRange?: DateRange;
}

const COLORS = ['#003399', '#0052CC', '#666666', '#1A1A1A', '#4D8FCC', '#99B3CC'];

export default function PointsPage({ currentIndex = 0, totalPages = 5, onPrevious, onNext, dateRange }: PointsPageProps) {
  const [filters, setFilters] = useState({
    region: '',
    segment: '',
    group: '',
    position: '',
    route: '',
    kpi: '',
  });

  const filterOptionsUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.region) params.append('region', filters.region);
    if (filters.segment) params.append('segment', filters.segment);
    return `/api/results-filter-options${params.toString() ? `?${params.toString()}` : ''}`;
  }, [filters.region, filters.segment]);

  const { data: filterOptions } = useSWR<{ success: boolean; data?: FilterOptions }>(
    filterOptionsUrl,
    fetcher
  );

  useEffect(() => {
    if (filterOptions?.data?.positions && filterOptions.data.positions.length > 0 && !filters.position) {
      const vendedor = filterOptions.data.positions.find(p => p.toLowerCase().includes('vendedor'));
      setFilters(prev => ({
        ...prev,
        position: vendedor || filterOptions.data!.positions[0]
      }));
    }
  }, [filterOptions, filters.position]);

  const queryString = useMemo(() => {
    const queryParams = new URLSearchParams();
    if (filters.region) queryParams.append('region', filters.region);
    if (filters.segment) queryParams.append('segment', filters.segment);
    if (filters.group) queryParams.append('group', filters.group);
    if (filters.position) queryParams.append('position', filters.position);
    if (filters.route) queryParams.append('route', filters.route);
    if (filters.kpi) queryParams.append('kpi', filters.kpi);
    return queryParams.toString();
  }, [filters]);

  const { data, error, isLoading } = useSWR<{ success: boolean; data?: MonthlyPoints[] }>(
    `/api/points-monthly${queryString ? `?${queryString}` : ''}`,
    fetcher
  );

  const { data: kpiData, isLoading: isLoadingKpi } = useSWR<{ success: boolean; data?: KPIPoints[] }>(
    `/api/points-by-kpi${queryString ? `?${queryString}` : ''}`,
    fetcher
  );

  const { data: achievementData, isLoading: isLoadingAchievement } = useSWR<{ success: boolean; data?: MonthlyAchievement[] }>(
    `/api/achievement-by-month${queryString ? `?${queryString}` : ''}`,
    fetcher
  );

  const handleFilterChange = (field: keyof typeof filters) => (event: SelectChangeEvent) => {
    const newValue = event.target.value;

    if (field === 'region') {
      setFilters((prev) => ({
        ...prev,
        region: newValue,
        segment: '',
        group: '',
      }));
    } else if (field === 'segment') {
      setFilters((prev) => ({
        ...prev,
        segment: newValue,
        group: '',
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
      region: '',
      segment: '',
      group: '',
      position: vendedor || filterOptions?.data?.positions[0] || '',
      route: '',
      kpi: '',
    });
  };

  if (isLoading) {
    return (
      <Box>
        <PageHeader
          title="Puntos"
          currentIndex={currentIndex}
          totalPages={totalPages}
          onPrevious={onPrevious}
          onNext={onNext}
          pageInfo={pointsPageInfo}
        />
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Card>
      </Box>
    );
  }

  if (error || !data?.success) {
    return (
      <Box>
        <PageHeader
          title="Puntos"
          currentIndex={currentIndex}
          totalPages={totalPages}
          onPrevious={onPrevious}
          onNext={onNext}
          pageInfo={pointsPageInfo}
        />
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 4 }}>
          <Typography color="error">Error cargando datos</Typography>
        </Card>
      </Box>
    );
  }

  const chartData = data.data || [];
  const totalPoints = chartData.reduce((sum, item) => sum + item.totalPoints, 0);
  const hasFilters = filters.region || filters.segment || filters.group || filters.route || filters.kpi;

  return (
    <Box>
      <PageHeader
        title="Puntos"
        currentIndex={currentIndex}
        totalPages={totalPages}
        onPrevious={onPrevious}
        onNext={onNext}
      />

      {/* Filtros */}
      <FiltersCard>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Región</InputLabel>
          <Select value={filters.region} label="Región" onChange={handleFilterChange('region')}>
            <MenuItem value="">Todas</MenuItem>
            {filterOptions?.data?.regions.map((region) => (
              <MenuItem key={region} value={region}>{region}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Segmento</InputLabel>
          <Select value={filters.segment} label="Segmento" onChange={handleFilterChange('segment')}>
            <MenuItem value="">Todos</MenuItem>
            {filterOptions?.data?.segments.map((segment) => (
              <MenuItem key={segment} value={segment}>{segment}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Distribuidor</InputLabel>
          <Select value={filters.group} label="Distribuidor" onChange={handleFilterChange('group')}>
            <MenuItem value="">Todos</MenuItem>
            {filterOptions?.data?.groups.map((group) => (
              <MenuItem key={group} value={group}>{group}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Cargo</InputLabel>
          <Select value={filters.position} label="Cargo" onChange={handleFilterChange('position')}>
            {filterOptions?.data?.positions.map((position) => (
              <MenuItem key={position} value={position}>{position}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Ruta</InputLabel>
          <Select value={filters.route} label="Ruta" onChange={handleFilterChange('route')}>
            <MenuItem value="">Todas</MenuItem>
            {filterOptions?.data?.routes.map((route) => (
              <MenuItem key={route} value={route}>{route}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>KPI</InputLabel>
          <Select value={filters.kpi} label="KPI" onChange={handleFilterChange('kpi')}>
            <MenuItem value="">Todos</MenuItem>
            {filterOptions?.data?.kpis.map((kpi) => (
              <MenuItem key={kpi} value={kpi}>{kpi}</MenuItem>
            ))}
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
        loading={isLoading || isLoadingKpi || isLoadingAchievement}
        items={[
          {
            title: 'Puntos Totales',
            value: totalPoints,
            format: 'number',
            icon: <StarsIcon sx={{ fontSize: 18 }} />,
            color: '#003399',
          },
          {
            title: 'Participantes',
            value: kpiData?.data?.reduce((sum, item) => sum + item.participantCount, 0) || 0,
            format: 'number',
            icon: <PeopleIcon sx={{ fontSize: 18 }} />,
            color: '#0052CC',
          },
          {
            title: '% Logro Promedio',
            value: achievementData?.data?.length
              ? achievementData.data.reduce((sum, item) => sum + item.avgAchievementRate, 0) / achievementData.data.length
              : 0,
            format: 'percent',
            icon: <TrendingUpIcon sx={{ fontSize: 18 }} />,
            color: '#4CAF50',
          },
          {
            title: 'Promedio por Participante',
            value: kpiData?.data?.length
              ? Math.round(kpiData.data.reduce((sum, item) => sum + item.avgPointsPerParticipant, 0) / kpiData.data.length)
              : 0,
            format: 'number',
            icon: <EmojiEventsIcon sx={{ fontSize: 18 }} />,
            color: '#FF9800',
          },
        ]}
      />

      {/* Fila 1: Gráfico y Tabla */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>
                  Puntos Entregados por Mes
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Total: {totalPoints.toLocaleString()} puntos
                </Typography>
              </Box>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="monthName" tick={{ fontSize: 10, fill: '#666' }} tickLine={false} stroke="#e0e0e0" />
                  <YAxis tick={{ fontSize: 10, fill: '#666' }} tickLine={false} stroke="#e0e0e0" tickFormatter={(value) => value.toLocaleString()} />
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), 'Puntos']}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: 8 }}
                  />
                  <Bar dataKey="totalPoints" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Mes</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Puntos</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chartData.map((row) => (
                    <TableRow key={`${row.year}-${row.month}`} hover>
                      <TableCell>{row.monthName}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500 }}>{row.totalPoints.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Fila 2: Tabla de KPI y Gráfico de Achievement */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: 450 }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>
                Detalle por KPI
              </Typography>
              {isLoadingKpi ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer sx={{ maxHeight: 350 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Mes</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>KPI</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Puntos</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Part.</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Prom.</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {kpiData?.data?.map((row, idx) => (
                        <TableRow key={`${row.kpiId}-${row.month}-${row.year}-${idx}`} hover>
                          <TableCell sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{row.monthName}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>{row.kpiName}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>{row.totalPoints.toLocaleString()}</TableCell>
                          <TableCell align="right">{row.participantCount}</TableCell>
                          <TableCell align="right" sx={{ color: 'primary.main', fontWeight: 500 }}>{row.avgPointsPerParticipant.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: 450 }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>
                % Logro Promedio por Mes
              </Typography>
              {isLoadingAchievement ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={achievementData?.data || []} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="monthName" tick={{ fontSize: 10, fill: '#666' }} tickLine={false} stroke="#e0e0e0" />
                    <YAxis tick={{ fontSize: 10, fill: '#666' }} tickLine={false} stroke="#e0e0e0" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(1)}%`, '% Logro']}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: 8 }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="avgAchievementRate" stroke="#003399" strokeWidth={3} name="% Logro Promedio" dot={{ r: 4, fill: '#003399' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
