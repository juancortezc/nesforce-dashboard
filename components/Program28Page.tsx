import { useState } from 'react';
import { Box, Container, FormControl, Select, MenuItem, Typography, Paper } from '@mui/material';
import useSWR from 'swr';
import Program28SummaryCard from './Program28SummaryCard';
import TopAwardsCard from './TopAwardsCard';
import TopParticipantsRedemptionCard from './TopParticipantsRedemptionCard';
import CategoryAnalysisCard from './CategoryAnalysisCard';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const MONTHS = ['Todos', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const YEARS = ['Todos', '2024', '2025'];

export default function Program28Page() {
  const [month, setMonth] = useState('all');
  const [year, setYear] = useState('all');
  const [category, setCategory] = useState('all');
  const [segment, setSegment] = useState('all');

  const { data: filterOptions } = useSWR<{ success: boolean; data?: { categories: string[]; segments: string[] } }>(
    '/api/program28-filter-options',
    fetcher
  );

  const categories = filterOptions?.data?.categories || [];
  const segments = filterOptions?.data?.segments || [];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#757575', minWidth: 80 }}>Filtros:</Typography>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select value={month} onChange={(e) => setMonth(e.target.value)} sx={{ borderRadius: '20px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' } }}>
            {MONTHS.map((m, i) => <MenuItem key={i} value={i === 0 ? 'all' : i.toString()}>{m}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select value={year} onChange={(e) => setYear(e.target.value)} sx={{ borderRadius: '20px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' } }}>
            {YEARS.map((y) => <MenuItem key={y} value={y === 'Todos' ? 'all' : y}>{y}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select value={category} onChange={(e) => setCategory(e.target.value)} sx={{ borderRadius: '20px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' } }}>
            <MenuItem value="all">Todas las Categorías</MenuItem>
            {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select value={segment} onChange={(e) => setSegment(e.target.value)} sx={{ borderRadius: '20px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' } }}>
            <MenuItem value="all">Todos los Segmentos</MenuItem>
            {segments.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Paper>

      <Program28SummaryCard month={month} year={year} category={category} segment={segment} />
      <TopAwardsCard month={month} year={year} category={category} segment={segment} />
      <TopParticipantsRedemptionCard month={month} year={year} category={category} segment={segment} />
      <CategoryAnalysisCard month={month} year={year} category={category} segment={segment} />
    </Container>
  );
}
