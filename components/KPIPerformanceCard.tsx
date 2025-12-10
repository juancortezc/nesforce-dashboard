import { Paper, Typography, CircularProgress, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const COLORS = ['#1976d2', '#2e7d32', '#ff9800', '#757575', '#42a5f5', '#4caf50', '#ffb74d'];

interface KPIPerformance {
  kpiId: string;
  kpiName: string;
  totalPoints: number;
  totalTarget: number;
  totalAchieved: number;
  achievementRate: number;
  participantCount: number;
}

interface KPIPerformanceCardProps {
  month?: string;
  year?: string;
  region?: string;
  segment?: string;
  group?: string;
  position?: string;
  route?: string;
  kpi?: string;
}

export default function KPIPerformanceCard({ month = 'all', year = 'all', region = 'all', segment = 'all', group = 'all', position = 'all', route = 'all', kpi = 'all' }: KPIPerformanceCardProps) {
  const { data, error, isLoading } = useSWR<{ success: boolean; data?: KPIPerformance[] }>(
    `/api/results-by-kpi?month=${month}&year=${year}&region=${region}&segment=${segment}&group=${group}&position=${position}&route=${route}&kpi=${kpi}`,
    fetcher
  );

  if (isLoading) return <Paper sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Paper>;
  if (error || !data?.success) return <Paper sx={{ p: 4 }}><Typography color="error">Error cargando datos</Typography></Paper>;

  const chartData = data.data || [];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#212121' }}>Desempeño por KPI</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData.slice(0, 10)} margin={{ top: 10, right: 10, left: 10, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="kpiName" angle={-45} textAnchor="end" height={120} tick={{ fontSize: 9, fill: '#757575' }} tickLine={false} stroke="#e0e0e0" />
              <YAxis tick={{ fontSize: 11, fill: '#757575' }} tickLine={false} stroke="#e0e0e0" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Puntos']} contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: 8 }} />
              <Bar dataKey="totalPoints" radius={[8, 8, 0, 0]}>
                {chartData.slice(0, 10).map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Grid>
        <Grid item xs={12} md={6}>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>KPI</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Puntos</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>% Cumpl.</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Participantes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chartData.map((row) => (
                  <TableRow key={row.kpiId} hover>
                    <TableCell><Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{row.kpiName}</Typography></TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500 }}>{row.totalPoints.toLocaleString()}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: row.achievementRate >= 60 ? '#2e7d32' : '#ff9800' }}>{row.achievementRate.toFixed(1)}%</TableCell>
                    <TableCell align="right">{row.participantCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Paper>
  );
}
