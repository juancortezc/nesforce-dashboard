import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface PeriodTrend {
  month: number;
  year: number;
  monthName: string;
  achieved: number;
  target: number;
  fulfillment: number;
  points: number;
  participants: number;
}

interface PeriodComparison {
  period: string;
  prevPeriod: string | null;
  achievedDelta: number;
  achievedDeltaPct: number;
  fulfillmentDelta: number;
  pointsDelta: number;
  pointsDeltaPct: number;
}

interface TrendResponse {
  success: boolean;
  data?: {
    periods: PeriodTrend[];
    comparisons: PeriodComparison[];
  };
  error?: string;
}

/**
 * API endpoint para obtener tendencia comparativa a lo largo del tiempo
 * GET /api/comparatives-trend
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TrendResponse>
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
      region,
      segment,
      group,
      position,
      route,
      kpi,
    } = req.query;

    // Construir WHERE clause
    let whereConditions: string[] = ['participant_id IS NOT NULL', "position_name != 'VACACIONISTA'"];
    const params: any = {};

    if (region && region !== 'all') {
      whereConditions.push('group_region = @region');
      params.region = region;
    }

    if (month && month !== 'all') {
      whereConditions.push('result_month = @month');
      params.month = parseInt(month as string);
    }
    if (year && year !== 'all') {
      whereConditions.push('result_year = @year');
      params.year = parseInt(year as string);
    }
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

    const whereClause = whereConditions.join(' AND ');

    // Query para obtener todos los períodos con datos (solo con achieved data)
    const query = `
      SELECT
        result_year as year,
        result_month as month,
        SUM(CAST(achieved AS FLOAT64)) as total_achieved,
        SUM(CAST(target AS FLOAT64)) as total_target,
        SAFE_DIVIDE(SUM(CAST(achieved AS FLOAT64)), SUM(CAST(target AS FLOAT64))) * 100 as fulfillment,
        SUM(points) as total_points,
        COUNT(DISTINCT participant_id) as total_participants
      FROM ${TABLES.RESULTS}
      WHERE ${whereClause}
        AND result_month IS NOT NULL
        AND result_year IS NOT NULL
        AND achieved IS NOT NULL
      GROUP BY result_year, result_month
      ORDER BY result_year ASC, result_month ASC
    `;

    const rows = await executeQuery(query, params);

    const monthNames = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const periods: PeriodTrend[] = rows.map((row: any) => ({
      month: Number(row.month),
      year: Number(row.year),
      monthName: `${monthNames[Number(row.month)]} ${row.year}`,
      achieved: Math.round(Number(row.total_achieved) || 0),
      target: Math.round(Number(row.total_target) || 0),
      fulfillment: Math.round((Number(row.fulfillment) || 0) * 10) / 10,
      points: Math.round(Number(row.total_points) || 0),
      participants: Number(row.total_participants) || 0,
    }));

    // Calcular comparaciones período a período
    const comparisons: PeriodComparison[] = periods.map((period, index) => {
      if (index === 0) {
        return {
          period: period.monthName,
          prevPeriod: null,
          achievedDelta: 0,
          achievedDeltaPct: 0,
          fulfillmentDelta: 0,
          pointsDelta: 0,
          pointsDeltaPct: 0,
        };
      }

      const prev = periods[index - 1];
      return {
        period: period.monthName,
        prevPeriod: prev.monthName,
        achievedDelta: period.achieved - prev.achieved,
        achievedDeltaPct: prev.achieved !== 0
          ? Math.round(((period.achieved - prev.achieved) / prev.achieved) * 1000) / 10
          : 0,
        fulfillmentDelta: Math.round((period.fulfillment - prev.fulfillment) * 10) / 10,
        pointsDelta: period.points - prev.points,
        pointsDeltaPct: prev.points !== 0
          ? Math.round(((period.points - prev.points) / prev.points) * 1000) / 10
          : 0,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        periods,
        comparisons,
      },
    });
  } catch (error) {
    console.error('Error fetching comparative trend:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
