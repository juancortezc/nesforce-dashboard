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
  console.log('║   CATEGORÍAS CON MÁS CANJES POR SEGMENTO - NESFORCE 2025      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const segments = ['TSP', 'ELITE', 'DSD'];

  for (const segment of segments) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`SEGMENTO: ${segment}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const [results] = await bigquery.query({
      query: `
        SELECT
          COALESCE(r.award_categories, 'Sin categoría') as categoria,
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
          AND nf.segment_name = '${segment}'
        GROUP BY r.award_categories
        ORDER BY total_canjes DESC
        LIMIT 15
      `,
      location
    });

    if (results.length === 0) {
      console.log('  No hay canjes registrados para este segmento\n');
      continue;
    }

    // Table header
    console.log('┌────┬──────────────────────────────┬────────┬────────────┬──────────────┬──────────────┐');
    console.log('│ #  │ Categoría                    │ Canjes │ Vendedores │ Puntos       │ Costo USD    │');
    console.log('├────┼──────────────────────────────┼────────┼────────────┼──────────────┼──────────────┤');

    let totalCanjes = 0;
    let totalVendedores = new Set();
    let totalPuntos = 0;
    let totalCosto = 0;

    results.forEach((r, i) => {
      totalCanjes += r.total_canjes;
      totalPuntos += r.puntos_usados || 0;
      totalCosto += r.costo_total_usd || 0;

      console.log(
        '│ ' + (i + 1).toString().padStart(2) + ' │ ' +
        r.categoria.substring(0, 28).padEnd(28) + ' │ ' +
        r.total_canjes.toString().padStart(6) + ' │ ' +
        r.vendedores.toString().padStart(10) + ' │ ' +
        (r.puntos_usados || 0).toLocaleString().padStart(12) + ' │ ' +
        ('$' + (r.costo_total_usd || 0).toLocaleString()).padStart(12) + ' │'
      );
    });

    console.log('├────┴──────────────────────────────┴────────┴────────────┴──────────────┴──────────────┤');
    console.log(
      '│ ' + 'TOTAL'.padEnd(33) + ' │ ' +
      totalCanjes.toString().padStart(6) + ' │ ' +
      ''.padStart(10) + ' │ ' +
      totalPuntos.toLocaleString().padStart(12) + ' │ ' +
      ('$' + totalCosto.toLocaleString()).padStart(12) + ' │'
    );
    console.log('└────────────────────────────────────┴────────┴────────────┴──────────────┴──────────────┘');
  }

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                     FIN DEL REPORTE                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

runReport().catch(console.error);
