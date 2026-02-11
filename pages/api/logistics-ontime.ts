import type { NextApiRequest, NextApiResponse } from 'next';
import { getBigQueryClient } from '@/lib/bigquery';

interface OnTimeResponse {
  success: boolean;
  data?: {
    onTime: number;
    delayed: number;
    onTimePercent: number;
    delayedPercent: number;
    targetDays: number;
  };
  error?: string;
}

// Objetivo de entrega: 15 días laborables (aprox 21 días calendario)
const TARGET_BUSINESS_DAYS = 15;
const TARGET_CALENDAR_DAYS = Math.round(TARGET_BUSINESS_DAYS * 1.4);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OnTimeResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { month } = req.query;
    const client = getBigQueryClient();

    let whereClause = `
      WHERE request_status = 'DELIVERED'
        AND request_delivered_at IS NOT NULL
        AND request_requested_at IS NOT NULL
    `;
    if (month && month !== 'all') {
      whereClause += ` AND EXTRACT(MONTH FROM request_delivered_at) = ${parseInt(month as string)}`;
    }

    const query = `
      SELECT
        COUNTIF(DATE_DIFF(DATE(request_delivered_at), DATE(request_requested_at), DAY) <= ${TARGET_CALENDAR_DAYS}) as on_time,
        COUNTIF(DATE_DIFF(DATE(request_delivered_at), DATE(request_requested_at), DAY) > ${TARGET_CALENDAR_DAYS}) as delayed,
        COUNT(*) as total
      FROM \`lala4-377416.nesforce.requests_nesforce\`
      ${whereClause}
    `;

    const [rows] = await client.query({ query });
    const result = rows[0] || { on_time: 0, delayed: 0, total: 0 };

    const onTime = Number(result.on_time) || 0;
    const delayed = Number(result.delayed) || 0;
    const total = Number(result.total) || 1;

    return res.status(200).json({
      success: true,
      data: {
        onTime,
        delayed,
        onTimePercent: Math.round((onTime / total) * 1000) / 10,
        delayedPercent: Math.round((delayed / total) * 1000) / 10,
        targetDays: TARGET_BUSINESS_DAYS,
      },
    });
  } catch (error) {
    console.error('Error fetching on-time stats:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
