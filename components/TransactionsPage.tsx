import { useState, useMemo } from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
  Button,
  Grid,
} from '@mui/material';
import useSWR from 'swr';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonthlySalesCard from './MonthlySalesCard';
import CategorySalesCard from './CategorySalesCard';
import TopProductsCard from './TopProductsCard';
import DistributorSalesCard from './DistributorSalesCard';
import { PageHeader } from './PageHeader';
import { FiltersCard } from './FiltersCard';
import { KPICards } from './KPICards';
import { DateRange } from './Header';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const MONTHS = ['Todos', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

interface FilterOptions {
  regions: string[];
  categories: string[];
  sapCodes: string[];
  subcategories: string[];
  distributors: { code: string; name: string }[];
}

interface MonthlySalesData {
  month: number;
  year: number;
  monthName: string;
  totalSales: number;
  totalUnits: number;
  transactionCount: number;
}

interface TransactionsPageProps {
  currentIndex?: number;
  totalPages?: number;
  onPrevious?: () => void;
  onNext?: () => void;
  dateRange?: DateRange;
}

export default function TransactionsPage({ currentIndex = 1, totalPages = 5, onPrevious, onNext, dateRange }: TransactionsPageProps) {
  const [filters, setFilters] = useState({
    region: '',
    month: 'all',
    distributor: 'all',
    categoria: 'all',
    sapCode: 'all',
    subcategoria: 'all',
    exclude: 'all',
    promo: 'all',
  });

  const { data: filterOptions } = useSWR<{ success: boolean; data?: FilterOptions }>(
    '/api/transactions-filter-options',
    fetcher
  );

  const kpiQueryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.month !== 'all') params.append('month', filters.month);
    if (filters.distributor !== 'all') params.append('distributor', filters.distributor);
    if (filters.categoria !== 'all') params.append('categoria', filters.categoria);
    if (filters.sapCode !== 'all') params.append('sapCode', filters.sapCode);
    if (filters.subcategoria !== 'all') params.append('subcategoria', filters.subcategoria);
    if (filters.exclude !== 'all') params.append('exclude', filters.exclude);
    if (filters.promo !== 'all') params.append('promo', filters.promo);
    return params.toString();
  }, [filters]);

  const { data: salesData, isLoading: isLoadingSales } = useSWR<{ success: boolean; data?: MonthlySalesData[] }>(
    `/api/sales-monthly${kpiQueryString ? `?${kpiQueryString}` : ''}`,
    fetcher
  );

  const totalSales = salesData?.data?.reduce((sum, item) => sum + item.totalSales, 0) || 0;
  const totalUnits = salesData?.data?.reduce((sum, item) => sum + item.totalUnits, 0) || 0;
  const totalTransactions = salesData?.data?.reduce((sum, item) => sum + item.transactionCount, 0) || 0;
  const avgTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  const handleFilterChange = (field: keyof typeof filters) => (event: SelectChangeEvent) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      region: '',
      month: 'all',
      distributor: 'all',
      categoria: 'all',
      sapCode: 'all',
      subcategoria: 'all',
      exclude: 'all',
      promo: 'all',
    });
  };

  const hasFilters = Object.entries(filters).some(([key, v]) => key !== 'region' && v !== 'all');

  return (
    <Box>
      <PageHeader
        title="Transacciones"
        currentIndex={currentIndex}
        totalPages={totalPages}
        onPrevious={onPrevious}
        onNext={onNext}
      />

      <FiltersCard>
        <FormControl size="small" sx={{ minWidth: 90 }}>
          <InputLabel>Mes</InputLabel>
          <Select value={filters.month} label="Mes" onChange={handleFilterChange('month')}>
            {MONTHS.map((m, i) => (
              <MenuItem key={i} value={i === 0 ? 'all' : i.toString()}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Distribuidor</InputLabel>
          <Select value={filters.distributor} label="Distribuidor" onChange={handleFilterChange('distributor')}>
            <MenuItem value="all">Todos</MenuItem>
            {filterOptions?.data?.distributors.map((dist) => (
              <MenuItem key={dist.code} value={dist.code}>{dist.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Categoría</InputLabel>
          <Select value={filters.categoria} label="Categoría" onChange={handleFilterChange('categoria')}>
            <MenuItem value="all">Todas</MenuItem>
            {filterOptions?.data?.categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Código SAP</InputLabel>
          <Select value={filters.sapCode} label="Código SAP" onChange={handleFilterChange('sapCode')}>
            <MenuItem value="all">Todos</MenuItem>
            {filterOptions?.data?.sapCodes.map((code) => (
              <MenuItem key={code} value={code}>{code}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Subcategoría</InputLabel>
          <Select value={filters.subcategoria} label="Subcategoría" onChange={handleFilterChange('subcategoria')}>
            <MenuItem value="all">Todas</MenuItem>
            {filterOptions?.data?.subcategories.map((subcat) => (
              <MenuItem key={subcat} value={subcat}>{subcat}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Excluido</InputLabel>
          <Select value={filters.exclude} label="Excluido" onChange={handleFilterChange('exclude')}>
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="false">No excluidos</MenuItem>
            <MenuItem value="true">Excluidos</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Promo</InputLabel>
          <Select value={filters.promo} label="Promo" onChange={handleFilterChange('promo')}>
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="true">Solo Promos</MenuItem>
            <MenuItem value="false">Sin Promos</MenuItem>
          </Select>
        </FormControl>

        {hasFilters && (
          <Button size="small" onClick={handleClearFilters} sx={{ textTransform: 'none' }}>
            Limpiar
          </Button>
        )}
      </FiltersCard>

      {/* KPIs */}
      <KPICards
        loading={isLoadingSales}
        items={[
          {
            title: 'Ventas Totales',
            value: totalSales,
            format: 'currency',
            icon: <AttachMoneyIcon sx={{ fontSize: 18 }} />,
            color: '#003399',
          },
          {
            title: 'Unidades Vendidas',
            value: totalUnits,
            format: 'number',
            icon: <InventoryIcon sx={{ fontSize: 18 }} />,
            color: '#0052CC',
          },
          {
            title: 'Transacciones',
            value: totalTransactions,
            format: 'number',
            icon: <ReceiptIcon sx={{ fontSize: 18 }} />,
            color: '#4CAF50',
          },
          {
            title: 'Ticket Promedio',
            value: avgTicket,
            format: 'currency',
            icon: <TrendingUpIcon sx={{ fontSize: 18 }} />,
            color: '#FF9800',
          },
        ]}
      />

      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
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
    </Box>
  );
}
