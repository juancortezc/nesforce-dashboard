import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { month, year, distributor, segment } = req.query;

    let whereClause = 'WHERE award_categories IS NOT NULL AND LOWER(request_status) != \'cancelado\'';
    if (distributor && distributor !== 'all') whereClause += ` AND distribuidora = @distributor`;
    if (month && month !== 'all') whereClause += ` AND EXTRACT(MONTH FROM request_requested_at) = @month`;
    if (year && year !== 'all') whereClause += ` AND EXTRACT(YEAR FROM request_requested_at) = @year`;
    if (segment && segment !== 'all') whereClause += ` AND segmento = @segment`;

    const query = `
      SELECT
        award_categories as category,
        award_subcategories as subcategory,
        COUNT(*) as total_redemptions,
        SUM(request_points) as total_points,
        COUNT(DISTINCT request_participant_id) as unique_participants
      FROM ${TABLES.REQUESTS}
      ${whereClause}
      GROUP BY category, subcategory
      ORDER BY total_redemptions DESC
      LIMIT 30
    `;

    const params: any = {};
    if (distributor && distributor !== 'all') params.distributor = distributor;
    if (month && month !== 'all') params.month = parseInt(month as string);
    if (year && year !== 'all') params.year = parseInt(year as string);
    if (segment && segment !== 'all') params.segment = segment;

    const rows = await executeQuery(query, Object.keys(params).length > 0 ? params : undefined);

    const totalRedemptions = rows.reduce((sum: number, row: any) => sum + (Number(row.total_redemptions) || 0), 0);

    const categories = rows.map((row: any) => ({
      category: row.category || 'Sin categoría',
      subcategory: row.subcategory || 'Sin subcategoría',
      totalRedemptions: Number(row.total_redemptions) || 0,
      totalPoints: Number(row.total_points) || 0,
      uniqueParticipants: Number(row.unique_participants) || 0,
      percentageOfTotal: totalRedemptions > 0 ? (Number(row.total_redemptions) / totalRedemptions) * 100 : 0,
    }));

    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
