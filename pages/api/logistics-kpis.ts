import type { NextApiRequest, NextApiResponse } from 'next';
import { getBigQueryClient } from '@/lib/bigquery';

interface KPIsResponse {
  success: boolean;
  data?: {
    ordered: number;
    warehouse: number;
    dispatched: number;
    delivered: number;
    canceled: number;
    avgDeliveryDays: number | null;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<KPIsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { month, year, segment, distributor } = req.query;
    const client = getBigQueryClient();

    let whereClause = 'WHERE 1=1';
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

    // Query para contar por estado
    const statusQuery = `
      SELECT
        request_status,
        COUNT(*) as count
      FROM \`lala4-377416.nesforce.requests_nesforce\`
      ${whereClause}
      GROUP BY request_status
    `;

    // Query para tiempo promedio de entrega (días laborables aproximados)
    // Usamos días calendario / 1.4 como aproximación de días laborables
    const avgDeliveryQuery = `
      SELECT
        AVG(
          DATE_DIFF(DATE(request_delivered_at), DATE(request_requested_at), DAY) / 1.4
        ) as avg_delivery_days
      FROM \`lala4-377416.nesforce.requests_nesforce\`
      ${whereClause}
        AND request_status = 'DELIVERED'
        AND request_delivered_at IS NOT NULL
        AND request_requested_at IS NOT NULL
    `;

    const [statusRows, avgRows] = await Promise.all([
      client.query({ query: statusQuery }),
      client.query({ query: avgDeliveryQuery }),
    ]);

    const statusCounts: Record<string, number> = {};
    statusRows[0].forEach((row: { request_status: string; count: number }) => {
      statusCounts[row.request_status] = Number(row.count);
    });

    const avgDeliveryDays = avgRows[0][0]?.avg_delivery_days
      ? Math.round(Number(avgRows[0][0].avg_delivery_days) * 10) / 10
      : null;

    return res.status(200).json({
      success: true,
      data: {
        ordered: statusCounts['ORDERRED'] || 0,
        warehouse: statusCounts['WAREHOUSE'] || 0,
        dispatched: statusCounts['DISPATCHED'] || 0,
        delivered: statusCounts['DELIVERED'] || 0,
        canceled: statusCounts['CANCELED'] || 0,
        avgDeliveryDays,
      },
    });
  } catch (error) {
    console.error('Error fetching logistics KPIs:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
