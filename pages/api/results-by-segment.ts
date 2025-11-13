import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface SegmentPerformance {
  segmentId: number;
  segmentName: string;
  totalPoints: number;
  totalTarget: number;
  totalAchieved: number;
  achievementRate: number;
  participantCount: number;
  avgPointsPerParticipant: number;
}

interface SegmentPerformanceResponse {
  success: boolean;
  data?: SegmentPerformance[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SegmentPerformanceResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { month, year, group, position } = req.query;

    let whereClause = 'WHERE segment_name IS NOT NULL';

    if (month && month !== 'all') {
      whereClause += ` AND result_month = @month`;
    }

    if (year && year !== 'all') {
      whereClause += ` AND result_year = @year`;
    }

    if (group && group !== 'all') {
      whereClause += ` AND group_name = @group`;
    }

    if (position && position !== 'all') {
      whereClause += ` AND position_name = @position`;
    }

    const query = `
      SELECT
        segment_id,
        segment_name,
        SUM(points) as total_points,
        SUM(CAST(target AS FLOAT64)) as total_target,
        SUM(CAST(achieved AS FLOAT64)) as total_achieved,
        SAFE_DIVIDE(SUM(CAST(achieved AS FLOAT64)), SUM(CAST(target AS FLOAT64))) * 100 as achievement_rate,
        COUNT(DISTINCT participant_id) as participant_count,
        SAFE_DIVIDE(SUM(points), COUNT(DISTINCT participant_id)) as avg_points_per_participant
      FROM ${TABLES.RESULTS}
      ${whereClause}
      GROUP BY segment_id, segment_name
      ORDER BY total_points DESC
    `;

    const params: any = {};
    if (month && month !== 'all') params.month = parseInt(month as string);
    if (year && year !== 'all') params.year = parseInt(year as string);
    if (group && group !== 'all') params.group = group;
    if (position && position !== 'all') params.position = position;

    const rows = await executeQuery(query, Object.keys(params).length > 0 ? params : undefined);

    const segmentData: SegmentPerformance[] = rows.map((row: any) => ({
      segmentId: Number(row.segment_id),
      segmentName: row.segment_name || 'Sin nombre',
      totalPoints: Math.round(Number(row.total_points) || 0),
      totalTarget: Math.round(Number(row.total_target) || 0),
      totalAchieved: Math.round(Number(row.total_achieved) || 0),
      achievementRate: Math.round((Number(row.achievement_rate) || 0) * 10) / 10,
      participantCount: Number(row.participant_count) || 0,
      avgPointsPerParticipant: Math.round(Number(row.avg_points_per_participant) || 0),
    }));

    return res.status(200).json({
      success: true,
      data: segmentData,
    });
  } catch (error) {
    console.error('Error fetching segment performance:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
