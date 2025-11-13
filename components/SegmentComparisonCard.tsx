import { Paper, Typography, CircularProgress, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const COLORS = ['#1976d2', '#2e7d32', '#ff9800', '#757575', '#42a5f5'];

export default function SegmentComparisonCard({ month = 'all', year = 'all', group = 'all', position = 'all' }: any) {
  const { data, error, isLoading } = useSWR(`/api/results-by-segment?month=${month}&year=${year}&group=${group}&position=${position}`, fetcher);
  if (isLoading) return <Paper sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Paper>;
  if (error || !data?.success) return <Paper sx={{ p: 4 }}><Typography color="error">Error</Typography></Paper>;

  const chartData = data.data || [];
  const totalPoints = chartData.reduce((sum: number, item: any) => sum + item.totalPoints, 0);

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#212121' }}>Comparativa por Segmento</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Segmento</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Puntos</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>% Total</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Participantes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chartData.map((row: any, idx: number) => {
                  const pct = totalPoints > 0 ? (row.totalPoints / totalPoints) * 100 : 0;
                  return (
                    <TableRow key={row.segmentId} hover>
                      <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[idx % COLORS.length] }} />{row.segmentName}</Box></TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500 }}>{row.totalPoints.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ color: '#757575' }}>{pct.toFixed(1)}%</TableCell>
                      <TableCell align="right">{row.participantCount}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12} md={6}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="segmentName" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10, fill: '#757575' }} tickLine={false} stroke="#e0e0e0" />
              <YAxis tick={{ fontSize: 11, fill: '#757575' }} tickLine={false} stroke="#e0e0e0" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Puntos']} contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: 8 }} />
              <Bar dataKey="totalPoints" radius={[8, 8, 0, 0]}>{chartData.map((_: any, idx: number) => <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>
    </Paper>
  );
}
