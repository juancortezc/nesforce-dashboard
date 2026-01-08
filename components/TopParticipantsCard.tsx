import { Paper, Box, Typography, CircularProgress, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ParticipantPerformance {
  participantId: number;
  participantName: string;
  groupName: string;
  totalPoints: number;
  totalTarget: number;
  totalAchieved: number;
  achievementRate: number;
  kpiCount: number;
}

interface TopParticipantsCardProps {
  month?: string;
  year?: string;
  region?: string;
  segment?: string;
  group?: string;
  position?: string;
  route?: string;
  kpi?: string;
  limit?: number;
}

export default function TopParticipantsCard({
  month = 'all',
  year = 'all',
  region = 'all',
  segment = 'all',
  group = 'all',
  position = 'all',
  route = 'all',
  kpi = 'all',
  limit = 15
}: TopParticipantsCardProps) {
  const { data, error, isLoading } = useSWR<{ success: boolean; data?: ParticipantPerformance[] }>(
    `/api/results-top-participants?month=${month}&year=${year}&region=${region}&segment=${segment}&group=${group}&position=${position}&route=${route}&kpi=${kpi}&limit=${limit}`,
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

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#212121' }}>
        Top {limit} Participantes por Puntos
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Participante</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Grupo</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Puntos</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>% Cumpl.</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>KPIs</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chartData.map((row, index) => (
                  <TableRow key={row.participantId} hover>
                    <TableCell sx={{ fontWeight: 600, color: index < 3 ? '#1976d2' : '#757575' }}>
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {row.participantName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#666' }}>
                        {row.groupName}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500 }}>
                      {row.totalPoints.toLocaleString()}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 600,
                        color: row.achievementRate >= 60 ? '#2e7d32' : '#ff9800'
                      }}
                    >
                      {row.achievementRate.toFixed(1)}%
                    </TableCell>
                    <TableCell align="right">{row.kpiCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} md={6}>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              data={chartData.slice(0, 10)}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 150, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#757575' }}
                tickLine={false}
                stroke="#e0e0e0"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="participantName"
                width={150}
                tick={{ fontSize: 10, fill: '#757575' }}
                tickLine={false}
                stroke="#e0e0e0"
              />
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString()} puntos`, 'Puntos']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="totalPoints" fill="#1976d2" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>
    </Paper>
  );
}
