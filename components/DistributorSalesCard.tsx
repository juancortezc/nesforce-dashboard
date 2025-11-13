import { Paper, Box, Typography, CircularProgress, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const COLORS = ['#1976d2', '#2e7d32', '#ff9800', '#757575', '#42a5f5', '#4caf50', '#ffb74d', '#9e9e9e'];

interface DistributorSales {
  distributorCode: string;
  distributorName: string;
  totalSales: number;
  totalUnits: number;
  transactionCount: number;
}

interface DistributorSalesCardProps {
  month?: string;
  year?: string;
}

export default function DistributorSalesCard({ month = 'all', year = 'all' }: DistributorSalesCardProps) {
  const { data, error, isLoading } = useSWR<{ success: boolean; data?: DistributorSales[] }>(
    `/api/transactions-by-distributor?month=${month}&year=${year}`,
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
  const totalSales = chartData.reduce((sum, item) => sum + item.totalSales, 0);

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#212121' }}>
        Ventas por Distribuidor
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Distribuidor</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Ventas</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>% Total</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Unidades</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chartData.map((row, index) => {
                  const percentage = totalSales > 0 ? (row.totalSales / totalSales) * 100 : 0;
                  return (
                    <TableRow key={row.distributorCode} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: COLORS[index % COLORS.length],
                            }}
                          />
                          <Box>
                            <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                              {row.distributorName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {row.distributorCode}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500 }}>
                        ${row.totalSales.toLocaleString()}
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#757575' }}>
                        {percentage.toFixed(1)}%
                      </TableCell>
                      <TableCell align="right">
                        {row.totalUnits.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    ${totalSales.toLocaleString()}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>100%</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} md={6}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="distributorName"
                angle={-45}
                textAnchor="end"
                height={120}
                tick={{ fontSize: 10, fill: '#757575' }}
                tickLine={false}
                stroke="#e0e0e0"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#757575' }}
                tickLine={false}
                stroke="#e0e0e0"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ventas']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="totalSales" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>
    </Paper>
  );
}
