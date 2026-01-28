import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface GroupPerformance {
  groupId: number;
  groupName: string;
  groupCode: string;
  totalPoints: number;
  totalTarget: number;
  totalAchieved: number;
  achievementRate: number;
  participantCount: number;
}

interface GroupPerformanceResponse {
  success: boolean;
  data?: GroupPerformance[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GroupPerformanceResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { region, month, year, segment, position } = req.query;

    // Filtro fijo para Presupuesto (Sell Out)
    let whereClause = `WHERE group_name IS NOT NULL AND UPPER(kpi_name) = 'PRESUPUESTO'`;

    if (region && region !== 'all') {
      whereClause += ` AND group_region = @region`;
    }

    if (month && month !== 'all') {
      whereClause += ` AND result_month = @month`;
    }

    if (year && year !== 'all') {
      whereClause += ` AND result_year = @year`;
    }

    if (segment && segment !== 'all') {
      whereClause += ` AND segment_name = @segment`;
    }

    if (position && position !== 'all') {
      whereClause += ` AND position_name = @position`;
    }

    const query = `
      SELECT
        group_id,
        group_name,
        group_code,
        SUM(points) as total_points,
        SUM(CAST(target AS FLOAT64)) as total_target,
        SUM(CAST(achieved AS FLOAT64)) as total_achieved,
        SAFE_DIVIDE(SUM(CAST(achieved AS FLOAT64)), SUM(CAST(target AS FLOAT64))) * 100 as achievement_rate,
        COUNT(DISTINCT participant_id) as participant_count
      FROM ${TABLES.RESULTS}
      ${whereClause}
      GROUP BY group_id, group_name, group_code
      ORDER BY achievement_rate DESC
      LIMIT 30
    `;

    const params: any = {};
    if (region && region !== 'all') params.region = region;
    if (month && month !== 'all') params.month = parseInt(month as string);
    if (year && year !== 'all') params.year = parseInt(year as string);
    if (segment && segment !== 'all') params.segment = segment;
    if (position && position !== 'all') params.position = position;

    const rows = await executeQuery(query, Object.keys(params).length > 0 ? params : undefined);

    const groupData: GroupPerformance[] = rows.map((row: any) => ({
      groupId: Number(row.group_id),
      groupName: row.group_name || 'Sin nombre',
      groupCode: row.group_code || '',
      totalPoints: Math.round(Number(row.total_points) || 0),
      totalTarget: Math.round(Number(row.total_target) || 0),
      totalAchieved: Math.round(Number(row.total_achieved) || 0),
      achievementRate: Math.round((Number(row.achievement_rate) || 0) * 10) / 10,
      participantCount: Number(row.participant_count) || 0,
    }));

    return res.status(200).json({
      success: true,
      data: groupData,
    });
  } catch (error) {
    console.error('Error fetching group performance for Sell Out:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
