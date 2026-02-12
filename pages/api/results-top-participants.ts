import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface ParticipantPerformance {
  participantId: number;
  participantName: string;
  groupName: string;
  totalPoints: number;
  totalTarget: number;
  totalAchieved: number;
  achievementRate: number;
  kpiCount: number;
}

interface TopParticipantsResponse {
  success: boolean;
  data?: ParticipantPerformance[];
  totalCount?: number;
  totalPoints?: number;
  avgAchievement?: number;
  latestPeriod?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TopParticipantsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { month, year, region, segment, group, position, route, kpi, limit = '20' } = req.query;

    let whereClause = 'WHERE participant_id IS NOT NULL AND achieved IS NOT NULL';

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
        participant_id,
        participant_full_name as participant_name,
        group_name,
        SUM(points) as total_points,
        SUM(CAST(target AS FLOAT64)) as total_target,
        SUM(CAST(achieved AS FLOAT64)) as total_achieved,
        SAFE_DIVIDE(SUM(CAST(achieved AS FLOAT64)), SUM(CAST(target AS FLOAT64))) * 100 as achievement_rate,
        COUNT(DISTINCT kpi_id) as kpi_count
      FROM ${TABLES.RESULTS}
      ${whereClause}
      GROUP BY participant_id, participant_name, group_name
      ORDER BY achievement_rate DESC, total_points DESC
      LIMIT @limit
    `;

    const params: any = { limit: parseInt(limit as string) };
    if (month && month !== 'all') params.month = parseInt(month as string);
    if (year && year !== 'all') params.year = parseInt(year as string);
    if (region && region !== 'all') params.region = region;
    if (segment && segment !== 'all') params.segment = segment;
    if (group && group !== 'all') params.group = group;
    if (position && position !== 'all') params.position = position;
    if (route && route !== 'all') params.route = route;
    if (kpi && kpi !== 'all') params.kpi = kpi;

    const rows = await executeQuery(query, params);

    // Get aggregated stats (total participants, points, achievement)
    const statsQuery = `
      SELECT
        COUNT(DISTINCT participant_id) as total_participants,
        SUM(points) as total_points,
        SAFE_DIVIDE(SUM(CAST(achieved AS FLOAT64)), SUM(CAST(target AS FLOAT64))) * 100 as avg_achievement,
        MAX(result_year) as max_year,
        MAX(CASE WHEN result_year = (SELECT MAX(result_year) FROM ${TABLES.RESULTS} ${whereClause}) THEN result_month ELSE 0 END) as max_month
      FROM ${TABLES.RESULTS}
      ${whereClause}
    `;
    const statsRows = await executeQuery(statsQuery, params);
    const stats = statsRows[0] || {};

    const monthNames = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const latestPeriod = stats.max_year && stats.max_month
      ? `${monthNames[Number(stats.max_month)]} ${stats.max_year}`
      : undefined;

    const totalCount = Number(stats.total_participants) || 0;
    const totalPoints = Math.round(Number(stats.total_points) || 0);
    const avgAchievement = Math.round((Number(stats.avg_achievement) || 0) * 10) / 10;

    const participantData: ParticipantPerformance[] = rows.map((row: any) => ({
      participantId: Number(row.participant_id),
      participantName: row.participant_name || 'Sin nombre',
      groupName: row.group_name || 'Sin grupo',
      totalPoints: Math.round(Number(row.total_points) || 0),
      totalTarget: Math.round(Number(row.total_target) || 0),
      totalAchieved: Math.round(Number(row.total_achieved) || 0),
      achievementRate: Math.round((Number(row.achievement_rate) || 0) * 10) / 10,
      kpiCount: Number(row.kpi_count) || 0,
    }));

    return res.status(200).json({
      success: true,
      data: participantData,
      totalCount,
      totalPoints,
      avgAchievement,
      latestPeriod,
    });
  } catch (error) {
    console.error('Error fetching top participants:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
