import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface ResultsApiResponse {
  success: boolean;
  data?: {
    results: unknown[];
    count: number;
  };
  error?: string;
}

/**
 * API endpoint para obtener datos de nesforce_results
 * GET /api/results
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResultsApiResponse>
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
      FROM ${TABLES.RESULTS}
      LIMIT @limit
    `;

    const results = await executeQuery(query, { limit });

    return res.status(200).json({
      success: true,
      data: {
        results,
        count: results.length,
      },
    });
  } catch (error) {
    console.error('Error fetching results:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
