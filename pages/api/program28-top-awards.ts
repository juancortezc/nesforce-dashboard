import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface TopAward {
  awardId: number;
  awardName: string;
  awardModel: string;
  totalRedemptions: number;
  totalPoints: number;
  uniqueParticipants: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { month, year, distributor, category, segment, limit = '20' } = req.query;

    let whereClause = 'WHERE request_award_id IS NOT NULL AND LOWER(request_status) != \'cancelado\'';
    if (distributor && distributor !== 'all') whereClause += ` AND distribuidora = @distributor`;
    if (month && month !== 'all') whereClause += ` AND EXTRACT(MONTH FROM request_requested_at) = @month`;
    if (year && year !== 'all') whereClause += ` AND EXTRACT(YEAR FROM request_requested_at) = @year`;
    if (category && category !== 'all') whereClause += ` AND award_categories LIKE @category`;
    if (segment && segment !== 'all') whereClause += ` AND segmento = @segment`;

    const query = `
      SELECT
        request_award_id as award_id,
        request_award_name as award_name,
        request_award_model as award_model,
        COUNT(*) as total_redemptions,
        SUM(request_points) as total_points,
        COUNT(DISTINCT request_participant_id) as unique_participants
      FROM ${TABLES.REQUESTS}
      ${whereClause}
      GROUP BY award_id, award_name, award_model
      ORDER BY total_redemptions DESC
      LIMIT @limit
    `;

    const params: any = { limit: parseInt(limit as string) };
    if (distributor && distributor !== 'all') params.distributor = distributor;
    if (month && month !== 'all') params.month = parseInt(month as string);
    if (year && year !== 'all') params.year = parseInt(year as string);
    if (category && category !== 'all') params.category = `%${category}%`;
    if (segment && segment !== 'all') params.segment = segment;

    const rows = await executeQuery(query, params);

    const awards: TopAward[] = rows.map((row: any) => ({
      awardId: Number(row.award_id),
      awardName: row.award_name || 'Sin nombre',
      awardModel: row.award_model || '',
      totalRedemptions: Number(row.total_redemptions) || 0,
      totalPoints: Number(row.total_points) || 0,
      uniqueParticipants: Number(row.unique_participants) || 0,
    }));

    return res.status(200).json({ success: true, data: awards });
  } catch (error) {
    console.error('Error fetching top awards:', error);
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
