import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface MonthlySales {
  month: number;
  year: number;
  monthName: string;
  totalSales: number;
  totalUnits: number;
  transactionCount: number;
}

interface MonthlySalesResponse {
  success: boolean;
  data?: MonthlySales[];
  error?: string;
}

const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MonthlySalesResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { distributor } = req.query;

    let whereClause = `WHERE fecha IS NOT NULL AND LENGTH(fecha) >= 8`;
    if (distributor && distributor !== 'all') {
      whereClause += ` AND cod_distribuidor = @distributor`;
    }

    const query = `
      SELECT
        EXTRACT(MONTH FROM SAFE.PARSE_DATE('%d/%m/%Y', fecha)) as month,
        EXTRACT(YEAR FROM SAFE.PARSE_DATE('%d/%m/%Y', fecha)) as year,
        SUM(valor_s_iva) as total_sales,
        SUM(und) as total_units,
        COUNT(*) as transaction_count
      FROM ${TABLES.TRANSACTIONS}
      ${whereClause}
      GROUP BY year, month
      HAVING month IS NOT NULL AND year IS NOT NULL
      ORDER BY year, month
    `;

    const params = distributor && distributor !== 'all' ? { distributor } : undefined;
    const rows = await executeQuery(query, params);

    const monthlyData: MonthlySales[] = rows.map((row: any) => ({
      month: Number(row.month),
      year: Number(row.year),
      monthName: MONTH_NAMES[Number(row.month) - 1] || `Mes ${row.month}`,
      totalSales: Math.round(Number(row.total_sales) || 0),
      totalUnits: Math.round(Number(row.total_units) || 0),
      transactionCount: Number(row.transaction_count) || 0,
    }));

    return res.status(200).json({
      success: true,
      data: monthlyData,
    });
  } catch (error) {
    console.error('Error fetching transactions monthly:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
