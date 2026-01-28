require('dotenv').config();
const { BigQuery } = require('@google-cloud/bigquery');

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const bigquery = new BigQuery({
  projectId: 'lala4-377416',
  credentials,
});

const location = 'southamerica-east1';
const PROGRAM_ID = 5; // NESFORCE
const YEAR = 2025;

async function runReport() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║              REPORTE NESFORCE - AÑO 2025                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // 1. Cumplimiento de objetivos promedio por segmento
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. CUMPLIMIENTO DE OBJETIVOS PROMEDIO POR SEGMENTO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const [compliance] = await bigquery.query({
    query: `
      SELECT
        segment_name,
        COUNT(DISTINCT participant_id) as total_participantes,
        ROUND(AVG(CASE WHEN target > 0 THEN (achieved / target) * 100 ELSE NULL END), 2) as cumplimiento_promedio_pct,
        SUM(points) as puntos_totales_ganados
      FROM \`lala4-377416.lala4.nesforce_results\`
      WHERE result_year = ${YEAR}
        AND target > 0
      GROUP BY segment_name
      ORDER BY cumplimiento_promedio_pct DESC
    `,
    location
  });

  console.log('Segmento'.padEnd(15) + 'Participantes'.padStart(15) + 'Cumplimiento %'.padStart(18) + 'Puntos Ganados'.padStart(18));
  console.log('-'.repeat(66));
  compliance.forEach(r => {
    console.log(
      r.segment_name.padEnd(15) +
      r.total_participantes.toString().padStart(15) +
      (r.cumplimiento_promedio_pct + '%').padStart(18) +
      r.puntos_totales_ganados.toLocaleString().padStart(18)
    );
  });

  // 2. Vendedores participantes por segmento
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('2. VENDEDORES PARTICIPANTES POR SEGMENTO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 2a. Que ganaron puntos
  console.log('2a. Vendedores que GANARON PUNTOS:\n');
  const [earnedPoints] = await bigquery.query({
    query: `
      SELECT
        segment_name,
        COUNT(DISTINCT participant_id) as vendedores_con_puntos,
        SUM(points) as total_puntos
      FROM \`lala4-377416.lala4.nesforce_results\`
      WHERE result_year = ${YEAR}
        AND points > 0
      GROUP BY segment_name
      ORDER BY vendedores_con_puntos DESC
    `,
    location
  });

  console.log('Segmento'.padEnd(15) + 'Vendedores'.padStart(12) + 'Total Puntos Ganados'.padStart(22));
  console.log('-'.repeat(49));
  earnedPoints.forEach(r => {
    console.log(
      (r.segment_name || 'Sin segmento').padEnd(15) +
      r.vendedores_con_puntos.toString().padStart(12) +
      r.total_puntos.toLocaleString().padStart(22)
    );
  });

  // 2b. Que canjearon premios - usando request_requested_at para 2025
  console.log('\n2b. Vendedores que CANJEARON PREMIOS:\n');
  const [redeemed] = await bigquery.query({
    query: `
      SELECT
        COALESCE(nf.segment_name, 'Sin segmento') as segment_name,
        COUNT(DISTINCT r.request_participant_id) as vendedores_con_canjes,
        COUNT(*) as total_canjes,
        SUM(r.request_points) as puntos_canjeados
      FROM \`lala4-377416.lala4.nestjsRequests\` r
      LEFT JOIN (
        SELECT DISTINCT participant_id, segment_name
        FROM \`lala4-377416.lala4.nesforce_results\`
        WHERE result_year = ${YEAR}
      ) nf ON r.request_participant_id = nf.participant_id
      WHERE r.participant_program_id = ${PROGRAM_ID}
        AND r.request_status IN ("DELIVERED", "APPROVED", "ORDERED", "DISPATCHED", "REQUESTED")
        AND EXTRACT(YEAR FROM r.request_requested_at) = ${YEAR}
      GROUP BY nf.segment_name
      ORDER BY vendedores_con_canjes DESC
    `,
    location
  });

  if (redeemed.length === 0) {
    console.log('  No hay canjes registrados en 2025');
  } else {
    console.log('Segmento'.padEnd(15) + 'Vendedores'.padStart(12) + 'Canjes'.padStart(10) + 'Puntos Canjeados'.padStart(18));
    console.log('-'.repeat(55));
    redeemed.forEach(r => {
      console.log(
        r.segment_name.padEnd(15) +
        r.vendedores_con_canjes.toString().padStart(12) +
        r.total_canjes.toString().padStart(10) +
        r.puntos_canjeados.toLocaleString().padStart(18)
      );
    });
  }

  // 3. Categorías de premios más canjeados
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('3. CATEGORÍAS DE PREMIOS MÁS CANJEADOS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const [categories] = await bigquery.query({
    query: `
      SELECT
        COALESCE(award_categories, 'Sin categoría') as categoria,
        COUNT(*) as cantidad_canjes,
        SUM(request_points) as puntos_usados,
        ROUND(SUM(request_used_cost), 2) as costo_total_usd
      FROM \`lala4-377416.lala4.nestjsRequests\`
      WHERE participant_program_id = ${PROGRAM_ID}
        AND request_status IN ("DELIVERED", "APPROVED", "ORDERED", "DISPATCHED", "REQUESTED")
        AND EXTRACT(YEAR FROM request_requested_at) = ${YEAR}
      GROUP BY award_categories
      ORDER BY cantidad_canjes DESC
    `,
    location
  });

  if (categories.length === 0) {
    console.log('  No hay canjes registrados en 2025');
  } else {
    console.log('Categoría'.padEnd(25) + 'Canjes'.padStart(10) + 'Puntos'.padStart(12) + 'Costo USD'.padStart(14));
    console.log('-'.repeat(61));
    categories.forEach(r => {
      console.log(
        r.categoria.substring(0, 24).padEnd(25) +
        r.cantidad_canjes.toString().padStart(10) +
        (r.puntos_usados || 0).toLocaleString().padStart(12) +
        ('$' + (r.costo_total_usd || 0).toLocaleString()).padStart(14)
      );
    });
  }

  // 4. Top 10 premios más canjeados
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('4. TOP 10 PREMIOS MÁS CANJEADOS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const [topRedeemed] = await bigquery.query({
    query: `
      SELECT
        award_name,
        award_categories as categoria,
        COUNT(*) as cantidad_canjes,
        SUM(request_points) as puntos_usados
      FROM \`lala4-377416.lala4.nestjsRequests\`
      WHERE participant_program_id = ${PROGRAM_ID}
        AND request_status IN ("DELIVERED", "APPROVED", "ORDERED", "DISPATCHED", "REQUESTED")
        AND EXTRACT(YEAR FROM request_requested_at) = ${YEAR}
      GROUP BY award_name, award_categories
      ORDER BY cantidad_canjes DESC
      LIMIT 10
    `,
    location
  });

  if (topRedeemed.length === 0) {
    console.log('  No hay canjes registrados en 2025');
  } else {
    console.log('#'.padEnd(4) + 'Premio'.padEnd(45) + 'Categoría'.padEnd(15) + 'Canjes'.padStart(8));
    console.log('-'.repeat(72));
    topRedeemed.forEach((r, i) => {
      console.log(
        (i + 1 + '.').padEnd(4) +
        r.award_name.substring(0, 44).padEnd(45) +
        (r.categoria || '-').substring(0, 14).padEnd(15) +
        r.cantidad_canjes.toString().padStart(8)
      );
    });
  }

  // 5. Top 10 premios de más alto valor
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('5. TOP 10 PREMIOS DE MÁS ALTO VALOR');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const [topValue] = await bigquery.query({
    query: `
      SELECT
        award_name,
        award_categories as categoria,
        MAX(request_points) as puntos,
        MAX(request_used_cost) as costo_usd,
        COUNT(*) as veces_canjeado
      FROM \`lala4-377416.lala4.nestjsRequests\`
      WHERE participant_program_id = ${PROGRAM_ID}
        AND request_status IN ("DELIVERED", "APPROVED", "ORDERED", "DISPATCHED", "REQUESTED")
        AND EXTRACT(YEAR FROM request_requested_at) = ${YEAR}
      GROUP BY award_name, award_categories
      ORDER BY costo_usd DESC
      LIMIT 10
    `,
    location
  });

  if (topValue.length === 0) {
    console.log('  No hay canjes registrados en 2025');
  } else {
    console.log('#'.padEnd(4) + 'Premio'.padEnd(40) + 'Puntos'.padStart(10) + 'Costo USD'.padStart(12) + 'Canjes'.padStart(8));
    console.log('-'.repeat(74));
    topValue.forEach((r, i) => {
      console.log(
        (i + 1 + '.').padEnd(4) +
        r.award_name.substring(0, 39).padEnd(40) +
        (r.puntos || 0).toLocaleString().padStart(10) +
        ('$' + (r.costo_usd || 0).toFixed(2)).padStart(12) +
        r.veces_canjeado.toString().padStart(8)
      );
    });
  }

  // 6. Tiempo promedio de entrega de premios
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('6. TIEMPO PROMEDIO DE ENTREGA DE PREMIOS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const [deliveryTime] = await bigquery.query({
    query: `
      SELECT
        ROUND(AVG(DATE_DIFF(request_delivered_at, request_requested_at, DAY)), 1) as dias_promedio,
        MIN(DATE_DIFF(request_delivered_at, request_requested_at, DAY)) as dias_min,
        MAX(DATE_DIFF(request_delivered_at, request_requested_at, DAY)) as dias_max,
        COUNT(*) as total_entregas
      FROM \`lala4-377416.lala4.nestjsRequests\`
      WHERE participant_program_id = ${PROGRAM_ID}
        AND request_status = "DELIVERED"
        AND request_delivered_at IS NOT NULL
        AND request_requested_at IS NOT NULL
        AND EXTRACT(YEAR FROM request_requested_at) = ${YEAR}
    `,
    location
  });

  const dt = deliveryTime[0];
  if (dt.total_entregas === 0) {
    console.log('  No hay entregas completadas en 2025');
  } else {
    console.log('Tiempo promedio de entrega: ' + dt.dias_promedio + ' días');
    console.log('Tiempo mínimo: ' + dt.dias_min + ' días');
    console.log('Tiempo máximo: ' + dt.dias_max + ' días');
    console.log('Total de entregas analizadas: ' + dt.total_entregas);
  }

  // 7. Mejores distribuidoras (Top 10)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('7. MEJORES DISTRIBUIDORAS (TOP 10)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const [topDistributors] = await bigquery.query({
    query: `
      SELECT
        group_name as distribuidora,
        group_code as codigo,
        segment_name as segmento,
        COUNT(DISTINCT participant_id) as vendedores,
        ROUND(AVG(CASE WHEN target > 0 THEN (achieved / target) * 100 ELSE NULL END), 2) as cumplimiento_pct,
        SUM(points) as puntos_ganados
      FROM \`lala4-377416.lala4.nesforce_results\`
      WHERE result_year = ${YEAR}
        AND target > 0
      GROUP BY group_name, group_code, segment_name
      ORDER BY puntos_ganados DESC
      LIMIT 10
    `,
    location
  });

  console.log('#'.padEnd(4) + 'Distribuidora'.padEnd(35) + 'Segmento'.padEnd(10) + 'Vendedores'.padStart(12) + 'Cumpl.%'.padStart(10) + 'Puntos'.padStart(12));
  console.log('-'.repeat(83));
  topDistributors.forEach((r, i) => {
    console.log(
      (i + 1 + '.').padEnd(4) +
      r.distribuidora.substring(0, 34).padEnd(35) +
      r.segmento.padEnd(10) +
      r.vendedores.toString().padStart(12) +
      (r.cumplimiento_pct + '%').padStart(10) +
      r.puntos_ganados.toLocaleString().padStart(12)
    );
  });

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                     FIN DEL REPORTE                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

runReport().catch(console.error);
