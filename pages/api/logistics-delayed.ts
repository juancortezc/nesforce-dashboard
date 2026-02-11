import type { NextApiRequest, NextApiResponse } from 'next';
import { getBigQueryClient } from '@/lib/bigquery';

interface DelayedRequest {
  requestId: number;
  requestCode: string;
  participantName: string;
  awardName: string;
  requestedAt: string;
  status: string;
  delayDays: number;
}

interface DelayedResponse {
  success: boolean;
  data?: DelayedRequest[];
  error?: string;
}

// Objetivo de entrega: 15 días laborables (aprox 21 días calendario)
const TARGET_BUSINESS_DAYS = 15;
const TARGET_CALENDAR_DAYS = Math.round(TARGET_BUSINESS_DAYS * 1.4);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DelayedResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { month, year } = req.query;
    const client = getBigQueryClient();

    let whereClause = `
      WHERE request_status NOT IN ('DELIVERED', 'CANCELED')
        AND request_requested_at IS NOT NULL
        AND DATE_DIFF(CURRENT_DATE(), DATE(request_requested_at), DAY) > ${TARGET_CALENDAR_DAYS}
    `;
    if (month && month !== 'all') {
      whereClause += ` AND EXTRACT(MONTH FROM request_requested_at) = ${parseInt(month as string)}`;
    }
    if (year && year !== 'all') {
      whereClause += ` AND EXTRACT(YEAR FROM request_requested_at) = ${parseInt(year as string)}`;
    }

    const query = `
      SELECT
        request_id,
        request_code,
        COALESCE(participant_full_name, request_participant_full_name) as participant_name,
        COALESCE(award_name, request_award_name) as award_name,
        request_requested_at,
        request_status,
        CAST(ROUND(DATE_DIFF(CURRENT_DATE(), DATE(request_requested_at), DAY) / 1.4) AS INT64) as delay_business_days
      FROM \`lala4-377416.nesforce.requests_nesforce\`
      ${whereClause}
      ORDER BY delay_business_days DESC
      LIMIT 100
    `;

    const [rows] = await client.query({ query });

    const data: DelayedRequest[] = rows.map((row: {
      request_id: number;
      request_code: string;
      participant_name: string;
      award_name: string;
      request_requested_at: { value: string };
      request_status: string;
      delay_business_days: number;
    }) => ({
      requestId: Number(row.request_id),
      requestCode: row.request_code || '',
      participantName: row.participant_name || 'N/A',
      awardName: row.award_name || 'N/A',
      requestedAt: row.request_requested_at?.value?.split('T')[0] || String(row.request_requested_at).split('T')[0],
      status: row.request_status || '',
      delayDays: Number(row.delay_business_days) - TARGET_BUSINESS_DAYS,
    }));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching delayed requests:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
