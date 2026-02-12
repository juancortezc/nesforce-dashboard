import { BigQuery } from '@google-cloud/bigquery';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

let bigqueryClient: BigQuery | null = null;

function createLogger(prefix: string) {
  return {
    info: (...args: unknown[]) => console.log(`[${prefix}]`, ...args),
    error: (...args: unknown[]) => console.error(`[${prefix} ERROR]`, ...args),
    warn: (...args: unknown[]) => console.warn(`[${prefix} WARN]`, ...args),
    debug: (...args: unknown[]) => console.log(`[${prefix} DEBUG]`, ...args),
  };
}

const logger = createLogger('BigQuery');

/**
 * Obtiene o crea el cliente de BigQuery
 * Usa credenciales JSON desde la variable de entorno GOOGLE_APPLICATION_CREDENTIALS
 */
export function getBigQueryClient(): BigQuery {
  if (bigqueryClient) {
    return bigqueryClient;
  }

  logger.info('🔧 Iniciando configuración de BigQuery para Nesforce...');

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS is required for BigQuery');
  }

  try {
    // Parse credentials if they are JSON string
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    logger.info('🔑 Credenciales JSON parseadas correctamente');
    logger.info('👤 Client Email:', credentials.client_email);
    logger.info('🆔 Project ID:', credentials.project_id);

    // Escribir las credenciales a un archivo temporal
    const tempDir = os.tmpdir();
    const credentialsPath = path.join(tempDir, 'gcp-bigquery-nesforce-credentials.json');

    fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));
    logger.info('🔑 Credenciales escritas en archivo temporal:', credentialsPath);

    // Crear cliente de BigQuery con las credenciales
    // IMPORTANTE: El dataset nesforce está en us-central1
    bigqueryClient = new BigQuery({
      keyFilename: credentialsPath,
      projectId: credentials.project_id,
      location: 'us-central1', // Región donde está el dataset nesforce
    });

    logger.info('✅ Cliente BigQuery configurado correctamente para Nesforce');
    return bigqueryClient;

  } catch (error) {
    logger.error('❌ Error configurando BigQuery:', error);
    throw error;
  }
}

// ========================================
// CONSTANTES Y CONFIGURACIÓN
// ========================================

// Proyecto y dataset de BigQuery
export const PROJECT_ID = 'lala4-377416';
export const DATASET_ID = 'nesforce';
export const LOCATION = 'us-central1';

// Tablas principales (migradas a dataset nesforce)
export const TABLES = {
  RESULTS: `\`${PROJECT_ID}.${DATASET_ID}.results_nesforce\``,
  TRANSACTIONS: `\`${PROJECT_ID}.${DATASET_ID}.transactions_nesforce\``,
  REQUESTS: `\`${PROJECT_ID}.${DATASET_ID}.requests_nesforce\``,
  PARTICIPANTS: `\`${PROJECT_ID}.${DATASET_ID}.participants_nesforce\``,
  INFORMATION_SCHEMA: `\`${PROJECT_ID}.${DATASET_ID}.INFORMATION_SCHEMA.COLUMNS\``,
} as const;

// ========================================
// TIPOS E INTERFACES
// ========================================

export interface QueryOptions {
  query: string;
  params?: Record<string, unknown>;
  location?: string;
}

export interface ResultsRow {
  [key: string]: unknown;
}

export interface TransactionsRow {
  [key: string]: unknown;
}

// ========================================
// UTILIDADES DE CONSULTA
// ========================================

/**
 * Ejecuta una query en BigQuery con manejo de errores
 */
export async function executeQuery<T = ResultsRow>(
  query: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  const client = getBigQueryClient();

  try {
    logger.info('🔍 Ejecutando query en BigQuery...');
    logger.debug('Query:', query);
    logger.debug('Params:', params);

    const options: QueryOptions = {
      query,
      location: LOCATION,
    };

    if (params) {
      options.params = params;
    }

    const [rows] = await client.query(options);
    logger.info(`✅ Query ejecutada exitosamente: ${rows.length} filas`);

    return rows as T[];
  } catch (error) {
    logger.error('❌ Error ejecutando query:', error);
    throw error;
  }
}

/**
 * Convierte valor a número o null
 */
export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Convierte valor a string o null
 */
export function toString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return String(value);
}

// ========================================
// DETECCIÓN DE COLUMNAS
// ========================================

/**
 * Detecta las columnas disponibles en una tabla
 */
export async function detectTableColumns(tableName: string): Promise<string[]> {
  const client = getBigQueryClient();

  const query = `
    SELECT column_name
    FROM ${TABLES.INFORMATION_SCHEMA}
    WHERE table_name = @tableName
    ORDER BY ordinal_position
  `;

  try {
    const [rows] = await client.query({
      query,
      params: { tableName },
      location: LOCATION,
    });

    const columns = rows.map((row: { column_name: string }) => row.column_name);
    logger.info(`📋 Columnas detectadas en ${tableName}:`, columns);

    return columns;
  } catch (error) {
    logger.error(`❌ Error detectando columnas de ${tableName}:`, error);
    throw error;
  }
}

// ========================================
// SERVICIOS DE CONSULTA
// ========================================

export const BigQueryService = {
  /**
   * Obtiene datos de results_nesforce
   */
  async getResults(filters?: Record<string, unknown>): Promise<ResultsRow[]> {
    const query = `
      SELECT *
      FROM ${TABLES.RESULTS}
      LIMIT 100
    `;

    return executeQuery<ResultsRow>(query, filters);
  },

  /**
   * Obtiene datos de transactions_nesforce
   */
  async getTransactions(filters?: Record<string, unknown>): Promise<TransactionsRow[]> {
    const query = `
      SELECT *
      FROM ${TABLES.TRANSACTIONS}
      LIMIT 100
    `;

    return executeQuery<TransactionsRow>(query, filters);
  },

  /**
   * Obtiene el esquema de una tabla
   */
  async getTableSchema(tableName: string) {
    const query = `
      SELECT
        column_name,
        data_type,
        is_nullable
      FROM ${TABLES.INFORMATION_SCHEMA}
      WHERE table_name = @tableName
      ORDER BY ordinal_position
    `;

    return executeQuery(query, { tableName });
  },

  /**
   * Test de conexión a BigQuery
   */
  async testConnection(): Promise<boolean> {
    try {
      const query = `SELECT 1 as test`;
      await executeQuery(query);
      logger.info('✅ Conexión a BigQuery exitosa');
      return true;
    } catch (error) {
      logger.error('❌ Error en test de conexión:', error);
      return false;
    }
  },
};
