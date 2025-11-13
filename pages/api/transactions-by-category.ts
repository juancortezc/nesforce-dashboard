import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface CategorySales {
  category: string;
  totalSales: number;
  totalUnits: number;
  transactionCount: number;
}

interface CategorySalesResponse {
  success: boolean;
  data?: CategorySales[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CategorySalesResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { distributor, month, year } = req.query;

    let whereClause = 'WHERE sku_categoria_name IS NOT NULL';

    if (distributor && distributor !== 'all') {
      whereClause += ` AND cod_distribuidor = @distributor`;
    }

    if (month && month !== 'all') {
      whereClause += ` AND EXTRACT(MONTH FROM SAFE.PARSE_DATE('%d/%m/%Y', fecha)) = @month`;
    }

    if (year && year !== 'all') {
      whereClause += ` AND EXTRACT(YEAR FROM SAFE.PARSE_DATE('%d/%m/%Y', fecha)) = @year`;
    }

    const query = `
      SELECT
        sku_categoria_name as category,
        SUM(valor_s_iva) as total_sales,
        SUM(und) as total_units,
        COUNT(*) as transaction_count
      FROM ${TABLES.TRANSACTIONS}
      ${whereClause}
      GROUP BY category
      ORDER BY total_units DESC
      LIMIT 20
    `;

    const params: any = {};
    if (distributor && distributor !== 'all') params.distributor = distributor;
    if (month && month !== 'all') params.month = parseInt(month as string);
    if (year && year !== 'all') params.year = parseInt(year as string);

    const rows = await executeQuery(query, Object.keys(params).length > 0 ? params : undefined);

    const categoryData: CategorySales[] = rows.map((row: any) => ({
      category: row.category || 'Sin categoría',
      totalSales: Math.round(Number(row.total_sales) || 0),
      totalUnits: Math.round(Number(row.total_units) || 0),
      transactionCount: Number(row.transaction_count) || 0,
    }));

    return res.status(200).json({
      success: true,
      data: categoryData,
    });
  } catch (error) {
    console.error('Error fetching transactions by category:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
