import type { NextApiRequest, NextApiResponse } from 'next';
import { getBigQueryClient } from '@/lib/bigquery';

interface FilterOptionsResponse {
  success: boolean;
  data?: {
    segments: string[];
    distributors: string[];
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FilterOptionsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const client = getBigQueryClient();

    const query = `
      SELECT
        ARRAY_AGG(DISTINCT segmento IGNORE NULLS ORDER BY segmento) as segments,
        ARRAY_AGG(DISTINCT distribuidora IGNORE NULLS ORDER BY distribuidora) as distributors
      FROM \`lala4-377416.nesforce.requests_nesforce\`
      WHERE segmento IS NOT NULL OR distribuidora IS NOT NULL
    `;

    const [rows] = await client.query({ query });
    const result = rows[0] || { segments: [], distributors: [] };

    return res.status(200).json({
      success: true,
      data: {
        segments: result.segments || [],
        distributors: result.distributors || [],
      },
    });
  } catch (error) {
    console.error('Error fetching logistics filter options:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
