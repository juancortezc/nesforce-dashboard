import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface DistributorSales {
  distributorCode: string;
  distributorName: string;
  totalSales: number;
  totalUnits: number;
  transactionCount: number;
}

interface DistributorSalesResponse {
  success: boolean;
  data?: DistributorSales[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DistributorSalesResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { month, year, fromMonth, fromYear, toMonth, toYear } = req.query;

    let whereClause = 'WHERE cod_distribuidor IS NOT NULL';
    const params: any = {};

    // Filtro por rango de fechas del Header
    if (fromMonth && fromYear && toMonth && toYear) {
      const startDate = `${fromYear}-${String(fromMonth).padStart(2, '0')}-01`;
      const endYear = parseInt(toYear as string);
      const endMonth = parseInt(toMonth as string);
      const lastDay = new Date(endYear, endMonth, 0).getDate();
      const endDate = `${toYear}-${String(toMonth).padStart(2, '0')}-${lastDay}`;

      whereClause += ` AND SAFE.PARSE_DATE('%d/%m/%Y', fecha) >= @startDate`;
      whereClause += ` AND SAFE.PARSE_DATE('%d/%m/%Y', fecha) <= @endDate`;
      params.startDate = startDate;
      params.endDate = endDate;
    }

    if (month && month !== 'all') {
      whereClause += ` AND EXTRACT(MONTH FROM SAFE.PARSE_DATE('%d/%m/%Y', fecha)) = @month`;
    }

    if (year && year !== 'all') {
      whereClause += ` AND EXTRACT(YEAR FROM SAFE.PARSE_DATE('%d/%m/%Y', fecha)) = @year`;
    }

    const query = `
      SELECT
        cod_distribuidor as distributor_code,
        distribuidor as distributor_name,
        SUM(valor_s_iva) as total_sales,
        SUM(und) as total_units,
        COUNT(*) as transaction_count
      FROM ${TABLES.TRANSACTIONS}
      ${whereClause}
      GROUP BY distributor_code, distributor_name
      ORDER BY total_sales DESC
      LIMIT 20
    `;

    if (month && month !== 'all') params.month = parseInt(month as string);
    if (year && year !== 'all') params.year = parseInt(year as string);

    const rows = await executeQuery(query, Object.keys(params).length > 0 ? params : undefined);

    const distributorData: DistributorSales[] = rows.map((row: any) => ({
      distributorCode: row.distributor_code || '',
      distributorName: row.distributor_name || 'Sin nombre',
      totalSales: Math.round(Number(row.total_sales) || 0),
      totalUnits: Math.round(Number(row.total_units) || 0),
      transactionCount: Number(row.transaction_count) || 0,
    }));

    return res.status(200).json({
      success: true,
      data: distributorData,
    });
  } catch (error) {
    console.error('Error fetching transactions by distributor:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
