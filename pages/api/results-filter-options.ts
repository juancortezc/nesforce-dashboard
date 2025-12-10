import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface FilterOptions {
  regions: string[];
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
    const { region, segment } = req.query;

    // Get distinct regions
    const regionsQuery = `
      SELECT DISTINCT group_region
      FROM ${TABLES.RESULTS}
      WHERE group_region IS NOT NULL
      ORDER BY group_region
    `;

    // Get distinct segments - filtrar por región si se proporciona
    let segmentsQuery = `
      SELECT DISTINCT segment_name
      FROM ${TABLES.RESULTS}
      WHERE segment_name IS NOT NULL
    `;

    if (region && region !== '' && region !== 'all') {
      segmentsQuery += ` AND group_region = '${region}'`;
    }

    segmentsQuery += ` ORDER BY segment_name`;

    // Get distinct groups - filtrar por región y segmento si se proporcionan
    let groupsQuery = `
      SELECT DISTINCT group_name
      FROM ${TABLES.RESULTS}
      WHERE group_name IS NOT NULL
    `;

    if (region && region !== '' && region !== 'all') {
      groupsQuery += ` AND group_region = '${region}'`;
    }

    if (segment && segment !== '' && segment !== 'all') {
      groupsQuery += ` AND segment_name = '${segment}'`;
    }

    groupsQuery += ` ORDER BY group_name`;

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

    const [regionsRows, segmentsRows, groupsRows, positionsRows, routesRows, kpisRows] = await Promise.all([
      executeQuery(regionsQuery),
      executeQuery(segmentsQuery),
      executeQuery(groupsQuery),
      executeQuery(positionsQuery),
      executeQuery(routesQuery),
      executeQuery(kpisQuery),
    ]);

    const filterOptions: FilterOptions = {
      regions: regionsRows.map((row: any) => row.group_region),
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
