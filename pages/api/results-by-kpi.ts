import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface KPIPerformance {
  kpiId: string;
  kpiName: string;
  totalPoints: number;
  totalTarget: number;
  totalAchieved: number;
  achievementRate: number;
  participantCount: number;
}

interface KPIPerformanceResponse {
  success: boolean;
  data?: KPIPerformance[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<KPIPerformanceResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { month, year, region, segment, group, position, route, kpi } = req.query;

    let whereClause = 'WHERE kpi_name IS NOT NULL';

    if (month && month !== 'all') {
      whereClause += ` AND result_month = @month`;
    }

    if (year && year !== 'all') {
      whereClause += ` AND result_year = @year`;
    }

    if (region && region !== 'all') {
      whereClause += ` AND group_region = @region`;
    }

    if (segment && segment !== 'all') {
      whereClause += ` AND segment_name = @segment`;
    }

    if (group && group !== 'all') {
      whereClause += ` AND group_name = @group`;
    }

    if (position && position !== 'all') {
      whereClause += ` AND position_name = @position`;
    }

    if (route && route !== 'all') {
      whereClause += ` AND route_name = @route`;
    }

    if (kpi && kpi !== 'all') {
      whereClause += ` AND kpi_name = @kpi`;
    }

    const query = `
      SELECT
        kpi_id,
        kpi_name,
        SUM(points) as total_points,
        SUM(CAST(target AS FLOAT64)) as total_target,
        SUM(CAST(achieved AS FLOAT64)) as total_achieved,
        SAFE_DIVIDE(SUM(CAST(achieved AS FLOAT64)), SUM(CAST(target AS FLOAT64))) * 100 as achievement_rate,
        COUNT(DISTINCT participant_id) as participant_count
      FROM ${TABLES.RESULTS}
      ${whereClause}
      GROUP BY kpi_id, kpi_name
      ORDER BY total_points DESC
      LIMIT 30
    `;

    const params: any = {};
    if (month && month !== 'all') params.month = parseInt(month as string);
    if (year && year !== 'all') params.year = parseInt(year as string);
    if (region && region !== 'all') params.region = region;
    if (segment && segment !== 'all') params.segment = segment;
    if (group && group !== 'all') params.group = group;
    if (position && position !== 'all') params.position = position;
    if (route && route !== 'all') params.route = route;
    if (kpi && kpi !== 'all') params.kpi = kpi;

    const rows = await executeQuery(query, Object.keys(params).length > 0 ? params : undefined);

    const kpiData: KPIPerformance[] = rows.map((row: any) => ({
      kpiId: row.kpi_id || '',
      kpiName: row.kpi_name || 'Sin nombre',
      totalPoints: Math.round(Number(row.total_points) || 0),
      totalTarget: Math.round(Number(row.total_target) || 0),
      totalAchieved: Math.round(Number(row.total_achieved) || 0),
      achievementRate: Math.round((Number(row.achievement_rate) || 0) * 10) / 10,
      participantCount: Number(row.participant_count) || 0,
    }));

    return res.status(200).json({
      success: true,
      data: kpiData,
    });
  } catch (error) {
    console.error('Error fetching KPI performance:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
