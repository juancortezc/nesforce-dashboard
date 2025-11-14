import { Paper, Typography, Grid, Box, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MetricCardProps {
  title: string;
  value: string | number;
  color: string;
}

function MetricCard({ title, value, color }: MetricCardProps) {
  return (
    <Paper sx={{ p: 3, textAlign: 'center', borderTop: `4px solid ${color}` }}>
      <Typography variant="body2" sx={{ color: '#757575', mb: 1, fontWeight: 500 }}>{title}</Typography>
      <Typography variant="h4" sx={{ fontWeight: 600, color: '#212121' }}>{value}</Typography>
    </Paper>
  );
}

export default function Program28SummaryCard({ month = 'all', year = 'all', category = 'all', segment = 'all' }: any) {
  const { data, error, isLoading } = useSWR(
    `/api/program28-summary?month=${month}&year=${year}&category=${category}&segment=${segment}`,
    fetcher
  );

  if (isLoading) return <Paper sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Paper>;
  if (error || !data?.success) return <Paper sx={{ p: 4 }}><Typography color="error">Error cargando datos</Typography></Paper>;

  const summary = {
    totalRedemptions: data.data?.totalRedemptions || 0,
    totalPoints: data.data?.totalPoints || 0,
    uniqueParticipants: data.data?.totalParticipants || 0,
    uniqueAwards: data.data?.totalAwards || 0,
  };
  const monthly = data.data?.monthlyData || [];

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Total Canjes" value={summary.totalRedemptions?.toLocaleString() || '0'} color="#1976d2" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Puntos Canjeados" value={summary.totalPoints?.toLocaleString() || '0'} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Participantes" value={summary.uniqueParticipants?.toLocaleString() || '0'} color="#ff9800" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Premios Distintos" value={summary.uniqueAwards?.toLocaleString() || '0'} color="#757575" />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#212121' }}>Evolución Mensual de Canjes</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthly} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#757575' }}
              tickLine={false}
              stroke="#e0e0e0"
              tickFormatter={(value) => {
                const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                return months[value - 1] || value;
              }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#757575' }}
              tickLine={false}
              stroke="#e0e0e0"
              tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
            />
            <Tooltip
              formatter={(value: number) => [value.toLocaleString(), 'Canjes']}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: 8 }}
            />
            <Line
              type="monotone"
              dataKey="totalRedemptions"
              stroke="#1976d2"
              strokeWidth={2.5}
              dot={{ fill: '#1976d2', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </>
  );
}
