import Head from 'next/head';
import { useState } from 'react';
import useSWR from 'swr';
import { Box, CircularProgress, Alert } from '@mui/material';
import Header, { DateRange } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import PointsPage from '@/components/PointsPage';
import TransactionsPage from '@/components/TransactionsPage';
import ResultsAnalysisPage from '@/components/ResultsAnalysisPage';
import Program28Page from '@/components/Program28Page';
import ComparativesPage from '@/components/ComparativesPage';
import LogisticsPage from '@/components/LogisticsPage';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface SchemasData {
  success: boolean;
  error?: string;
}

const PAGE_TITLES = ['Puntos', 'Transacciones', 'Análisis', 'Solicitudes', 'Comparativos', 'Logística'];

// Helper to get default date range (3 months ago to today)
const getDefaultDateRange = (): DateRange => {
  const today = new Date();
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  return {
    fromMonth: threeMonthsAgo.getMonth() + 1,
    fromYear: threeMonthsAgo.getFullYear(),
    toMonth: today.getMonth() + 1,
    toYear: today.getFullYear(),
  };
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange);
  const { data, error, isLoading } = useSWR<SchemasData>('/api/schemas', fetcher);

  const handlePrevious = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  const handleNext = () => {
    if (activeTab < PAGE_TITLES.length - 1) {
      setActiveTab(activeTab + 1);
    }
  };

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };

  return (
    <>
      <Head>
        <title>Nesforce Dashboard</title>
        <meta name="description" content="Nesforce Analytics Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header
          dateRange={activeTab === 0 || activeTab === 1 ? dateRange : undefined}
          onDateRangeChange={activeTab === 0 || activeTab === 1 ? handleDateRangeChange : undefined}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
          }}
        >
          <Box
            sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              flexGrow: 1,
              pb: { xs: 2, sm: 2 },
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                Error loading schemas. Please try again.
              </Alert>
            )}

            {activeTab === 0 && (
              <PointsPage
                currentIndex={activeTab}
                totalPages={PAGE_TITLES.length}
                onPrevious={handlePrevious}
                onNext={handleNext}
                dateRange={dateRange}
              />
            )}

            {activeTab === 1 && (
              <TransactionsPage
                currentIndex={activeTab}
                totalPages={PAGE_TITLES.length}
                onPrevious={handlePrevious}
                onNext={handleNext}
                dateRange={dateRange}
              />
            )}

            {activeTab === 2 && (
              <ResultsAnalysisPage
                currentIndex={activeTab}
                totalPages={PAGE_TITLES.length}
                onPrevious={handlePrevious}
                onNext={handleNext}
                dateRange={dateRange}
              />
            )}

            {activeTab === 3 && (
              <Program28Page
                currentIndex={activeTab}
                totalPages={PAGE_TITLES.length}
                onPrevious={handlePrevious}
                onNext={handleNext}
                dateRange={dateRange}
              />
            )}

            {activeTab === 4 && (
              <ComparativesPage
                currentIndex={activeTab}
                totalPages={PAGE_TITLES.length}
                onPrevious={handlePrevious}
                onNext={handleNext}
                dateRange={dateRange}
              />
            )}

            {activeTab === 5 && (
              <LogisticsPage
                currentIndex={activeTab}
                totalPages={PAGE_TITLES.length}
                onPrevious={handlePrevious}
                onNext={handleNext}
                dateRange={dateRange}
              />
            )}

            {data && !data.success && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {data.error || 'Failed to load schemas'}
              </Alert>
            )}
          </Box>
        </Box>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </Box>
    </>
  );
}
