import { Paper, Box, Typography, CircularProgress, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MonthlyAchievement {
  month: number;
  year: number;
  monthName: string;
  target: number;
  achieved: number;
  percentage: number;
}

export default function AchievementChart() {
  const { data, error, isLoading } = useSWR<{ success: boolean; data?: MonthlyAchievement[] }>(
    '/api/achievement-monthly',
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
  const avgPercentage =
    chartData.length > 0
      ? chartData.reduce((sum, item) => sum + item.percentage, 0) / chartData.length
      : 0;

  return (
    <Box>
      <Paper sx={{ p: 3, height: '100%', mb: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#212121' }}>
            Cumplimiento de Objetivos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Meta: 60% de cumplimiento
          </Typography>
        </Box>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="monthName"
              tick={{ fontSize: 11, fill: '#757575' }}
              tickLine={false}
              stroke="#e0e0e0"
            />
            <YAxis
              yAxisId="left"
              tickFormatter={(value) => value.toLocaleString()}
              tick={{ fontSize: 11, fill: '#757575' }}
              tickLine={false}
              stroke="#e0e0e0"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 11, fill: '#757575' }}
              tickLine={false}
              stroke="#e0e0e0"
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'percentage') return [`${value.toFixed(1)}%`, 'Cumplimiento'];
                return [value.toLocaleString(), name === 'target' ? 'Objetivo' : 'Alcanzado'];
              }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: 8,
              }}
            />
            <ReferenceLine yAxisId="right" y={60} stroke="#757575" strokeDasharray="5 5" label="Meta 60%" />
            <Line yAxisId="left" type="monotone" dataKey="target" stroke="#1976d2" strokeWidth={2} name="Objetivo" />
            <Line yAxisId="left" type="monotone" dataKey="achieved" stroke="#2e7d32" strokeWidth={2} name="Alcanzado" />
            <Line yAxisId="right" type="monotone" dataKey="percentage" stroke="#212121" strokeWidth={2} name="Cumplimiento %" />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Mes</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Objetivo</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Alcanzado</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>% Cumplimiento</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {chartData.map((row) => (
              <TableRow key={`${row.year}-${row.month}`} hover>
                <TableCell>{row.monthName}</TableCell>
                <TableCell align="right">{row.target.toLocaleString()}</TableCell>
                <TableCell align="right">{row.achieved.toLocaleString()}</TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 600,
                    color: row.percentage >= 60 ? '#2e7d32' : '#ed6c02'
                  }}
                >
                  {row.percentage.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
