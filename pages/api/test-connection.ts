import type { NextApiRequest, NextApiResponse } from 'next';
import { BigQueryService, detectTableColumns, TABLES } from '@/lib/bigquery';

interface TestConnectionResponse {
  success: boolean;
  message: string;
  data?: {
    bigqueryConnected: boolean;
    resultsTableColumns?: string[];
    transactionsTableColumns?: string[];
    sampleResults?: unknown[];
    sampleTransactions?: unknown[];
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TestConnectionResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    console.log('🧪 Iniciando test de conexión a BigQuery...');

    // Test 1: Conexión básica
    const isConnected = await BigQueryService.testConnection();
    if (!isConnected) {
      throw new Error('No se pudo conectar a BigQuery');
    }

    // Test 2: Detectar columnas de nesforce_results
    let resultsColumns: string[] = [];
    try {
      resultsColumns = await detectTableColumns('nesforce_results');
    } catch (error) {
      console.warn('⚠️ No se pudieron detectar columnas de nesforce_results:', error);
    }

    // Test 3: Detectar columnas de nestle_transactions
    let transactionsColumns: string[] = [];
    try {
      transactionsColumns = await detectTableColumns('nestle_transactions');
    } catch (error) {
      console.warn('⚠️ No se pudieron detectar columnas de nestle_transactions:', error);
    }

    // Test 4: Query de prueba a nesforce_results
    let sampleResults: unknown[] = [];
    try {
      sampleResults = await BigQueryService.getResults();
    } catch (error) {
      console.warn('⚠️ No se pudieron obtener datos de nesforce_results:', error);
    }

    // Test 5: Query de prueba a nestle_transactions
    let sampleTransactions: unknown[] = [];
    try {
      sampleTransactions = await BigQueryService.getTransactions();
    } catch (error) {
      console.warn('⚠️ No se pudieron obtener datos de nestle_transactions:', error);
    }

    console.log('✅ Test de conexión completado exitosamente');

    return res.status(200).json({
      success: true,
      message: 'Conexión exitosa a BigQuery',
      data: {
        bigqueryConnected: true,
        resultsTableColumns: resultsColumns,
        transactionsTableColumns: transactionsColumns,
        sampleResults: sampleResults.slice(0, 3), // Solo primeras 3 filas
        sampleTransactions: sampleTransactions.slice(0, 3), // Solo primeras 3 filas
      },
    });
  } catch (error) {
    console.error('❌ Error en test de conexión:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al conectar con BigQuery',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
