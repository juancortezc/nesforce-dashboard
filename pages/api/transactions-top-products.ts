import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface ProductSales {
  product: string;
  codSap: string;
  totalSales: number;
  totalUnits: number;
  transactionCount: number;
}

interface ProductSalesResponse {
  success: boolean;
  data?: ProductSales[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProductSalesResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { distributor, month, year, category, limit = '20' } = req.query;

    let whereClause = 'WHERE sku_name IS NOT NULL';

    if (distributor && distributor !== 'all') {
      whereClause += ` AND cod_distribuidor = @distributor`;
    }

    if (month && month !== 'all') {
      whereClause += ` AND EXTRACT(MONTH FROM SAFE.PARSE_DATE('%d/%m/%Y', fecha)) = @month`;
    }

    if (year && year !== 'all') {
      whereClause += ` AND EXTRACT(YEAR FROM SAFE.PARSE_DATE('%d/%m/%Y', fecha)) = @year`;
    }

    if (category && category !== 'all') {
      whereClause += ` AND sku_categoria_name = @category`;
    }

    const query = `
      SELECT
        sku_name as product,
        cod_sap,
        SUM(valor_s_iva) as total_sales,
        SUM(und) as total_units,
        COUNT(*) as transaction_count
      FROM ${TABLES.TRANSACTIONS}
      ${whereClause}
      GROUP BY product, cod_sap
      ORDER BY total_units DESC
      LIMIT @limit
    `;

    const params: any = { limit: parseInt(limit as string) };
    if (distributor && distributor !== 'all') params.distributor = distributor;
    if (month && month !== 'all') params.month = parseInt(month as string);
    if (year && year !== 'all') params.year = parseInt(year as string);
    if (category && category !== 'all') params.category = category;

    const rows = await executeQuery(query, params);

    const productData: ProductSales[] = rows.map((row: any) => ({
      product: row.product || 'Sin nombre',
      codSap: row.cod_sap || '',
      totalSales: Math.round(Number(row.total_sales) || 0),
      totalUnits: Math.round(Number(row.total_units) || 0),
      transactionCount: Number(row.transaction_count) || 0,
    }));

    return res.status(200).json({
      success: true,
      data: productData,
    });
  } catch (error) {
    console.error('Error fetching top products:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
