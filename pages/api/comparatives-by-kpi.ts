import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface KPIComparison {
  kpi: string;
  currentAchieved: number;
  previousAchieved: number;
  currentTarget: number;
  previousTarget: number;
  currentFulfillment: number;
  previousFulfillment: number;
  delta: number;
  deltaPct: number;
  fulfillmentDelta: number;
}

interface KPIComparisonResponse {
  success: boolean;
  data?: KPIComparison[];
  error?: string;
}

/**
 * API endpoint para obtener comparación por KPI entre períodos
 * GET /api/comparatives-by-kpi
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<KPIComparisonResponse>
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
    } = req.query;

    // Construir WHERE clause base
    let whereConditions: string[] = ['participant_id IS NOT NULL', 'kpi_name IS NOT NULL', "position_name != 'VACACIONISTA'"];
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

    // Query para KPIs del período actual
    const currentQuery = `
      SELECT
        kpi_name,
        SUM(CAST(achieved AS FLOAT64)) as total_achieved,
        SUM(CAST(target AS FLOAT64)) as total_target,
        SAFE_DIVIDE(SUM(CAST(achieved AS FLOAT64)), SUM(CAST(target AS FLOAT64))) * 100 as fulfillment
      FROM ${TABLES.RESULTS}
      WHERE ${baseWhere}
        AND result_year = @currentYear
        AND result_month = @currentMonth
      GROUP BY kpi_name
      ORDER BY total_achieved DESC
    `;

    const currentParams = {
      ...params,
      currentYear: Number(currentPeriod.result_year),
      currentMonth: Number(currentPeriod.result_month),
    };

    const currentData = await executeQuery(currentQuery, currentParams);

    // Si no hay período anterior, retornar solo datos actuales sin comparación
    if (!previousPeriod) {
      const result: KPIComparison[] = currentData.map((row: any) => ({
        kpi: row.kpi_name,
        currentAchieved: Math.round(Number(row.total_achieved) || 0),
        previousAchieved: 0,
        currentTarget: Math.round(Number(row.total_target) || 0),
        previousTarget: 0,
        currentFulfillment: Math.round((Number(row.fulfillment) || 0) * 10) / 10,
        previousFulfillment: 0,
        delta: Math.round(Number(row.total_achieved) || 0),
        deltaPct: 0,
        fulfillmentDelta: Math.round((Number(row.fulfillment) || 0) * 10) / 10,
      }));

      return res.status(200).json({
        success: true,
        data: result,
      });
    }

    // Query para KPIs del período anterior
    const previousQuery = `
      SELECT
        kpi_name,
        SUM(CAST(achieved AS FLOAT64)) as total_achieved,
        SUM(CAST(target AS FLOAT64)) as total_target,
        SAFE_DIVIDE(SUM(CAST(achieved AS FLOAT64)), SUM(CAST(target AS FLOAT64))) * 100 as fulfillment
      FROM ${TABLES.RESULTS}
      WHERE ${baseWhere}
        AND result_year = @previousYear
        AND result_month = @previousMonth
      GROUP BY kpi_name
    `;

    const previousParams = {
      ...params,
      previousYear: Number(previousPeriod.result_year),
      previousMonth: Number(previousPeriod.result_month),
    };

    const previousData = await executeQuery(previousQuery, previousParams);

    // Crear un mapa de datos anteriores por KPI
    const previousMap = new Map(
      previousData.map((row: any) => [
        row.kpi_name,
        {
          achieved: Number(row.total_achieved) || 0,
          target: Number(row.total_target) || 0,
          fulfillment: Number(row.fulfillment) || 0,
        },
      ])
    );

    // Combinar datos actuales y anteriores
    const result: KPIComparison[] = currentData.map((row: any) => {
      const kpiName = row.kpi_name;
      const currentAchieved = Math.round(Number(row.total_achieved) || 0);
      const currentTarget = Math.round(Number(row.total_target) || 0);
      const currentFulfillment = Math.round((Number(row.fulfillment) || 0) * 10) / 10;

      const previous = previousMap.get(kpiName) || { achieved: 0, target: 0, fulfillment: 0 };
      const previousAchieved = Math.round(previous.achieved);
      const previousTarget = Math.round(previous.target);
      const previousFulfillment = Math.round(previous.fulfillment * 10) / 10;

      const delta = currentAchieved - previousAchieved;
      const deltaPct = previousAchieved !== 0
        ? Math.round((delta / previousAchieved) * 1000) / 10
        : 0;
      const fulfillmentDelta = Math.round((currentFulfillment - previousFulfillment) * 10) / 10;

      return {
        kpi: kpiName,
        currentAchieved,
        previousAchieved,
        currentTarget,
        previousTarget,
        currentFulfillment,
        previousFulfillment,
        delta,
        deltaPct,
        fulfillmentDelta,
      };
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching KPI comparison:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
