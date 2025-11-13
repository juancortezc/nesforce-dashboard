import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface SchemaColumn {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

interface SchemaResponse {
  success: boolean;
  data?: SchemaColumn[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SchemaResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const query = `
      SELECT
        column_name,
        data_type,
        is_nullable
      FROM \`lala4-377416.lala4.INFORMATION_SCHEMA.COLUMNS\`
      WHERE table_name = 'nestjsRequests'
      ORDER BY ordinal_position
    `;

    const rows = await executeQuery(query);

    const columns: SchemaColumn[] = rows.map((row: any) => ({
      column_name: row.column_name,
      data_type: row.data_type,
      is_nullable: row.is_nullable,
    }));

    return res.status(200).json({
      success: true,
      data: columns,
    });
  } catch (error) {
    console.error('Error fetching nestjsRequest schema:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
