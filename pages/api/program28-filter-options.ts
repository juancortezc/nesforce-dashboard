import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const distributorsQuery = `
      SELECT DISTINCT distribuidora
      FROM ${TABLES.REQUESTS}
      WHERE distribuidora IS NOT NULL AND LOWER(request_status) != 'cancelado'
      ORDER BY distribuidora
    `;

    const categoriesQuery = `
      SELECT DISTINCT award_categories
      FROM ${TABLES.REQUESTS}
      WHERE award_categories IS NOT NULL AND LOWER(request_status) != 'cancelado'
      ORDER BY award_categories
    `;

    const segmentsQuery = `
      SELECT DISTINCT segmento
      FROM ${TABLES.REQUESTS}
      WHERE segmento IS NOT NULL AND LOWER(request_status) != 'cancelado'
      ORDER BY segmento
    `;

    const [distributorsRows, categoriesRows, segmentsRows] = await Promise.all([
      executeQuery(distributorsQuery),
      executeQuery(categoriesQuery),
      executeQuery(segmentsQuery),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        distributors: distributorsRows.map((row: any) => row.distribuidora),
        categories: categoriesRows.map((row: any) => row.award_categories),
        segments: segmentsRows.map((row: any) => row.segmento),
      },
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
