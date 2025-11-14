import { useState } from 'react';
import {
  Box,
  Container,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Paper,
  Grid,
  InputLabel,
  SelectChangeEvent,
  Button,
} from '@mui/material';
import useSWR from 'swr';
import MonthlySalesCard from './MonthlySalesCard';
import CategorySalesCard from './CategorySalesCard';
import TopProductsCard from './TopProductsCard';
import DistributorSalesCard from './DistributorSalesCard';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const MONTHS = ['Todos', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

interface FilterOptions {
  categories: string[];
  sapCodes: string[];
  subcategories: string[];
  distributors: { code: string; name: string }[];
}

export default function TransactionsPage() {
  const [filters, setFilters] = useState({
    month: 'all',
    distributor: 'all',
    categoria: 'all',
    sapCode: 'all',
    subcategoria: 'all',
    exclude: 'all',
    promo: 'all',
  });

  // Load filter options
  const { data: filterOptions } = useSWR<{ success: boolean; data?: FilterOptions }>(
    '/api/transactions-filter-options',
    fetcher
  );

  const handleFilterChange = (field: keyof typeof filters) => (event: SelectChangeEvent) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      month: 'all',
      distributor: 'all',
      categoria: 'all',
      sapCode: 'all',
      subcategoria: 'all',
      exclude: 'all',
      promo: 'all',
    });
  };

  const hasFilters = Object.values(filters).some((v) => v !== 'all');

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Barra de filtros sticky */}
      <Box sx={{ position: 'sticky', top: 64, zIndex: 100, backgroundColor: '#fafafa', pb: 3, mb: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#212121' }}>
              Filtros
            </Typography>
            {hasFilters && (
              <Button size="small" onClick={handleClearFilters} sx={{ textTransform: 'none' }}>
                Limpiar filtros
              </Button>
            )}
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={1.7}>
              <FormControl fullWidth size="small">
                <InputLabel>Mes</InputLabel>
                <Select value={filters.month} label="Mes" onChange={handleFilterChange('month')}>
                  {MONTHS.map((m, i) => (
                    <MenuItem key={i} value={i === 0 ? 'all' : i.toString()}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={1.7}>
            <FormControl fullWidth size="small">
              <InputLabel>Distribuidor</InputLabel>
              <Select
                value={filters.distributor}
                label="Distribuidor"
                onChange={handleFilterChange('distributor')}
              >
                <MenuItem value="all">Todos</MenuItem>
                {filterOptions?.data?.distributors.map((dist) => (
                  <MenuItem key={dist.code} value={dist.code}>
                    {dist.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={1.7}>
            <FormControl fullWidth size="small">
              <InputLabel>Categoría</InputLabel>
              <Select
                value={filters.categoria}
                label="Categoría"
                onChange={handleFilterChange('categoria')}
              >
                <MenuItem value="all">Todas</MenuItem>
                {filterOptions?.data?.categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={1.7}>
            <FormControl fullWidth size="small">
              <InputLabel>Código SAP</InputLabel>
              <Select
                value={filters.sapCode}
                label="Código SAP"
                onChange={handleFilterChange('sapCode')}
              >
                <MenuItem value="all">Todos</MenuItem>
                {filterOptions?.data?.sapCodes.map((code) => (
                  <MenuItem key={code} value={code}>
                    {code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={1.7}>
            <FormControl fullWidth size="small">
              <InputLabel>Subcategoría</InputLabel>
              <Select
                value={filters.subcategoria}
                label="Subcategoría"
                onChange={handleFilterChange('subcategoria')}
              >
                <MenuItem value="all">Todas</MenuItem>
                {filterOptions?.data?.subcategories.map((subcat) => (
                  <MenuItem key={subcat} value={subcat}>
                    {subcat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={1.7}>
            <FormControl fullWidth size="small">
              <InputLabel>Excluido</InputLabel>
              <Select
                value={filters.exclude}
                label="Excluido"
                onChange={handleFilterChange('exclude')}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="false">No excluidos</MenuItem>
                <MenuItem value="true">Excluidos</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={1.7}>
            <FormControl fullWidth size="small">
              <InputLabel>Promo</InputLabel>
              <Select
                value={filters.promo}
                label="Promo"
                onChange={handleFilterChange('promo')}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="true">Solo Promos</MenuItem>
                <MenuItem value="false">Sin Promos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        </Paper>
      </Box>

      {/* Cards con datos */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MonthlySalesCard {...filters} />
        </Grid>

        <Grid item xs={12}>
          <CategorySalesCard {...filters} />
        </Grid>

        <Grid item xs={12}>
          <TopProductsCard {...filters} />
        </Grid>

        <Grid item xs={12}>
          <DistributorSalesCard {...filters} />
        </Grid>
      </Grid>
    </Container>
  );
}
