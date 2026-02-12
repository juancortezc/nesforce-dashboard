import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '@/lib/bigquery';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const query = `
      SELECT table_name
      FROM \`lala4-377416.nesforce.INFORMATION_SCHEMA.TABLES\`
      ORDER BY table_name
    `;

    const rows = await executeQuery(query);

    return res.status(200).json({
      success: true,
      data: rows.map((row: any) => row.table_name),
    });
  } catch (error) {
    console.error('Error listing tables:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
