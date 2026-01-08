import { Paper, Typography, CircularProgress, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const COLORS = ['#1976d2', '#2e7d32', '#ff9800', '#757575', '#42a5f5', '#4caf50'];

export default function GroupPerformanceCard({ month = 'all', year = 'all', region = 'all', segment = 'all', position = 'all', route = 'all', kpi = 'all' }: any) {
  const { data, error, isLoading } = useSWR(`/api/results-by-group?month=${month}&year=${year}&region=${region}&segment=${segment}&position=${position}&route=${route}&kpi=${kpi}`, fetcher);
  if (isLoading) return <Paper sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Paper>;
  if (error || !data?.success) return <Paper sx={{ p: 4 }}><Typography color="error">Error</Typography></Paper>;

  const chartData = data.data || [];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#212121' }}>Performance por Grupo</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={chartData.slice(0, 10)} margin={{ top: 10, right: 10, left: 10, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="groupName" angle={-45} textAnchor="end" height={140} tick={{ fontSize: 9, fill: '#757575' }} tickLine={false} stroke="#e0e0e0" />
              <YAxis tick={{ fontSize: 11, fill: '#757575' }} tickLine={false} stroke="#e0e0e0" tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, '% Cumplimiento']} contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: 8 }} />
              <Bar dataKey="achievementRate" radius={[8, 8, 0, 0]}>{chartData.slice(0, 10).map((_: any, idx: number) => <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Grid>
        <Grid item xs={12} md={6}>
          <TableContainer sx={{ maxHeight: 450 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Grupo</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>% Cumpl.</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Puntos</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chartData.map((row: any) => (
                  <TableRow key={row.groupId} hover>
                    <TableCell><Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{row.groupName}</Typography><Typography variant="caption" color="text.secondary">{row.groupCode}</Typography></TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: row.achievementRate >= 60 ? '#2e7d32' : '#ff9800' }}>{row.achievementRate.toFixed(1)}%</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500 }}>{row.totalPoints.toLocaleString()}</TableCell>
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
