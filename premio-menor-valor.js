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
  console.log('║      PREMIO DE MENOR VALOR CANJEADO - NESFORCE 2025           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Buscar el premio con menor costo unitario que haya sido canjeado
  const [results] = await bigquery.query({
    query: `
      SELECT
        award_name,
        award_categories as categoria,
        MIN(request_used_cost) as costo_minimo,
        MAX(request_used_cost) as costo_maximo,
        AVG(request_used_cost) as costo_promedio,
        MIN(request_points) as puntos_minimo,
        MAX(request_points) as puntos_maximo,
        COUNT(*) as total_canjes,
        COUNT(DISTINCT request_participant_id) as vendedores,
        SUM(request_used_cost) as costo_total
      FROM \`lala4-377416.lala4.nestjsRequests\`
      WHERE participant_program_id = ${PROGRAM_ID}
        AND request_status IN ("DELIVERED", "APPROVED", "ORDERED", "DISPATCHED", "REQUESTED")
        AND EXTRACT(YEAR FROM request_requested_at) = ${YEAR}
        AND request_used_cost > 0
      GROUP BY award_name, award_categories
      ORDER BY costo_minimo ASC
      LIMIT 20
    `,
    location
  });

  if (results.length === 0) {
    console.log('  No hay premios canjeados\n');
    return;
  }

  console.log('TOP 20 PREMIOS DE MENOR VALOR (costo unitario mínimo)\n');

  // Table header
  console.log('┌────┬────────────────────────────────────┬──────────────┬──────────────┬────────┬────────────┬──────────────┐');
  console.log('│ #  │ Premio                             │ Costo Min    │ Costo Max    │ Canjes │ Vendedores │ Costo Total  │');
  console.log('├────┼────────────────────────────────────┼──────────────┼──────────────┼────────┼────────────┼──────────────┤');

  results.forEach((r, i) => {
    console.log(
      '│ ' + (i + 1).toString().padStart(2) + ' │ ' +
      r.award_name.substring(0, 34).padEnd(34) + ' │ ' +
      ('$' + (r.costo_minimo || 0).toFixed(2)).padStart(12) + ' │ ' +
      ('$' + (r.costo_maximo || 0).toFixed(2)).padStart(12) + ' │ ' +
      r.total_canjes.toString().padStart(6) + ' │ ' +
      r.vendedores.toString().padStart(10) + ' │ ' +
      ('$' + (r.costo_total || 0).toLocaleString()).padStart(12) + ' │'
    );
  });

  console.log('└────┴────────────────────────────────────┴──────────────┴──────────────┴────────┴────────────┴──────────────┘');

  // Detalle del premio de menor valor
  const premioMenor = results[0];

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('DETALLE DEL PREMIO DE MENOR VALOR');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`Premio:             ${premioMenor.award_name}`);
  console.log(`Categoría:          ${premioMenor.categoria || 'Sin categoría'}`);
  console.log(`Costo mínimo:       $${premioMenor.costo_minimo.toFixed(2)}`);
  console.log(`Costo máximo:       $${premioMenor.costo_maximo.toFixed(2)}`);
  console.log(`Costo promedio:     $${premioMenor.costo_promedio.toFixed(2)}`);
  console.log(`Puntos mínimo:      ${premioMenor.puntos_minimo.toLocaleString()}`);
  console.log(`Puntos máximo:      ${premioMenor.puntos_maximo.toLocaleString()}`);
  console.log(`Total de canjes:    ${premioMenor.total_canjes.toLocaleString()}`);
  console.log(`Vendedores únicos:  ${premioMenor.vendedores.toLocaleString()}`);
  console.log(`Costo total:        $${premioMenor.costo_total.toLocaleString()}`);

  // Distribución por segmento del premio más barato
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('DISTRIBUCIÓN POR SEGMENTO DEL PREMIO MÁS BARATO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const [bySegment] = await bigquery.query({
    query: `
      SELECT
        COALESCE(nf.segment_name, 'Sin segmento') as segmento,
        COUNT(*) as canjes,
        COUNT(DISTINCT r.request_participant_id) as vendedores,
        SUM(r.request_points) as puntos_usados,
        ROUND(SUM(r.request_used_cost), 2) as costo_total
      FROM \`lala4-377416.lala4.nestjsRequests\` r
      LEFT JOIN (
        SELECT DISTINCT participant_id, segment_name
        FROM \`lala4-377416.lala4.nesforce_results\`
        WHERE result_year = ${YEAR}
      ) nf ON r.request_participant_id = nf.participant_id
      WHERE r.participant_program_id = ${PROGRAM_ID}
        AND r.request_status IN ("DELIVERED", "APPROVED", "ORDERED", "DISPATCHED", "REQUESTED")
        AND EXTRACT(YEAR FROM r.request_requested_at) = ${YEAR}
        AND r.award_name = '${premioMenor.award_name.replace(/'/g, "\\'")}'
      GROUP BY nf.segment_name
      ORDER BY canjes DESC
    `,
    location
  });

  if (bySegment.length > 0) {
    console.log('┌─────────────────┬────────┬────────────┬──────────────┬──────────────┐');
    console.log('│ Segmento        │ Canjes │ Vendedores │ Puntos       │ Costo USD    │');
    console.log('├─────────────────┼────────┼────────────┼──────────────┼──────────────┤');

    bySegment.forEach(r => {
      console.log(
        '│ ' + r.segmento.padEnd(15) + ' │ ' +
        r.canjes.toString().padStart(6) + ' │ ' +
        r.vendedores.toString().padStart(10) + ' │ ' +
        (r.puntos_usados || 0).toLocaleString().padStart(12) + ' │ ' +
        ('$' + (r.costo_total || 0).toLocaleString()).padStart(12) + ' │'
      );
    });

    console.log('└─────────────────┴────────┴────────────┴──────────────┴──────────────┘');
  }

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                     FIN DEL REPORTE                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

runReport().catch(console.error);
