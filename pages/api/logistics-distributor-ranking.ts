import type { NextApiRequest, NextApiResponse } from 'next';
import { getBigQueryClient } from '@/lib/bigquery';

interface DistributorRanking {
  rank: number;
  distributor: string;
  totalRequests: number;
  delivered: number;
  pending: number;
}

interface RankingResponse {
  success: boolean;
  data?: {
    items: DistributorRanking[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RankingResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { month, year, segment, distributor, page = '1', pageSize = '10' } = req.query;
    const client = getBigQueryClient();

    let whereClause = 'WHERE distribuidora IS NOT NULL';
    if (month && month !== 'all') {
      whereClause += ` AND EXTRACT(MONTH FROM request_requested_at) = ${parseInt(month as string)}`;
    }
    if (year && year !== 'all') {
      whereClause += ` AND EXTRACT(YEAR FROM request_requested_at) = ${parseInt(year as string)}`;
    }
    if (segment && segment !== 'all') {
      whereClause += ` AND segmento = '${segment}'`;
    }
    if (distributor && distributor !== 'all') {
      whereClause += ` AND distribuidora = '${distributor}'`;
    }

    // Query para ranking de distribuidoras por total de solicitudes
    const query = `
      WITH ranking AS (
        SELECT
          distribuidora,
          COUNT(*) as total_requests,
          COUNTIF(request_status = 'DELIVERED') as delivered,
          COUNTIF(request_status NOT IN ('DELIVERED', 'CANCELED')) as pending
        FROM \`lala4-377416.nesforce.requests_nesforce\`
        ${whereClause}
        GROUP BY distribuidora
        ORDER BY total_requests DESC
      ),
      counted AS (
        SELECT *, ROW_NUMBER() OVER (ORDER BY total_requests DESC) as rank
        FROM ranking
      )
      SELECT rank, distribuidora, total_requests, delivered, pending
      FROM counted
    `;

    const [rows] = await client.query({ query });

    const pageNum = parseInt(page as string);
    const size = parseInt(pageSize as string);
    const total = rows.length;
    const totalPages = Math.ceil(total / size);
    const start = (pageNum - 1) * size;
    const end = start + size;

    const items: DistributorRanking[] = rows.slice(start, end).map((row: {
      rank: number;
      distribuidora: string;
      total_requests: number;
      delivered: number;
      pending: number;
    }) => ({
      rank: Number(row.rank),
      distributor: row.distribuidora,
      totalRequests: Number(row.total_requests),
      delivered: Number(row.delivered),
      pending: Number(row.pending),
    }));

    return res.status(200).json({
      success: true,
      data: {
        items,
        total,
        page: pageNum,
        pageSize: size,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching distributor ranking:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
