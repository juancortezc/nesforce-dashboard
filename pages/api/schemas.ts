import type { NextApiRequest, NextApiResponse } from 'next';
import { BigQueryService } from '@/lib/bigquery';

interface SchemaColumn {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

interface SchemasResponse {
  success: boolean;
  data?: {
    results: SchemaColumn[];
    transactions: SchemaColumn[];
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SchemasResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const [resultsSchema, transactionsSchema] = await Promise.all([
      BigQueryService.getTableSchema('nesforce_results'),
      BigQueryService.getTableSchema('nestle_transactions'),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        results: resultsSchema as SchemaColumn[],
        transactions: transactionsSchema as SchemaColumn[],
      },
    });
  } catch (error) {
    console.error('Error fetching schemas:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
