import { useState, useMemo } from 'react';
import { Box, FormControl, Select, MenuItem, InputLabel, Button, SelectChangeEvent, Grid } from '@mui/material';
import useSWR from 'swr';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import StarsIcon from '@mui/icons-material/Stars';
import PeopleIcon from '@mui/icons-material/People';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import TopAwardsCard from './TopAwardsCard';
import TopParticipantsRedemptionCard from './TopParticipantsRedemptionCard';
import CategoryAnalysisCard from './CategoryAnalysisCard';
import { PageHeader } from './PageHeader';
import { FiltersCard } from './FiltersCard';
import { KPICards } from './KPICards';
import { DateRange } from './Header';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const MONTHS = ['Todos', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const YEARS = ['Todos', '2024', '2025'];

interface SummaryData {
  totalRedemptions: number;
  totalPoints: number;
  totalParticipants: number;
  totalAwards: number;
}

interface Program28PageProps {
  currentIndex?: number;
  totalPages?: number;
  onPrevious?: () => void;
  onNext?: () => void;
  dateRange?: DateRange;
}

export default function Program28Page({ currentIndex = 3, totalPages = 5, onPrevious, onNext, dateRange }: Program28PageProps) {
  const [filters, setFilters] = useState({
    region: '',
    month: 'all',
    year: 'all',
    category: 'all',
    segment: 'all',
  });

  const { data: filterOptions } = useSWR<{ success: boolean; data?: { regions: string[]; categories: string[]; segments: string[] } }>(
    '/api/program28-filter-options',
    fetcher
  );

  const regions = filterOptions?.data?.regions || [];
  const categories = filterOptions?.data?.categories || [];
  const segments = filterOptions?.data?.segments || [];

  const kpiQueryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.month !== 'all') params.append('month', filters.month);
    if (filters.year !== 'all') params.append('year', filters.year);
    if (filters.region) params.append('region', filters.region);
    if (filters.category !== 'all') params.append('category', filters.category);
    if (filters.segment !== 'all') params.append('segment', filters.segment);
    return params.toString();
  }, [filters]);

  const { data: summaryData, isLoading: isLoadingSummary } = useSWR<{ success: boolean; data?: SummaryData }>(
    `/api/program28-summary${kpiQueryString ? `?${kpiQueryString}` : ''}`,
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
      region: '',
      month: 'all',
      year: 'all',
      category: 'all',
      segment: 'all',
    });
  };

  const hasFilters = filters.region !== '' || filters.month !== 'all' || filters.year !== 'all' || filters.category !== 'all' || filters.segment !== 'all';

  return (
    <Box>
      <PageHeader
        title="Solicitudes (Programa 28)"
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

        <FormControl size="small" sx={{ minWidth: 80 }}>
          <InputLabel>Año</InputLabel>
          <Select value={filters.year} label="Año" onChange={handleFilterChange('year')}>
            {YEARS.map((y) => (
              <MenuItem key={y} value={y === 'Todos' ? 'all' : y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Categoría</InputLabel>
          <Select value={filters.category} label="Categoría" onChange={handleFilterChange('category')}>
            <MenuItem value="all">Todas</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Región</InputLabel>
          <Select value={filters.region} label="Región" onChange={handleFilterChange('region')}>
            <MenuItem value="">Todas</MenuItem>
            {regions.map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Segmento</InputLabel>
          <Select value={filters.segment} label="Segmento" onChange={handleFilterChange('segment')}>
            <MenuItem value="all">Todos</MenuItem>
            {segments.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
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
        loading={isLoadingSummary}
        items={[
          {
            title: 'Total Canjes',
            value: summaryData?.data?.totalRedemptions || 0,
            format: 'number',
            icon: <ReceiptLongIcon sx={{ fontSize: 18 }} />,
            color: '#003399',
          },
          {
            title: 'Puntos Canjeados',
            value: summaryData?.data?.totalPoints || 0,
            format: 'number',
            icon: <StarsIcon sx={{ fontSize: 18 }} />,
            color: '#0052CC',
          },
          {
            title: 'Participantes',
            value: summaryData?.data?.totalParticipants || 0,
            format: 'number',
            icon: <PeopleIcon sx={{ fontSize: 18 }} />,
            color: '#4CAF50',
          },
          {
            title: 'Premios Únicos',
            value: summaryData?.data?.totalAwards || 0,
            format: 'number',
            icon: <CardGiftcardIcon sx={{ fontSize: 18 }} />,
            color: '#FF9800',
          },
        ]}
      />

      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        <Grid item xs={12}>
          <TopAwardsCard month={filters.month} year={filters.year} region={filters.region} category={filters.category} segment={filters.segment} />
        </Grid>
        <Grid item xs={12}>
          <TopParticipantsRedemptionCard month={filters.month} year={filters.year} region={filters.region} category={filters.category} segment={filters.segment} />
        </Grid>
        <Grid item xs={12}>
          <CategoryAnalysisCard month={filters.month} year={filters.year} region={filters.region} category={filters.category} segment={filters.segment} />
        </Grid>
      </Grid>
    </Box>
  );
}
