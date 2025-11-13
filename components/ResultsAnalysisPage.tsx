import { useState } from 'react';
import { Box, Container, FormControl, Select, MenuItem, Typography, Paper } from '@mui/material';
import useSWR from 'swr';
import TopParticipantsCard from './TopParticipantsCard';
import KPIPerformanceCard from './KPIPerformanceCard';
import SegmentComparisonCard from './SegmentComparisonCard';
import GroupPerformanceCard from './GroupPerformanceCard';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const MONTHS = ['Todos', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const YEARS = ['Todos', '2024', '2025'];

export default function ResultsAnalysisPage() {
  const [month, setMonth] = useState('all');
  const [year, setYear] = useState('all');
  const [segment, setSegment] = useState('all');
  const [group, setGroup] = useState('all');
  const [position, setPosition] = useState('all');

  const { data: filterOptions } = useSWR<{ success: boolean; data?: { segments: string[]; groups: string[]; positions: string[] } }>(
    '/api/results-filter-options',
    fetcher
  );

  const segments = filterOptions?.data?.segments || [];
  const groups = filterOptions?.data?.groups || [];
  const positions = filterOptions?.data?.positions || [];

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
          <Select value={segment} onChange={(e) => setSegment(e.target.value)} sx={{ borderRadius: '20px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' } }}>
            <MenuItem value="all">Todos los Segmentos</MenuItem>
            {segments.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select value={group} onChange={(e) => setGroup(e.target.value)} sx={{ borderRadius: '20px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' } }}>
            <MenuItem value="all">Todos los Grupos</MenuItem>
            {groups.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select value={position} onChange={(e) => setPosition(e.target.value)} sx={{ borderRadius: '20px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' } }}>
            <MenuItem value="all">Todas las Posiciones</MenuItem>
            {positions.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </Select>
        </FormControl>
      </Paper>

      <TopParticipantsCard month={month} year={year} segment={segment} group={group} position={position} />
      <KPIPerformanceCard month={month} year={year} segment={segment} group={group} position={position} />
      <SegmentComparisonCard month={month} year={year} group={group} position={position} />
      <GroupPerformanceCard month={month} year={year} segment={segment} position={position} />
    </Container>
  );
}
