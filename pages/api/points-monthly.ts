import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface MonthlyPoints {
  month: number;
  year: number;
  monthName: string;
  totalPoints: number;
}

interface PointsMonthlyResponse {
  success: boolean;
  data?: MonthlyPoints[];
  error?: string;
}

const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PointsMonthlyResponse>
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
        result_month as month,
        result_year as year,
        SUM(points) as total_points
      FROM ${TABLES.RESULTS}
      GROUP BY result_year, result_month
      ORDER BY result_year, result_month
    `;

    const rows = await executeQuery(query);

    const monthlyData: MonthlyPoints[] = rows.map((row: any) => ({
      month: Number(row.month),
      year: Number(row.year),
      monthName: MONTH_NAMES[Number(row.month) - 1] || `Mes ${row.month}`,
      totalPoints: Math.round(Number(row.total_points) || 0),
    }));

    return res.status(200).json({
      success: true,
      data: monthlyData,
    });
  } catch (error) {
    console.error('Error fetching points monthly:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
