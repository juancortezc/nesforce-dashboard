import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface ParticipantPerformance {
  participantId: number;
  participantName: string;
  totalPoints: number;
  totalTarget: number;
  totalAchieved: number;
  achievementRate: number;
  kpiCount: number;
}

interface TopParticipantsResponse {
  success: boolean;
  data?: ParticipantPerformance[];
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
    const { month, year, segment, group, position, limit = '20' } = req.query;

    let whereClause = 'WHERE participant_id IS NOT NULL';

    if (month && month !== 'all') {
      whereClause += ` AND result_month = @month`;
    }

    if (year && year !== 'all') {
      whereClause += ` AND result_year = @year`;
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

    const query = `
      SELECT
        participant_id,
        participant_full_name as participant_name,
        SUM(points) as total_points,
        SUM(CAST(target AS FLOAT64)) as total_target,
        SUM(CAST(achieved AS FLOAT64)) as total_achieved,
        SAFE_DIVIDE(SUM(CAST(achieved AS FLOAT64)), SUM(CAST(target AS FLOAT64))) * 100 as achievement_rate,
        COUNT(DISTINCT kpi_id) as kpi_count
      FROM ${TABLES.RESULTS}
      ${whereClause}
      GROUP BY participant_id, participant_name
      ORDER BY total_points DESC
      LIMIT @limit
    `;

    const params: any = { limit: parseInt(limit as string) };
    if (month && month !== 'all') params.month = parseInt(month as string);
    if (year && year !== 'all') params.year = parseInt(year as string);
    if (segment && segment !== 'all') params.segment = segment;
    if (group && group !== 'all') params.group = group;
    if (position && position !== 'all') params.position = position;

    const rows = await executeQuery(query, params);

    const participantData: ParticipantPerformance[] = rows.map((row: any) => ({
      participantId: Number(row.participant_id),
      participantName: row.participant_name || 'Sin nombre',
      totalPoints: Math.round(Number(row.total_points) || 0),
      totalTarget: Math.round(Number(row.total_target) || 0),
      totalAchieved: Math.round(Number(row.total_achieved) || 0),
      achievementRate: Math.round((Number(row.achievement_rate) || 0) * 10) / 10,
      kpiCount: Number(row.kpi_count) || 0,
    }));

    return res.status(200).json({
      success: true,
      data: participantData,
    });
  } catch (error) {
    console.error('Error fetching top participants:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
