import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { month, year, distributor, category, segment, limit = '20' } = req.query;

    let whereClause = 'WHERE LOWER(request_status) != \'cancelado\'';
    if (distributor && distributor !== 'all') whereClause += ` AND distribuidora = @distributor`;
    if (month && month !== 'all') whereClause += ` AND EXTRACT(MONTH FROM request_requested_at) = @month`;
    if (year && year !== 'all') whereClause += ` AND EXTRACT(YEAR FROM request_requested_at) = @year`;
    if (category && category !== 'all') whereClause += ` AND award_categories LIKE @category`;
    if (segment && segment !== 'all') whereClause += ` AND segmento = @segment`;

    const query = `
      SELECT
        request_participant_id as participant_id,
        request_participant_full_name as participant_name,
        request_participant_identifier as participant_identifier,
        COUNT(*) as total_redemptions,
        SUM(request_points) as total_points,
        COUNT(DISTINCT request_award_id) as unique_awards
      FROM ${TABLES.REQUESTS}
      ${whereClause}
      GROUP BY participant_id, participant_name, participant_identifier
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

    const participants = rows.map((row: any) => ({
      participantId: Number(row.participant_id),
      participantName: row.participant_name || 'Sin nombre',
      participantIdentifier: row.participant_identifier || '',
      totalRedemptions: Number(row.total_redemptions) || 0,
      totalPoints: Number(row.total_points) || 0,
      uniqueAwards: Number(row.unique_awards) || 0,
    }));

    return res.status(200).json({ success: true, data: participants });
  } catch (error) {
    console.error('Error fetching top participants:', error);
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
