import { Paper, Box, Typography, CircularProgress, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const COLORS = ['#1976d2', '#2e7d32', '#757575', '#212121', '#42a5f5', '#4caf50', '#9e9e9e', '#616161'];

interface CategorySales {
  category: string;
  totalSales: number;
  totalUnits: number;
  transactionCount: number;
}

interface DateRange {
  fromMonth: number;
  fromYear: number;
  toMonth: number;
  toYear: number;
}

interface CategorySalesCardProps {
  distributor?: string;
  month?: string;
  year?: string;
  dateRange?: DateRange;
}

export default function CategorySalesCard({ distributor = 'all', month = 'all', year = 'all', dateRange }: CategorySalesCardProps) {
  const queryParams = new URLSearchParams({ distributor, month, year });
  if (dateRange) {
    queryParams.append('fromMonth', dateRange.fromMonth.toString());
    queryParams.append('fromYear', dateRange.fromYear.toString());
    queryParams.append('toMonth', dateRange.toMonth.toString());
    queryParams.append('toYear', dateRange.toYear.toString());
  }

  const { data, error, isLoading } = useSWR<{ success: boolean; data?: CategorySales[] }>(
    `/api/transactions-by-category?${queryParams.toString()}`,
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
        Unidades Vendidas por Categoría
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TableContainer sx={{ maxHeight: 350 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Categoría</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Unidades</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Ventas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chartData.map((row, index) => (
                  <TableRow key={row.category} hover>
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
                        {row.category}
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500 }}>
                      {row.totalUnits.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      ${row.totalSales.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} md={6}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="category"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 10, fill: '#757575' }}
                tickLine={false}
                stroke="#e0e0e0"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#757575' }}
                tickLine={false}
                stroke="#e0e0e0"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => [value.toLocaleString(), 'Unidades']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="totalUnits" radius={[8, 8, 0, 0]}>
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
