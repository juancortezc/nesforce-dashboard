import { Paper, Box, Typography, CircularProgress, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ProductSales {
  product: string;
  codSap: string;
  totalSales: number;
  totalUnits: number;
  transactionCount: number;
}

interface TopProductsCardProps {
  distributor?: string;
  month?: string;
  year?: string;
  category?: string;
  limit?: number;
}

export default function TopProductsCard({
  distributor = 'all',
  month = 'all',
  year = 'all',
  category = 'all',
  limit = 15
}: TopProductsCardProps) {
  const { data, error, isLoading} = useSWR<{ success: boolean; data?: ProductSales[] }>(
    `/api/transactions-top-products?distributor=${distributor}&month=${month}&year=${year}&category=${category}&limit=${limit}`,
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

  // Truncate product names for chart
  const chartDataFormatted = chartData.map(item => ({
    ...item,
    productShort: item.product.length > 30 ? item.product.substring(0, 30) + '...' : item.product
  }));

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#212121' }}>
        Top {limit} Productos Más Vendidos
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              data={chartDataFormatted}
              layout="vertical"
              margin={{ top: 10, right: 10, left: 100, bottom: 5 }}
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
                dataKey="productShort"
                width={100}
                tick={{ fontSize: 9, fill: '#757575' }}
                tickLine={false}
                stroke="#e0e0e0"
              />
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${value.toLocaleString()} unidades`,
                  props.payload.product
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="totalUnits" fill="#2e7d32" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Grid>

        <Grid item xs={12} md={6}>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Producto</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Unidades</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Ventas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chartData.map((row, index) => (
                  <TableRow key={row.codSap} hover>
                    <TableCell sx={{ fontWeight: 600, color: '#757575' }}>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {row.product}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.codSap}
                      </Typography>
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
      </Grid>
    </Paper>
  );
}
