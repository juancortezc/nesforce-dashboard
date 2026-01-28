require('dotenv').config();
const { BigQuery } = require('@google-cloud/bigquery');

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const bigquery = new BigQuery({
  projectId: 'lala4-377416',
  credentials,
});

const location = 'southamerica-east1';
const PROGRAM_ID = 28;
const YEAR = 2025;

async function runReport() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  TOP 10 PREMIOS MÁS CANJEADOS - MEJORA TU NEGOCIO 2025        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const [results] = await bigquery.query({
    query: `
      SELECT
        award_name,
        COUNT(*) as total_canjes,
        COUNT(DISTINCT request_participant_id) as vendedores,
        SUM(request_points) as puntos_usados,
        MAX(request_points) as puntos_unitarios,
        ROUND(SUM(request_used_cost), 2) as costo_total_usd,
        MAX(request_used_cost) as costo_unitario_usd
      FROM \`lala4-377416.lala4.nestjsRequests\`
      WHERE participant_program_id = ${PROGRAM_ID}
        AND request_status IN ("DELIVERED", "APPROVED", "ORDERED", "DISPATCHED", "REQUESTED")
        AND EXTRACT(YEAR FROM request_requested_at) = ${YEAR}
        AND (
          award_categories LIKE '%Mejora tu Negocio%'
          OR award_categories LIKE '%mejora tu negocio%'
        )
      GROUP BY award_name
      ORDER BY total_canjes DESC
      LIMIT 10
    `,
    location
  });

  if (results.length === 0) {
    console.log('  No hay premios canjeados en esta categoría\n');
    return;
  }

  // Table header
  console.log('┌────┬────────────────────────────────────┬────────┬────────────┬──────────┬──────────────┬──────────────┐');
  console.log('│ #  │ Premio                             │ Canjes │ Vendedores │ Pts Unit │ Pts Total    │ Costo Total  │');
  console.log('├────┼────────────────────────────────────┼────────┼────────────┼──────────┼──────────────┼──────────────┤');

  let totalCanjes = 0;
  let totalPuntos = 0;
  let totalCosto = 0;

  results.forEach((r, i) => {
    totalCanjes += r.total_canjes;
    totalPuntos += r.puntos_usados || 0;
    totalCosto += r.costo_total_usd || 0;

    console.log(
      '│ ' + (i + 1).toString().padStart(2) + ' │ ' +
      r.award_name.substring(0, 34).padEnd(34) + ' │ ' +
      r.total_canjes.toString().padStart(6) + ' │ ' +
      r.vendedores.toString().padStart(10) + ' │ ' +
      (r.puntos_unitarios || 0).toLocaleString().padStart(8) + ' │ ' +
      (r.puntos_usados || 0).toLocaleString().padStart(12) + ' │ ' +
      ('$' + (r.costo_total_usd || 0).toLocaleString()).padStart(12) + ' │'
    );
  });

  console.log('├────┴────────────────────────────────────┴────────┴────────────┴──────────┴──────────────┴──────────────┤');
  console.log(
    '│ ' + 'TOTAL'.padEnd(37) + ' │ ' +
    totalCanjes.toString().padStart(6) + ' │ ' +
    ''.padStart(10) + ' │ ' +
    ''.padStart(8) + ' │ ' +
    totalPuntos.toLocaleString().padStart(12) + ' │ ' +
    ('$' + totalCosto.toLocaleString()).padStart(12) + ' │'
  );
  console.log('└──────────────────────────────────────────┴────────┴────────────┴──────────┴──────────────┴──────────────┘');

  // Distribución por segmento
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('DISTRIBUCIÓN POR SEGMENTO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const [bySegment] = await bigquery.query({
    query: `
      SELECT
        COALESCE(nf.segment_name, 'Sin segmento') as segmento,
        COUNT(*) as total_canjes,
        COUNT(DISTINCT r.request_participant_id) as vendedores,
        SUM(r.request_points) as puntos_usados,
        ROUND(SUM(r.request_used_cost), 2) as costo_total_usd
      FROM \`lala4-377416.lala4.nestjsRequests\` r
      LEFT JOIN (
        SELECT DISTINCT participant_id, segment_name
        FROM \`lala4-377416.lala4.nesforce_results\`
        WHERE result_year = ${YEAR}
      ) nf ON r.request_participant_id = nf.participant_id
      WHERE r.participant_program_id = ${PROGRAM_ID}
        AND r.request_status IN ("DELIVERED", "APPROVED", "ORDERED", "DISPATCHED", "REQUESTED")
        AND EXTRACT(YEAR FROM r.request_requested_at) = ${YEAR}
        AND (
          r.award_categories LIKE '%Mejora tu Negocio%'
          OR r.award_categories LIKE '%mejora tu negocio%'
        )
      GROUP BY nf.segment_name
      ORDER BY total_canjes DESC
    `,
    location
  });

  console.log('┌─────────────────┬────────┬────────────┬──────────────┬──────────────┐');
  console.log('│ Segmento        │ Canjes │ Vendedores │ Puntos       │ Costo USD    │');
  console.log('├─────────────────┼────────┼────────────┼──────────────┼──────────────┤');

  bySegment.forEach(r => {
    console.log(
      '│ ' + r.segmento.padEnd(15) + ' │ ' +
      r.total_canjes.toString().padStart(6) + ' │ ' +
      r.vendedores.toString().padStart(10) + ' │ ' +
      (r.puntos_usados || 0).toLocaleString().padStart(12) + ' │ ' +
      ('$' + (r.costo_total_usd || 0).toLocaleString()).padStart(12) + ' │'
    );
  });

  console.log('└─────────────────┴────────┴────────────┴──────────────┴──────────────┘');

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                     FIN DEL REPORTE                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

runReport().catch(console.error);
