import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface DistributorComparison {
  distributor: string;
  currentAchieved: number;
  previousAchieved: number;
  currentFulfillment: number;
  previousFulfillment: number;
  delta: number;
  deltaPct: number;
  fulfillmentDelta: number;
  currentRank: number;
  previousRank: number;
  rankChange: number;
}

interface DistributorComparisonResponse {
  success: boolean;
  data?: DistributorComparison[];
  error?: string;
}

/**
 * API endpoint para obtener comparación por distribuidor entre períodos
 * GET /api/comparatives-by-distributor
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DistributorComparisonResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const {
      month,
      year,
      segment,
      group,
      position,
      route,
      kpi,
      limit = '10',
    } = req.query;

    // Construir WHERE clause base
    let whereConditions: string[] = ['participant_id IS NOT NULL', 'group_name IS NOT NULL'];
    const params: any = {};

    if (segment && segment !== 'all') {
      whereConditions.push('segment_name = @segment');
      params.segment = segment;
    }
    if (group && group !== 'all') {
      whereConditions.push('group_name = @group');
      params.group = group;
    }
    if (position && position !== 'all') {
      whereConditions.push('position_name = @position');
      params.position = position;
    }
    if (route && route !== 'all') {
      whereConditions.push('route_code = @route');
      params.route = route;
    }
    if (kpi && kpi !== 'all') {
      whereConditions.push('kpi_name = @kpi');
      params.kpi = kpi;
    }

    const baseWhere = whereConditions.join(' AND ');

    // Obtener los dos períodos más recientes
    const periodsQuery = `
      SELECT DISTINCT
        result_year,
        result_month
      FROM ${TABLES.RESULTS}
      WHERE ${baseWhere}
        AND result_month IS NOT NULL
        AND result_year IS NOT NULL
      ORDER BY result_year DESC, result_month DESC
      LIMIT 2
    `;

    const periods = await executeQuery(periodsQuery, params);

    if (periods.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Períodos actual y anterior
    const currentPeriod = periods[0];
    const previousPeriod = periods.length > 1 ? periods[1] : null;

    // Query para distribuidores del período actual
    const currentQuery = `
      SELECT
        group_name,
        SUM(CAST(achieved AS FLOAT64)) as total_achieved,
        SUM(CAST(target AS FLOAT64)) as total_target,
        SAFE_DIVIDE(SUM(CAST(achieved AS FLOAT64)), SUM(CAST(target AS FLOAT64))) * 100 as fulfillment
      FROM ${TABLES.RESULTS}
      WHERE ${baseWhere}
        AND result_year = @currentYear
        AND result_month = @currentMonth
      GROUP BY group_name
      ORDER BY total_achieved DESC
      LIMIT @limit
    `;

    const currentParams = {
      ...params,
      currentYear: Number(currentPeriod.result_year),
      currentMonth: Number(currentPeriod.result_month),
      limit: parseInt(limit as string),
    };

    const currentData = await executeQuery(currentQuery, currentParams);

    // Si no hay período anterior, retornar solo datos actuales sin comparación
    if (!previousPeriod) {
      const result: DistributorComparison[] = currentData.map((row: any, index: number) => ({
        distributor: row.group_name,
        currentAchieved: Math.round(Number(row.total_achieved) || 0),
        previousAchieved: 0,
        currentFulfillment: Math.round((Number(row.fulfillment) || 0) * 10) / 10,
        previousFulfillment: 0,
        delta: Math.round(Number(row.total_achieved) || 0),
        deltaPct: 0,
        fulfillmentDelta: Math.round((Number(row.fulfillment) || 0) * 10) / 10,
        currentRank: index + 1,
        previousRank: 0,
        rankChange: 0,
      }));

      return res.status(200).json({
        success: true,
        data: result,
      });
    }

    // Query para distribuidores del período anterior
    const previousQuery = `
      SELECT
        group_name,
        SUM(CAST(achieved AS FLOAT64)) as total_achieved,
        SUM(CAST(target AS FLOAT64)) as total_target,
        SAFE_DIVIDE(SUM(CAST(achieved AS FLOAT64)), SUM(CAST(target AS FLOAT64))) * 100 as fulfillment
      FROM ${TABLES.RESULTS}
      WHERE ${baseWhere}
        AND result_year = @previousYear
        AND result_month = @previousMonth
      GROUP BY group_name
      ORDER BY total_achieved DESC
    `;

    const previousParams = {
      ...params,
      previousYear: Number(previousPeriod.result_year),
      previousMonth: Number(previousPeriod.result_month),
    };

    const previousData = await executeQuery(previousQuery, previousParams);

    // Crear mapa de datos anteriores con rankings
    const previousMap = new Map(
      previousData.map((row: any, index: number) => [
        row.group_name,
        {
          achieved: Number(row.total_achieved) || 0,
          fulfillment: Number(row.fulfillment) || 0,
          rank: index + 1,
        },
      ])
    );

    // Combinar datos actuales y anteriores
    const result: DistributorComparison[] = currentData.map((row: any, index: number) => {
      const distributorName = row.group_name;
      const currentAchieved = Math.round(Number(row.total_achieved) || 0);
      const currentFulfillment = Math.round((Number(row.fulfillment) || 0) * 10) / 10;
      const currentRank = index + 1;

      const previous = previousMap.get(distributorName) || {
        achieved: 0,
        fulfillment: 0,
        rank: 0,
      };
      const previousAchieved = Math.round(previous.achieved);
      const previousFulfillment = Math.round(previous.fulfillment * 10) / 10;
      const previousRank = previous.rank;

      const delta = currentAchieved - previousAchieved;
      const deltaPct = previousAchieved !== 0
        ? Math.round((delta / previousAchieved) * 1000) / 10
        : 0;
      const fulfillmentDelta = Math.round((currentFulfillment - previousFulfillment) * 10) / 10;
      const rankChange = previousRank !== 0 ? previousRank - currentRank : 0;

      return {
        distributor: distributorName,
        currentAchieved,
        previousAchieved,
        currentFulfillment,
        previousFulfillment,
        delta,
        deltaPct,
        fulfillmentDelta,
        currentRank,
        previousRank,
        rankChange,
      };
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching distributor comparison:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
