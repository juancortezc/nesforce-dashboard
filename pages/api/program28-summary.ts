import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface MonthlySummary {
  month: number;
  year: number;
  monthName: string;
  totalRedemptions: number;
  totalPoints: number;
  uniqueParticipants: number;
  uniqueAwards: number;
}

interface SummaryResponse {
  success: boolean;
  data?: {
    totalRedemptions: number;
    totalPoints: number;
    totalParticipants: number;
    totalAwards: number;
    monthlyData: MonthlySummary[];
  };
  error?: string;
}

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SummaryResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { month, year, distributor, category, segment } = req.query;

    let whereClause = 'WHERE LOWER(request_status) != \'cancelado\'';

    if (distributor && distributor !== 'all') whereClause += ` AND distribuidora = @distributor`;
    if (month && month !== 'all') whereClause += ` AND EXTRACT(MONTH FROM request_requested_at) = @month`;
    if (year && year !== 'all') whereClause += ` AND EXTRACT(YEAR FROM request_requested_at) = @year`;
    if (category && category !== 'all') whereClause += ` AND award_categories LIKE @category`;
    if (segment && segment !== 'all') whereClause += ` AND segmento = @segment`;

    const summaryQuery = `
      SELECT
        COUNT(*) as total_redemptions,
        SUM(request_points) as total_points,
        COUNT(DISTINCT request_participant_id) as total_participants,
        COUNT(DISTINCT request_award_id) as total_awards
      FROM ${TABLES.REQUESTS}
      ${whereClause}
    `;

    const monthlyQuery = `
      SELECT
        EXTRACT(MONTH FROM request_requested_at) as month,
        EXTRACT(YEAR FROM request_requested_at) as year,
        COUNT(*) as total_redemptions,
        SUM(request_points) as total_points,
        COUNT(DISTINCT request_participant_id) as unique_participants,
        COUNT(DISTINCT request_award_id) as unique_awards
      FROM ${TABLES.REQUESTS}
      ${whereClause}
      GROUP BY year, month
      ORDER BY year, month
    `;

    const params: any = {};
    if (distributor && distributor !== 'all') params.distributor = distributor;
    if (month && month !== 'all') params.month = parseInt(month as string);
    if (year && year !== 'all') params.year = parseInt(year as string);
    if (category && category !== 'all') params.category = `%${category}%`;
    if (segment && segment !== 'all') params.segment = segment;

    const [summaryRows, monthlyRows] = await Promise.all([
      executeQuery(summaryQuery, Object.keys(params).length > 0 ? params : undefined),
      executeQuery(monthlyQuery, Object.keys(params).length > 0 ? params : undefined)
    ]);

    const summary = summaryRows[0] || {};
    const monthlyData: MonthlySummary[] = monthlyRows.map((row: any) => ({
      month: Number(row.month),
      year: Number(row.year),
      monthName: MONTH_NAMES[Number(row.month) - 1] || `Mes ${row.month}`,
      totalRedemptions: Number(row.total_redemptions) || 0,
      totalPoints: Number(row.total_points) || 0,
      uniqueParticipants: Number(row.unique_participants) || 0,
      uniqueAwards: Number(row.unique_awards) || 0,
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalRedemptions: Number(summary.total_redemptions) || 0,
        totalPoints: Number(summary.total_points) || 0,
        totalParticipants: Number(summary.total_participants) || 0,
        totalAwards: Number(summary.total_awards) || 0,
        monthlyData,
      },
    });
  } catch (error) {
    console.error('Error fetching program 28 summary:', error);
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
