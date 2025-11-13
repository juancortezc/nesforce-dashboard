import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface TransactionsApiResponse {
  success: boolean;
  data?: {
    transactions: unknown[];
    count: number;
  };
  error?: string;
}

/**
 * API endpoint para obtener datos de nestle_transactions
 * GET /api/transactions
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TransactionsApiResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const limit = req.query.limit ? Number(req.query.limit) : 100;

    const query = `
      SELECT *
      FROM ${TABLES.TRANSACTIONS}
      LIMIT @limit
    `;

    const transactions = await executeQuery(query, { limit });

    return res.status(200).json({
      success: true,
      data: {
        transactions,
        count: transactions.length,
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
