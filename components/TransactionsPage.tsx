import { useState } from 'react';
import { Box, Container, ToggleButton, ToggleButtonGroup, FormControl, Select, MenuItem, Typography, Paper } from '@mui/material';
import useSWR from 'swr';
import MonthlySalesCard from './MonthlySalesCard';
import CategorySalesCard from './CategorySalesCard';
import TopProductsCard from './TopProductsCard';
import DistributorSalesCard from './DistributorSalesCard';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TransactionsPage() {
  const [distributor, setDistributor] = useState('all');

  // Fetch distributors list
  const { data: distributorsData } = useSWR<{ success: boolean; data?: { code: string; name: string }[] }>(
    '/api/distributors-list',
    fetcher
  );

  const distributors = distributorsData?.data || [];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#757575', minWidth: 80 }}>
          Filtros:
        </Typography>

        <FormControl size="small" sx={{ minWidth: 250 }}>
          <Select
            value={distributor}
            onChange={(e) => setDistributor(e.target.value)}
            sx={{
              borderRadius: '20px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e0e0e0',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1976d2',
              },
            }}
          >
            <MenuItem value="all">Todos los Distribuidores</MenuItem>
            {distributors.map((dist) => (
              <MenuItem key={dist.code} value={dist.code}>
                {dist.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Card 1: Monthly Sales - Chart Left, Table Right */}
      <MonthlySalesCard distributor={distributor} />

      {/* Card 2: Category Sales - Table Left, Chart Right */}
      <CategorySalesCard distributor={distributor} />

      {/* Card 3: Top Products - Chart Left, Table Right */}
      <TopProductsCard distributor={distributor} />

      {/* Card 4: Distributor Sales - Table Left, Chart Right */}
      <DistributorSalesCard />
    </Container>
  );
}
