import type { NextApiRequest, NextApiResponse } from 'next';
import { getBigQueryClient } from '@/lib/bigquery';

interface DispatchData {
  date: string;
  dayName: string;
  dispatched: number;
  delivered: number;
}

interface DispatchesResponse {
  success: boolean;
  data?: DispatchData[];
  error?: string;
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DispatchesResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { month, year } = req.query;
    const client = getBigQueryClient();

    let whereClause = 'WHERE request_dispatched_at IS NOT NULL';
    if (month && month !== 'all') {
      whereClause += ` AND EXTRACT(MONTH FROM request_dispatched_at) = ${parseInt(month as string)}`;
    }
    if (year && year !== 'all') {
      whereClause += ` AND EXTRACT(YEAR FROM request_dispatched_at) = ${parseInt(year as string)}`;
    }

    // Query para despachos por día (últimos 30 días con datos)
    const query = `
      WITH dispatches AS (
        SELECT
          DATE(request_dispatched_at) as dispatch_date,
          COUNT(*) as dispatched_count
        FROM \`lala4-377416.nesforce.requests_nesforce\`
        ${whereClause}
        GROUP BY dispatch_date
      ),
      deliveries AS (
        SELECT
          DATE(request_delivered_at) as delivery_date,
          COUNT(*) as delivered_count
        FROM \`lala4-377416.nesforce.requests_nesforce\`
        WHERE request_delivered_at IS NOT NULL
        ${month && month !== 'all' ? `AND EXTRACT(MONTH FROM request_delivered_at) = ${parseInt(month as string)}` : ''}
        ${year && year !== 'all' ? `AND EXTRACT(YEAR FROM request_delivered_at) = ${parseInt(year as string)}` : ''}
        GROUP BY delivery_date
      )
      SELECT
        COALESCE(d.dispatch_date, del.delivery_date) as date,
        EXTRACT(DAYOFWEEK FROM COALESCE(d.dispatch_date, del.delivery_date)) as day_of_week,
        COALESCE(d.dispatched_count, 0) as dispatched,
        COALESCE(del.delivered_count, 0) as delivered
      FROM dispatches d
      FULL OUTER JOIN deliveries del ON d.dispatch_date = del.delivery_date
      ORDER BY date DESC
      LIMIT 30
    `;

    const [rows] = await client.query({ query });

    const data: DispatchData[] = rows
      .map((row: { date: { value: string }; day_of_week: number; dispatched: number; delivered: number }) => ({
        date: row.date?.value || String(row.date),
        dayName: DAY_NAMES[Number(row.day_of_week) - 1] || '',
        dispatched: Number(row.dispatched) || 0,
        delivered: Number(row.delivered) || 0,
      }))
      .reverse();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching logistics dispatches:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
