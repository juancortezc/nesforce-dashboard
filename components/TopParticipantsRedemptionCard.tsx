import { Paper, Typography, CircularProgress, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const COLORS = ['#1976d2', '#2e7d32', '#ff9800', '#757575', '#42a5f5', '#4caf50', '#ffb74d', '#9e9e9e', '#64b5f6', '#81c784'];

export default function TopParticipantsRedemptionCard({ month = 'all', year = 'all', region = '', category = 'all', segment = 'all' }: any) {
  const { data, error, isLoading } = useSWR(
    `/api/program28-top-participants?month=${month}&year=${year}&region=${region}&category=${category}&segment=${segment}`,
    fetcher
  );

  if (isLoading) return <Paper sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Paper>;
  if (error || !data?.success) return <Paper sx={{ p: 4 }}><Typography color="error">Error cargando datos</Typography></Paper>;

  const participants = data.data || [];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#212121' }}>Top Participantes por Canjes</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart
              data={participants.slice(0, 10)}
              margin={{ top: 10, right: 10, left: 10, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="participantName"
                angle={-45}
                textAnchor="end"
                height={140}
                tick={{ fontSize: 9, fill: '#757575' }}
                tickLine={false}
                stroke="#e0e0e0"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#757575' }}
                tickLine={false}
                stroke="#e0e0e0"
              />
              <Tooltip
                formatter={(value: number) => [value.toLocaleString(), 'Canjes']}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: 8 }}
              />
              <Bar dataKey="totalRedemptions" radius={[8, 8, 0, 0]}>
                {participants.slice(0, 10).map((_: any, idx: number) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Grid>
        <Grid item xs={12} md={6}>
          <TableContainer sx={{ maxHeight: 450 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Participante</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Canjes</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Puntos</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Premios Distintos</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participants.map((participant: any, idx: number) => (
                  <TableRow key={participant.participantId} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        {participant.participantName}
                      </Typography>
                      {participant.participantIdentifier && (
                        <Typography variant="caption" color="text.secondary">
                          {participant.participantIdentifier}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: COLORS[idx % COLORS.length] }}>
                      {participant.totalRedemptions.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500 }}>
                      {participant.totalPoints.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#757575' }}>
                      {participant.uniqueAwards.toLocaleString()}
                    </TableCell>
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
