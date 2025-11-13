import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface Distributor {
  code: string;
  name: string;
}

interface DistributorsListResponse {
  success: boolean;
  data?: Distributor[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DistributorsListResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const query = `
      SELECT DISTINCT
        cod_distribuidor as code,
        distribuidor as name
      FROM ${TABLES.TRANSACTIONS}
      WHERE cod_distribuidor IS NOT NULL
        AND distribuidor IS NOT NULL
      ORDER BY name
    `;

    const rows = await executeQuery(query);

    const distributors: Distributor[] = rows.map((row: any) => ({
      code: row.code,
      name: row.name,
    }));

    return res.status(200).json({
      success: true,
      data: distributors,
    });
  } catch (error) {
    console.error('Error fetching distributors list:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
