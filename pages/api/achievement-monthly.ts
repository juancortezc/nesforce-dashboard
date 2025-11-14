import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface MonthlyAchievement {
  month: number;
  year: number;
  monthName: string;
  target: number;
  achieved: number;
  percentage: number;
}

interface AchievementMonthlyResponse {
  success: boolean;
  data?: MonthlyAchievement[];
  error?: string;
}

const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AchievementMonthlyResponse>
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
        SUM(CAST(target AS FLOAT64)) as total_target,
        SUM(CAST(achieved AS FLOAT64)) as total_achieved
      FROM ${TABLES.RESULTS}
      WHERE result_month IS NOT NULL
        AND result_year IS NOT NULL
        AND target IS NOT NULL
        AND achieved IS NOT NULL
       
      GROUP BY result_year, result_month
      ORDER BY result_year, result_month
    `;

    const rows = await executeQuery(query);

    const monthlyData: MonthlyAchievement[] = rows.map((row: any) => {
      const target = Number(row.total_target) || 0;
      const achieved = Number(row.total_achieved) || 0;
      const percentage = target > 0 ? (achieved / target) * 100 : 0;

      return {
        month: Number(row.month),
        year: Number(row.year),
        monthName: MONTH_NAMES[Number(row.month) - 1] || `Mes ${row.month}`,
        target: Math.round(target),
        achieved: Math.round(achieved),
        percentage: Math.round(percentage * 10) / 10,
      };
    });

    return res.status(200).json({
      success: true,
      data: monthlyData,
    });
  } catch (error) {
    console.error('Error fetching achievement monthly:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
