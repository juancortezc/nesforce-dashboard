import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface PeriodData {
  achieved: number;
  target: number;
  fulfillment: number;
  points: number;
  participants: number;
}

interface SummaryResponse {
  success: boolean;
  data?: {
    currentPeriod: PeriodData & { label: string };
    previousPeriod: PeriodData & { label: string };
    changes: {
      achievedDelta: number;
      achievedDeltaPct: number;
      fulfillmentDelta: number;
      pointsDelta: number;
      pointsDeltaPct: number;
      participantsDelta: number;
      participantsDeltaPct: number;
    };
  };
  error?: string;
}

/**
 * API endpoint para obtener resumen comparativo entre períodos
 * GET /api/comparatives-summary
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SummaryResponse>
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
      mode = 'month-to-month'
    } = req.query;

    // Construir WHERE clause base
    let whereConditions: string[] = ['participant_id IS NOT NULL'];
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

    // Obtener períodos con datos disponibles
    const periodsQuery = `
      SELECT DISTINCT
        result_year,
        result_month,
        FORMAT('%d-%02d', result_year, result_month) as period_key
      FROM ${TABLES.RESULTS}
      WHERE ${baseWhere}
        AND result_month IS NOT NULL
        AND result_year IS NOT NULL
      ORDER BY result_year DESC, result_month DESC
      LIMIT 10
    `;

    const periods = await executeQuery(periodsQuery, params);

    if (periods.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          currentPeriod: { achieved: 0, target: 0, fulfillment: 0, points: 0, participants: 0, label: 'Sin datos' },
          previousPeriod: { achieved: 0, target: 0, fulfillment: 0, points: 0, participants: 0, label: 'Sin datos' },
          changes: {
            achievedDelta: 0,
            achievedDeltaPct: 0,
            fulfillmentDelta: 0,
            pointsDelta: 0,
            pointsDeltaPct: 0,
            participantsDelta: 0,
            participantsDeltaPct: 0,
          },
        },
      });
    }

    // Determinar períodos a comparar según el modo
    let currentYear: number, currentMonth: number;
    let previousYear: number, previousMonth: number;

    if (mode === 'month-to-month') {
      // Período actual
      if (month && month !== 'all' && year && year !== 'all') {
        currentYear = parseInt(year as string);
        currentMonth = parseInt(month as string);
      } else {
        currentYear = Number(periods[0].result_year);
        currentMonth = Number(periods[0].result_month);
      }

      // Período anterior: buscar el mes anterior con datos
      const prevPeriodIndex = periods.findIndex((p: any) =>
        Number(p.result_year) === currentYear && Number(p.result_month) === currentMonth
      );

      if (prevPeriodIndex >= 0 && prevPeriodIndex < periods.length - 1) {
        previousYear = Number(periods[prevPeriodIndex + 1].result_year);
        previousMonth = Number(periods[prevPeriodIndex + 1].result_month);
      } else {
        // No hay período anterior, usar valores en cero
        previousYear = currentYear;
        previousMonth = currentMonth;
      }
    } else {
      // Otros modos pueden implementarse aquí (trimestre, YTD, etc.)
      currentYear = Number(periods[0].result_year);
      currentMonth = Number(periods[0].result_month);
      previousYear = periods.length > 1 ? Number(periods[1].result_year) : currentYear;
      previousMonth = periods.length > 1 ? Number(periods[1].result_month) : currentMonth;
    }

    // Query para el período actual
    const currentQuery = `
      SELECT
        SUM(CAST(achieved AS FLOAT64)) as total_achieved,
        SUM(CAST(target AS FLOAT64)) as total_target,
        SAFE_DIVIDE(SUM(CAST(achieved AS FLOAT64)), SUM(CAST(target AS FLOAT64))) * 100 as fulfillment,
        SUM(points) as total_points,
        COUNT(DISTINCT participant_id) as total_participants
      FROM ${TABLES.RESULTS}
      WHERE ${baseWhere}
        AND result_year = @currentYear
        AND result_month = @currentMonth
    `;

    const currentParams = { ...params, currentYear, currentMonth };
    const currentData = await executeQuery(currentQuery, currentParams);

    // Query para el período anterior
    const previousQuery = `
      SELECT
        SUM(CAST(achieved AS FLOAT64)) as total_achieved,
        SUM(CAST(target AS FLOAT64)) as total_target,
        SAFE_DIVIDE(SUM(CAST(achieved AS FLOAT64)), SUM(CAST(target AS FLOAT64))) * 100 as fulfillment,
        SUM(points) as total_points,
        COUNT(DISTINCT participant_id) as total_participants
      FROM ${TABLES.RESULTS}
      WHERE ${baseWhere}
        AND result_year = @previousYear
        AND result_month = @previousMonth
    `;

    const previousParams = { ...params, previousYear, previousMonth };
    const previousData = await executeQuery(previousQuery, previousParams);

    const monthNames = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const current = currentData[0] || {};
    const previous = previousData[0] || {};

    const currentPeriod: PeriodData & { label: string } = {
      achieved: Math.round(Number(current.total_achieved) || 0),
      target: Math.round(Number(current.total_target) || 0),
      fulfillment: Math.round((Number(current.fulfillment) || 0) * 10) / 10,
      points: Math.round(Number(current.total_points) || 0),
      participants: Number(current.total_participants) || 0,
      label: `${monthNames[currentMonth]} ${currentYear}`,
    };

    const previousPeriod: PeriodData & { label: string } = {
      achieved: Math.round(Number(previous.total_achieved) || 0),
      target: Math.round(Number(previous.total_target) || 0),
      fulfillment: Math.round((Number(previous.fulfillment) || 0) * 10) / 10,
      points: Math.round(Number(previous.total_points) || 0),
      participants: Number(previous.total_participants) || 0,
      label: `${monthNames[previousMonth]} ${previousYear}`,
    };

    const changes = {
      achievedDelta: currentPeriod.achieved - previousPeriod.achieved,
      achievedDeltaPct: previousPeriod.achieved !== 0
        ? Math.round(((currentPeriod.achieved - previousPeriod.achieved) / previousPeriod.achieved) * 1000) / 10
        : 0,
      fulfillmentDelta: Math.round((currentPeriod.fulfillment - previousPeriod.fulfillment) * 10) / 10,
      pointsDelta: currentPeriod.points - previousPeriod.points,
      pointsDeltaPct: previousPeriod.points !== 0
        ? Math.round(((currentPeriod.points - previousPeriod.points) / previousPeriod.points) * 1000) / 10
        : 0,
      participantsDelta: currentPeriod.participants - previousPeriod.participants,
      participantsDeltaPct: previousPeriod.participants !== 0
        ? Math.round(((currentPeriod.participants - previousPeriod.participants) / previousPeriod.participants) * 1000) / 10
        : 0,
    };

    return res.status(200).json({
      success: true,
      data: {
        currentPeriod,
        previousPeriod,
        changes,
      },
    });
  } catch (error) {
    console.error('Error fetching comparative summary:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
