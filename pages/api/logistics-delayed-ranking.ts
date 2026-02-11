import type { NextApiRequest, NextApiResponse } from 'next';
import { getBigQueryClient } from '@/lib/bigquery';

// Objetivo de entrega: 15 días laborables (aprox 21 días calendario)
const TARGET_BUSINESS_DAYS = 15;
const TARGET_CALENDAR_DAYS = Math.round(TARGET_BUSINESS_DAYS * 1.4);

interface DelayedRanking {
  rank: number;
  distributor: string;
  delayedRequests: number;
  avgDelayDays: number;
}

interface RankingResponse {
  success: boolean;
  data?: {
    items: DelayedRanking[];
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

    let whereClause = `
      WHERE distribuidora IS NOT NULL
        AND request_status NOT IN ('DELIVERED', 'CANCELED')
        AND request_requested_at IS NOT NULL
        AND DATE_DIFF(CURRENT_DATE(), DATE(request_requested_at), DAY) > ${TARGET_CALENDAR_DAYS}
    `;
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

    // Query para ranking de distribuidoras por solicitudes retrasadas
    const query = `
      WITH ranking AS (
        SELECT
          distribuidora,
          COUNT(*) as delayed_requests,
          AVG(CAST(ROUND(DATE_DIFF(CURRENT_DATE(), DATE(request_requested_at), DAY) / 1.4) AS INT64) - ${TARGET_BUSINESS_DAYS}) as avg_delay_days
        FROM \`lala4-377416.nesforce.requests_nesforce\`
        ${whereClause}
        GROUP BY distribuidora
        ORDER BY delayed_requests DESC
      ),
      counted AS (
        SELECT *, ROW_NUMBER() OVER (ORDER BY delayed_requests DESC) as rank
        FROM ranking
      )
      SELECT rank, distribuidora, delayed_requests, avg_delay_days
      FROM counted
    `;

    const [rows] = await client.query({ query });

    const pageNum = parseInt(page as string);
    const size = parseInt(pageSize as string);
    const total = rows.length;
    const totalPages = Math.ceil(total / size);
    const start = (pageNum - 1) * size;
    const end = start + size;

    const items: DelayedRanking[] = rows.slice(start, end).map((row: {
      rank: number;
      distribuidora: string;
      delayed_requests: number;
      avg_delay_days: number;
    }) => ({
      rank: Number(row.rank),
      distributor: row.distribuidora,
      delayedRequests: Number(row.delayed_requests),
      avgDelayDays: Math.round(Number(row.avg_delay_days) * 10) / 10,
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
    console.error('Error fetching delayed ranking:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
