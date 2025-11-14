import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface KPIPoints {
  kpiId: string;
  kpiName: string;
  month: number;
  year: number;
  monthName: string;
  totalPoints: number;
  participantCount: number;
  avgPointsPerParticipant: number;
}

interface KPIPointsResponse {
  success: boolean;
  data?: KPIPoints[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<KPIPointsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { segment, group, position, route, kpi } = req.query;

    // Build WHERE conditions
    const conditions: string[] = ['kpi_name IS NOT NULL'];
    if (segment) conditions.push(`segment_name = '${segment}'`);
    if (group) conditions.push(`group_name = '${group}'`);
    if (position) conditions.push(`position_name = '${position}'`);
    if (route) conditions.push(`route_code = '${route}'`);
    if (kpi) conditions.push(`kpi_name = '${kpi}'`);

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT
        kpi_id,
        kpi_name,
        result_month,
        result_year,
        SUM(points) as total_points,
        COUNT(DISTINCT participant_id) as participant_count,
        SAFE_DIVIDE(SUM(points), COUNT(DISTINCT participant_id)) as avg_points_per_participant
      FROM ${TABLES.RESULTS}
      ${whereClause}
      GROUP BY kpi_id, kpi_name, result_month, result_year
      ORDER BY result_year DESC, result_month DESC, total_points DESC
      LIMIT 50
    `;

    const rows = await executeQuery(query);

    const MONTH_NAMES = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const kpiData: KPIPoints[] = rows.map((row: any) => ({
      kpiId: row.kpi_id || '',
      kpiName: row.kpi_name || 'Sin nombre',
      month: Number(row.result_month) || 0,
      year: Number(row.result_year) || 0,
      monthName: `${MONTH_NAMES[Number(row.result_month)] || 'N/A'} ${row.result_year}`,
      totalPoints: Math.round(Number(row.total_points) || 0),
      participantCount: Number(row.participant_count) || 0,
      avgPointsPerParticipant: Math.round(Number(row.avg_points_per_participant) || 0),
    }));

    return res.status(200).json({
      success: true,
      data: kpiData,
    });
  } catch (error) {
    console.error('Error fetching KPI points:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
