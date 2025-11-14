import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface FilterOptions {
  segments: string[];
  groups: string[];
  positions: string[];
  routes: string[];
  kpis: string[];
}

interface FilterOptionsResponse {
  success: boolean;
  data?: FilterOptions;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FilterOptionsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Get distinct segments
    const segmentsQuery = `
      SELECT DISTINCT segment_name
      FROM ${TABLES.RESULTS}
      WHERE segment_name IS NOT NULL
      ORDER BY segment_name
    `;

    // Get distinct groups
    const groupsQuery = `
      SELECT DISTINCT group_name
      FROM ${TABLES.RESULTS}
      WHERE group_name IS NOT NULL
      ORDER BY group_name
    `;

    // Get distinct positions
    const positionsQuery = `
      SELECT DISTINCT position_name
      FROM ${TABLES.RESULTS}
      WHERE position_name IS NOT NULL
      ORDER BY position_name
    `;

    // Get distinct routes
    const routesQuery = `
      SELECT DISTINCT route_code
      FROM ${TABLES.RESULTS}
      WHERE route_code IS NOT NULL
      ORDER BY route_code
    `;

    // Get distinct KPIs
    const kpisQuery = `
      SELECT DISTINCT kpi_name
      FROM ${TABLES.RESULTS}
      WHERE kpi_name IS NOT NULL
      ORDER BY kpi_name
    `;

    const [segmentsRows, groupsRows, positionsRows, routesRows, kpisRows] = await Promise.all([
      executeQuery(segmentsQuery),
      executeQuery(groupsQuery),
      executeQuery(positionsQuery),
      executeQuery(routesQuery),
      executeQuery(kpisQuery),
    ]);

    const filterOptions: FilterOptions = {
      segments: segmentsRows.map((row: any) => row.segment_name),
      groups: groupsRows.map((row: any) => row.group_name),
      positions: positionsRows.map((row: any) => row.position_name),
      routes: routesRows.map((row: any) => row.route_code),
      kpis: kpisRows.map((row: any) => row.kpi_name),
    };

    return res.status(200).json({
      success: true,
      data: filterOptions,
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
