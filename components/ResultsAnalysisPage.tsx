import { useState, useEffect, useMemo } from 'react';
import { Box, FormControl, Select, MenuItem, Typography, Grid, InputLabel, Button } from '@mui/material';
import useSWR from 'swr';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TopParticipantsCard from './TopParticipantsCard';
import KPIPerformanceCard from './KPIPerformanceCard';
import SegmentComparisonCard from './SegmentComparisonCard';
import GroupPerformanceCard from './GroupPerformanceCard';
import SellOutPerformanceCard from './SellOutPerformanceCard';
import { PageHeader } from './PageHeader';
import { FiltersCard } from './FiltersCard';
import { KPICards } from './KPICards';
import { DateRange } from './Header';
import { resultsAnalysisPageInfo } from '@/config/pageInfoConfigs';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const MONTHS = ['Todos', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const YEARS = ['Todos', '2024', '2025'];

interface TopParticipant {
  participantId: number;
  participantName: string;
  groupName: string;
  totalPoints: number;
  achievementRate: number;
  kpiCount: number;
}

interface ResultsAnalysisPageProps {
  currentIndex?: number;
  totalPages?: number;
  onPrevious?: () => void;
  onNext?: () => void;
  dateRange?: DateRange;
}

export default function ResultsAnalysisPage({ currentIndex = 2, totalPages = 5, onPrevious, onNext, dateRange }: ResultsAnalysisPageProps) {
  const [month, setMonth] = useState('all');
  const [year, setYear] = useState('all');
  const [region, setRegion] = useState('all');
  const [segment, setSegment] = useState('all');
  const [group, setGroup] = useState('all');
  const [position, setPosition] = useState('');
  const [route, setRoute] = useState('all');
  const [kpi, setKpi] = useState('all');

  const buildFilterOptionsUrl = () => {
    const params = new URLSearchParams();
    if (region && region !== 'all') params.append('region', region);
    if (segment && segment !== 'all') params.append('segment', segment);
    const queryString = params.toString();
    return queryString ? `/api/results-filter-options?${queryString}` : '/api/results-filter-options';
  };

  const { data: filterOptions } = useSWR<{ success: boolean; data?: { regions: string[]; segments: string[]; groups: string[]; positions: string[]; routes: string[]; kpis: string[] } }>(
    buildFilterOptionsUrl(),
    fetcher
  );

  const regions = filterOptions?.data?.regions || [];
  const segments = filterOptions?.data?.segments || [];
  const groups = filterOptions?.data?.groups || [];
  const positions = filterOptions?.data?.positions || [];
  const routes = filterOptions?.data?.routes || [];
  const kpis = filterOptions?.data?.kpis || [];

  const kpiQueryString = useMemo(() => {
    const params = new URLSearchParams();
    if (month !== 'all') params.append('month', month);
    if (year !== 'all') params.append('year', year);
    if (region !== 'all') params.append('region', region);
    if (segment !== 'all') params.append('segment', segment);
    if (group !== 'all') params.append('group', group);
    if (position) params.append('position', position);
    if (route !== 'all') params.append('route', route);
    if (kpi !== 'all') params.append('kpi', kpi);
    return params.toString();
  }, [month, year, region, segment, group, position, route, kpi]);

  const { data: topParticipantsData, isLoading: isLoadingTop } = useSWR<{
    success: boolean;
    data?: TopParticipant[];
    totalCount?: number;
    totalPoints?: number;
    avgAchievement?: number;
    latestPeriod?: string;
  }>(
    position ? `/api/results-top-participants${kpiQueryString ? `?${kpiQueryString}` : ''}` : null,
    fetcher
  );

  const totalParticipants = topParticipantsData?.totalCount || 0;
  const avgAchievement = topParticipantsData?.avgAchievement || 0;
  const totalPoints = topParticipantsData?.totalPoints || 0;
  const topPerformer = topParticipantsData?.data?.[0];

  useEffect(() => {
    if (positions.length > 0 && !position) {
      const vendedor = positions.find(p => p.toLowerCase().includes('vendedor'));
      setPosition(vendedor || positions[0]);
    }
  }, [positions, position]);

  const handleClearFilters = () => {
    const vendedor = positions.find(p => p.toLowerCase().includes('vendedor'));
    setMonth('all');
    setYear('all');
    setRegion('all');
    setSegment('all');
    setGroup('all');
    setPosition(vendedor || positions[0] || '');
    setRoute('all');
    setKpi('all');
  };

  const hasFilters = month !== 'all' || year !== 'all' || region !== 'all' || segment !== 'all' || group !== 'all' || route !== 'all' || kpi !== 'all';

  return (
    <Box>
      <PageHeader
        title="Análisis de Resultados"
        currentIndex={currentIndex}
        totalPages={totalPages}
        onPrevious={onPrevious}
        onNext={onNext}
        pageInfo={resultsAnalysisPageInfo}
      />

      <FiltersCard>
        <FormControl size="small" sx={{ minWidth: 90 }}>
          <InputLabel>Mes</InputLabel>
          <Select value={month} label="Mes" onChange={(e) => setMonth(e.target.value)}>
            {MONTHS.map((m, i) => (
              <MenuItem key={i} value={i === 0 ? 'all' : i.toString()}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 80 }}>
          <InputLabel>Año</InputLabel>
          <Select value={year} label="Año" onChange={(e) => setYear(e.target.value)}>
            {YEARS.map((y) => (
              <MenuItem key={y} value={y === 'Todos' ? 'all' : y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Región</InputLabel>
          <Select
            value={region}
            label="Región"
            onChange={(e) => {
              setRegion(e.target.value);
              setSegment('all');
              setGroup('all');
            }}
          >
            <MenuItem value="all">Todas</MenuItem>
            {regions.map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Segmento</InputLabel>
          <Select
            value={segment}
            label="Segmento"
            onChange={(e) => {
              setSegment(e.target.value);
              setGroup('all');
            }}
          >
            <MenuItem value="all">Todos</MenuItem>
            {segments.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Distribuidor</InputLabel>
          <Select value={group} label="Distribuidor" onChange={(e) => setGroup(e.target.value)}>
            <MenuItem value="all">Todos</MenuItem>
            {groups.map((g) => (
              <MenuItem key={g} value={g}>{g}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 110 }} required>
          <InputLabel>Cargo *</InputLabel>
          <Select value={position} label="Cargo *" onChange={(e) => setPosition(e.target.value)}>
            {positions.map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 90 }}>
          <InputLabel>Ruta</InputLabel>
          <Select value={route} label="Ruta" onChange={(e) => setRoute(e.target.value)}>
            <MenuItem value="all">Todas</MenuItem>
            {routes.map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 90 }}>
          <InputLabel>KPI</InputLabel>
          <Select value={kpi} label="KPI" onChange={(e) => setKpi(e.target.value)}>
            <MenuItem value="all">Todos</MenuItem>
            {kpis.map((k) => (
              <MenuItem key={k} value={k}>{k}</MenuItem>
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
        loading={isLoadingTop}
        items={[
          {
            title: 'Participantes',
            value: totalParticipants,
            format: 'number',
            icon: <PeopleIcon sx={{ fontSize: 18 }} />,
            color: '#003399',
          },
          {
            title: '% Logro Promedio',
            value: avgAchievement,
            format: 'percent',
            icon: <TrendingUpIcon sx={{ fontSize: 18 }} />,
            color: '#4CAF50',
          },
          {
            title: 'Puntos Totales',
            value: totalPoints,
            format: 'number',
            icon: <AssessmentIcon sx={{ fontSize: 18 }} />,
            color: '#0052CC',
          },
          {
            title: 'Top Performer',
            value: topPerformer?.participantName || '-',
            icon: <EmojiEventsIcon sx={{ fontSize: 18 }} />,
            color: '#FF9800',
            changeLabel: topPerformer ? `${topPerformer.achievementRate.toFixed(1)}% logro` : undefined,
          },
        ]}
      />

      <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'text.secondary', fontStyle: 'italic' }}>
        * El filtro de Cargo es obligatorio. Los supervisores suman los resultados de sus vendedores.
        {topParticipantsData?.latestPeriod && (
          <> — Datos completos hasta: <strong>{topParticipantsData.latestPeriod}</strong></>
        )}
      </Typography>

      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        <Grid item xs={12}>
          <TopParticipantsCard month={month} year={year} region={region} segment={segment} group={group} position={position} route={route} kpi={kpi} />
        </Grid>

        <Grid item xs={12} md={6}>
          <KPIPerformanceCard month={month} year={year} region={region} segment={segment} group={group} position={position} route={route} kpi={kpi} />
        </Grid>

        <Grid item xs={12} md={6}>
          <SegmentComparisonCard month={month} year={year} region={region} group={group} position={position} route={route} kpi={kpi} />
        </Grid>

        <Grid item xs={12}>
          <GroupPerformanceCard month={month} year={year} region={region} segment={segment} position={position} route={route} kpi={kpi} />
        </Grid>

        <Grid item xs={12}>
          <SellOutPerformanceCard month={month} year={year} region={region} segment={segment} position={position} />
        </Grid>
      </Grid>
    </Box>
  );
}
