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
    const { distributor, categoria, sapCode, subcategoria, exclude, promo, fromMonth, fromYear, toMonth, toYear } = req.query;

    const conditions: string[] = ['fecha IS NOT NULL', 'LENGTH(fecha) >= 8'];
    const params: any = {};

    // Filtro por rango de fechas del Header
    if (fromMonth && fromYear && toMonth && toYear) {
      // Crear fecha de inicio (primer día del mes)
      const startDate = `${fromYear}-${String(fromMonth).padStart(2, '0')}-01`;
      // Crear fecha de fin (último día del mes)
      const endYear = parseInt(toYear as string);
      const endMonth = parseInt(toMonth as string);
      const lastDay = new Date(endYear, endMonth, 0).getDate();
      const endDate = `${toYear}-${String(toMonth).padStart(2, '0')}-${lastDay}`;

      conditions.push('SAFE.PARSE_DATE(\'%d/%m/%Y\', fecha) >= @startDate');
      conditions.push('SAFE.PARSE_DATE(\'%d/%m/%Y\', fecha) <= @endDate');
      params.startDate = startDate;
      params.endDate = endDate;
    }

    if (distributor && distributor !== 'all') {
      conditions.push('cod_distribuidor = @distributor');
      params.distributor = distributor;
    }

    if (categoria && categoria !== 'all') {
      conditions.push('categoria = @categoria');
      params.categoria = categoria;
    }

    if (sapCode && sapCode !== 'all') {
      conditions.push('clean_cod_sap = @sapCode');
      params.sapCode = sapCode;
    }

    if (subcategoria && subcategoria !== 'all') {
      conditions.push('sku_subcategoria_name = @subcategoria');
      params.subcategoria = subcategoria;
    }

    if (exclude === 'true') {
      conditions.push('exclude = true');
    } else if (exclude === 'false') {
      conditions.push('exclude = false');
    }

    if (promo === 'true') {
      conditions.push('is_promo = true');
    } else if (promo === 'false') {
      conditions.push('is_promo = false');
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

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

    const rows = await executeQuery(query, Object.keys(params).length > 0 ? params : undefined);

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
