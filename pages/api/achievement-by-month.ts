import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface MonthlyAchievement {
  month: number;
  year: number;
  monthName: string;
  avgAchievementRate: number;
  totalParticipants: number;
}

interface AchievementByMonthResponse {
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
  res: NextApiResponse<AchievementByMonthResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { region, segment, group, position, route, kpi } = req.query;

    // Build WHERE conditions
    const conditions: string[] = [
      'result_month IS NOT NULL',
      'result_year IS NOT NULL',
      'target IS NOT NULL',
      'achieved IS NOT NULL'
    ];
    if (segment) conditions.push(`segment_name = '${segment}'`);
    if (group) conditions.push(`group_name = '${group}'`);
    if (position) conditions.push(`position_name = '${position}'`);
    if (route) conditions.push(`route_code = '${route}'`);
    if (kpi) conditions.push(`kpi_name = '${kpi}'`);

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const query = `
      SELECT
        result_month as month,
        result_year as year,
        SAFE_DIVIDE(
          SUM(CAST(achieved AS FLOAT64)),
          SUM(CAST(target AS FLOAT64))
        ) * 100 as avg_achievement_rate,
        COUNT(DISTINCT participant_id) as total_participants
      FROM ${TABLES.RESULTS}
      ${whereClause}
      GROUP BY result_year, result_month
      ORDER BY result_year, result_month
    `;

    const rows = await executeQuery(query);

    const monthlyData: MonthlyAchievement[] = rows.map((row: any) => ({
      month: Number(row.month),
      year: Number(row.year),
      monthName: MONTH_NAMES[Number(row.month) - 1] || `Mes ${row.month}`,
      avgAchievementRate: Math.round((Number(row.avg_achievement_rate) || 0) * 10) / 10,
      totalParticipants: Number(row.total_participants) || 0,
    }));

    return res.status(200).json({
      success: true,
      data: monthlyData,
    });
  } catch (error) {
    console.error('Error fetching achievement by month:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
