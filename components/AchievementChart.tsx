import { Paper, Box, Typography, CircularProgress, Chip } from '@mui/material';
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
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Cumplimiento de Objetivos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Target vs Achieved por mes
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label={`Promedio: ${avgPercentage.toFixed(1)}%`}
            color={avgPercentage >= 60 ? 'success' : 'warning'}
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label="Meta: 60%"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        </Box>
      </Box>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="monthName" tick={{ fontSize: 12 }} tickLine={false} />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            tickLine={false}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'percentage') return [`${value.toFixed(1)}%`, 'Cumplimiento'];
              return [value.toLocaleString(), name === 'target' ? 'Objetivo' : 'Logrado'];
            }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: 8,
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => {
              if (value === 'target') return 'Objetivo';
              if (value === 'achieved') return 'Logrado';
              if (value === 'percentage') return 'Cumplimiento';
              return value;
            }}
          />
          <ReferenceLine
            yAxisId="right"
            y={60}
            stroke="#2e7d32"
            strokeDasharray="5 5"
            label={{ value: 'Meta 60%', position: 'right', fill: '#2e7d32', fontSize: 12 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="target"
            stroke="#1976d2"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="achieved"
            stroke="#2e7d32"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="percentage"
            stroke="#ed6c02"
            strokeWidth={3}
            dot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}
