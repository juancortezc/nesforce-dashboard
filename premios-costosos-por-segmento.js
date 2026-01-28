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
  console.log('║      TOP 10 PREMIOS MÁS COSTOSOS POR SEGMENTO - 2025          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const segments = ['TSP', 'ELITE', 'DSD'];

  for (const segment of segments) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`SEGMENTO: ${segment}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const [results] = await bigquery.query({
      query: `
        SELECT
          r.award_name,
          r.award_categories as categoria,
          MAX(r.request_used_cost) as costo_usd,
          MAX(r.request_points) as puntos,
          COUNT(*) as veces_canjeado,
          SUM(r.request_used_cost) as costo_total_usd
        FROM \`lala4-377416.lala4.nestjsRequests\` r
        LEFT JOIN (
          SELECT DISTINCT participant_id, segment_name
          FROM \`lala4-377416.lala4.nesforce_results\`
          WHERE result_year = ${YEAR}
        ) nf ON r.request_participant_id = nf.participant_id
        WHERE r.participant_program_id = ${PROGRAM_ID}
          AND r.request_status IN ("DELIVERED", "APPROVED", "ORDERED", "DISPATCHED", "REQUESTED")
          AND EXTRACT(YEAR FROM r.request_requested_at) = ${YEAR}
          AND r.request_used_cost > 0
          AND nf.segment_name = '${segment}'
        GROUP BY r.award_name, r.award_categories
        ORDER BY costo_usd DESC
        LIMIT 10
      `,
      location
    });

    if (results.length === 0) {
      console.log('  No hay premios canjeados para este segmento\n');
      continue;
    }

    // Table header
    console.log('┌────┬─────────────────────────────────┬──────────────┬──────────┬────────┬──────────────┐');
    console.log('│ #  │ Premio                          │ Costo Unit.  │ Puntos   │ Canjes │ Costo Total  │');
    console.log('├────┼─────────────────────────────────┼──────────────┼──────────┼────────┼──────────────┤');

    results.forEach((r, i) => {
      console.log(
        '│ ' + (i + 1).toString().padStart(2) + ' │ ' +
        r.award_name.substring(0, 31).padEnd(31) + ' │ ' +
        ('$' + (r.costo_usd || 0).toFixed(2)).padStart(12) + ' │ ' +
        (r.puntos || 0).toLocaleString().padStart(8) + ' │ ' +
        r.veces_canjeado.toString().padStart(6) + ' │ ' +
        ('$' + (r.costo_total_usd || 0).toFixed(2)).padStart(12) + ' │'
      );
    });

    console.log('└────┴─────────────────────────────────┴──────────────┴──────────┴────────┴──────────────┘');
  }

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                     FIN DEL REPORTE                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

runReport().catch(console.error);
