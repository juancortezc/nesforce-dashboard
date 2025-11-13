import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const categoriesQuery = `
      SELECT DISTINCT award_categories
      FROM ${TABLES.NESTJS_REQUESTS}
      WHERE participant_program_id = 28 AND award_categories IS NOT NULL
      ORDER BY award_categories
    `;

    const segmentsQuery = `
      SELECT DISTINCT participant_segment_name
      FROM ${TABLES.NESTJS_REQUESTS}
      WHERE participant_program_id = 28 AND participant_segment_name IS NOT NULL
      ORDER BY participant_segment_name
    `;

    const [categoriesRows, segmentsRows] = await Promise.all([
      executeQuery(categoriesQuery),
      executeQuery(segmentsQuery),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        categories: categoriesRows.map((row: any) => row.award_categories),
        segments: segmentsRows.map((row: any) => row.participant_segment_name),
      },
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
