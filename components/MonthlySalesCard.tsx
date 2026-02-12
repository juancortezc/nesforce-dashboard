import { Paper, Box, Typography, CircularProgress, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MonthlySales {
  month: number;
  year: number;
  monthName: string;
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

interface MonthlySalesCardProps {
  distributor?: string;
  categoria?: string;
  sapCode?: string;
  subcategoria?: string;
  exclude?: string;
  promo?: string;
  dateRange?: DateRange;
}

export default function MonthlySalesCard({
  distributor = 'all',
  categoria = 'all',
  sapCode = 'all',
  subcategoria = 'all',
  exclude = 'all',
  promo = 'all',
  dateRange,
}: MonthlySalesCardProps) {
  const queryParams = new URLSearchParams({
    distributor,
    categoria,
    sapCode,
    subcategoria,
    exclude,
    promo,
  });

  if (dateRange) {
    queryParams.append('fromMonth', dateRange.fromMonth.toString());
    queryParams.append('fromYear', dateRange.fromYear.toString());
    queryParams.append('toMonth', dateRange.toMonth.toString());
    queryParams.append('toYear', dateRange.toYear.toString());
  }

  const { data, error, isLoading } = useSWR<{ success: boolean; data?: MonthlySales[] }>(
    `/api/transactions-monthly?${queryParams.toString()}`,
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
        Ventas Mensuales (Sin IVA)
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
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
              <Line
                type="monotone"
                dataKey="totalSales"
                stroke="#1976d2"
                strokeWidth={3}
                dot={{ r: 5, fill: '#1976d2' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Grid>

        <Grid item xs={12} md={6}>
          <TableContainer sx={{ maxHeight: 350 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Mes</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Ventas</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Unidades</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Transacciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chartData.map((row) => (
                  <TableRow key={`${row.year}-${row.month}`} hover>
                    <TableCell>{row.monthName}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500 }}>
                      ${row.totalSales.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">{row.totalUnits.toLocaleString()}</TableCell>
                    <TableCell align="right">{row.transactionCount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    ${totalSales.toLocaleString()}
                  </TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Paper>
  );
}
