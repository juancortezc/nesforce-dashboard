import { useState, useMemo } from 'react';
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
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import useSWR from 'swr';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import { PageHeader } from './PageHeader';
import { FiltersCard } from './FiltersCard';
import { KPICards } from './KPICards';
import { DateRange } from './Header';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const MONTHS = ['Todos', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const CURRENT_YEAR = new Date().getFullYear().toString();
const YEARS = ['Todos', '2024', '2025', '2026'];

interface LogisticsPageProps {
  currentIndex?: number;
  totalPages?: number;
  onPrevious?: () => void;
  onNext?: () => void;
  dateRange?: DateRange;
}

interface KPIsData {
  ordered: number;
  warehouse: number;
  dispatched: number;
  delivered: number;
  canceled: number;
  avgDeliveryDays: number | null;
}

interface DispatchData {
  date: string;
  dayName: string;
  dispatched: number;
  delivered: number;
}

interface OnTimeData {
  onTime: number;
  delayed: number;
  onTimePercent: number;
  delayedPercent: number;
  targetDays: number;
}

interface DelayedRequest {
  requestId: number;
  requestCode: string;
  participantName: string;
  awardName: string;
  requestedAt: string;
  status: string;
  delayDays: number;
}

const STATUS_LABELS: Record<string, string> = {
  ORDERRED: 'Solicitado',
  WAREHOUSE: 'En Bodega',
  DISPATCHED: 'Despachado',
  DELIVERED: 'Entregado',
  CANCELED: 'Cancelado',
};

export default function LogisticsPage({ currentIndex = 5, totalPages = 6, onPrevious, onNext }: LogisticsPageProps) {
  const [filters, setFilters] = useState({
    month: 'all',
    year: CURRENT_YEAR,
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.month !== 'all') params.append('month', filters.month);
    if (filters.year !== 'all') params.append('year', filters.year);
    return params.toString();
  }, [filters]);

  const { data: kpisData, isLoading: loadingKpis } = useSWR<{ success: boolean; data?: KPIsData }>(
    `/api/logistics-kpis${queryString ? `?${queryString}` : ''}`,
    fetcher
  );

  const { data: dispatchesData, isLoading: loadingDispatches } = useSWR<{ success: boolean; data?: DispatchData[] }>(
    `/api/logistics-dispatches${queryString ? `?${queryString}` : ''}`,
    fetcher
  );

  const { data: onTimeData, isLoading: loadingOnTime } = useSWR<{ success: boolean; data?: OnTimeData }>(
    `/api/logistics-ontime${queryString ? `?${queryString}` : ''}`,
    fetcher
  );

  const { data: delayedData, isLoading: loadingDelayed } = useSWR<{ success: boolean; data?: DelayedRequest[] }>(
    `/api/logistics-delayed${queryString ? `?${queryString}` : ''}`,
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
      month: 'all',
      year: CURRENT_YEAR,
    });
  };

  const hasFilters = filters.month !== 'all' || filters.year !== CURRENT_YEAR;

  const formatNumber = (num: number) => num.toLocaleString('es-ES');

  const pieData = onTimeData?.data ? [
    { name: 'A Tiempo', value: onTimeData.data.onTime, color: '#4CAF50' },
    { name: 'Retrasado', value: onTimeData.data.delayed, color: '#F44336' },
  ] : [];

  const handleDownloadCSV = () => {
    if (!delayedData?.data?.length) return;

    const headers = ['Código', 'Participante', 'Premio', 'Fecha Solicitado', 'Estado', 'Días de Retraso'];
    const rows = delayedData.data.map(r => [
      r.requestCode,
      r.participantName,
      r.awardName,
      r.requestedAt,
      STATUS_LABELS[r.status] || r.status,
      r.delayDays.toString(),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `solicitudes-retrasadas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <PageHeader
        title="Logística"
        currentIndex={currentIndex}
        totalPages={totalPages}
        onPrevious={onPrevious}
        onNext={onNext}
      />

      <FiltersCard>
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

        {hasFilters && (
          <Button size="small" onClick={handleClearFilters} sx={{ textTransform: 'none' }}>
            Limpiar
          </Button>
        )}
      </FiltersCard>

      {/* KPIs */}
      <KPICards
        loading={loadingKpis}
        items={[
          {
            title: 'Solicitados',
            value: kpisData?.data?.ordered || 0,
            format: 'number',
            icon: <InventoryIcon sx={{ fontSize: 18 }} />,
            color: '#2196F3',
          },
          {
            title: 'En Bodega',
            value: kpisData?.data?.warehouse || 0,
            format: 'number',
            icon: <WarehouseIcon sx={{ fontSize: 18 }} />,
            color: '#FF9800',
          },
          {
            title: 'Despachados',
            value: kpisData?.data?.dispatched || 0,
            format: 'number',
            icon: <LocalShippingIcon sx={{ fontSize: 18 }} />,
            color: '#9C27B0',
          },
          {
            title: 'Entregados',
            value: kpisData?.data?.delivered || 0,
            format: 'number',
            icon: <CheckCircleIcon sx={{ fontSize: 18 }} />,
            color: '#4CAF50',
          },
          {
            title: 'Tiempo Prom. Entrega',
            value: kpisData?.data?.avgDeliveryDays || 0,
            format: 'decimal',
            icon: <TimerIcon sx={{ fontSize: 18 }} />,
            color: '#003399',
            changeLabel: 'días lab.',
          },
        ]}
      />

      {/* Gráficos */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        {/* Despachos por Día */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: 400 }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>
                Despachos y Entregas por Día
              </Typography>
              {loadingDispatches ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dispatchesData?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 9, fill: '#666' }}
                      tickLine={false}
                      stroke="#e0e0e0"
                      tickFormatter={(value) => value.slice(5)}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#666' }} tickLine={false} stroke="#e0e0e0" />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: 8 }}
                      labelFormatter={(label) => `Fecha: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="dispatched" fill="#9C27B0" name="Despachados" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="delivered" fill="#4CAF50" name="Entregados" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* % Entregas a Tiempo */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: 400 }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>
                Entregas a Tiempo (Meta: {onTimeData?.data?.targetDays || 15} días lab.)
              </Typography>
              {loadingOnTime ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de Solicitudes Retrasadas */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>
              Solicitudes Retrasadas (+15 días laborables)
            </Typography>
            <Tooltip title="Descargar CSV">
              <IconButton
                size="small"
                onClick={handleDownloadCSV}
                disabled={!delayedData?.data?.length}
                sx={{ color: 'primary.main' }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {loadingDelayed ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : !delayedData?.data?.length ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No hay solicitudes retrasadas
            </Typography>
          ) : (
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Código</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Participante</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Premio</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Fecha Solicitado</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Estado</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Días Retraso</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {delayedData.data.map((row) => (
                    <TableRow key={row.requestId} hover>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{row.requestCode}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.participantName}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.awardName}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{row.requestedAt}</TableCell>
                      <TableCell>
                        <Chip
                          label={STATUS_LABELS[row.status] || row.status}
                          size="small"
                          sx={{
                            fontSize: '0.7rem',
                            bgcolor: row.status === 'WAREHOUSE' ? '#FFF3E0' : row.status === 'DISPATCHED' ? '#F3E5F5' : '#E3F2FD',
                            color: row.status === 'WAREHOUSE' ? '#E65100' : row.status === 'DISPATCHED' ? '#7B1FA2' : '#1565C0',
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`+${row.delayDays}`}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            bgcolor: row.delayDays > 30 ? '#FFEBEE' : row.delayDays > 15 ? '#FFF3E0' : '#FFF8E1',
                            color: row.delayDays > 30 ? '#C62828' : row.delayDays > 15 ? '#E65100' : '#F57F17',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
