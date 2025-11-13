import { Paper, Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MonthlyPoints {
  month: number;
  year: number;
  monthName: string;
  totalPoints: number;
}

const COLORS = ['#1976d2', '#2e7d32', '#757575', '#212121', '#42a5f5', '#4caf50'];

export default function PointsChart() {
  const { data, error, isLoading } = useSWR<{ success: boolean; data?: MonthlyPoints[] }>(
    '/api/points-monthly',
    fetcher
  );

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

  return (
    <Box>
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

      <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Mes</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Puntos</TableCell>
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
