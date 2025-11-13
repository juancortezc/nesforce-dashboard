import Head from 'next/head';
import { useState } from 'react';
import useSWR from 'swr';
import { Container, Box, CircularProgress, Alert } from '@mui/material';
import Header from '@/components/Header';
import SchemaTable from '@/components/SchemaTable';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface SchemaColumn {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

interface SchemasData {
  success: boolean;
  data?: {
    results: SchemaColumn[];
    transactions: SchemaColumn[];
  };
  error?: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const { data, error, isLoading } = useSWR<SchemasData>('/api/schemas', fetcher);

  return (
    <>
      <Head>
        <title>Nesforce Dashboard</title>
        <meta name="description" content="Nesforce Analytics Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Header activeTab={activeTab} onTabChange={setActiveTab} />

        <Container maxWidth="xl" sx={{ py: 3 }}>
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

          {data?.success && data.data && (
            <>
              {activeTab === 0 && (
                <SchemaTable
                  columns={data.data.results}
                  title="Results Schema"
                />
              )}
              {activeTab === 1 && (
                <SchemaTable
                  columns={data.data.transactions}
                  title="Transactions Schema"
                />
              )}
            </>
          )}

          {data && !data.success && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {data.error || 'Failed to load schemas'}
            </Alert>
          )}
        </Container>
      </Box>
    </>
  );
}
