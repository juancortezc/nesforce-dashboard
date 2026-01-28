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
  console.log('║      TOP CATEGORÍAS CON MÁS CANJES - NESFORCE 2025            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const [results] = await bigquery.query({
    query: `
      SELECT
        COALESCE(award_categories, 'Sin categoría') as categoria,
        COUNT(*) as total_canjes,
        COUNT(DISTINCT request_participant_id) as vendedores,
        SUM(request_points) as puntos_usados,
        ROUND(SUM(request_used_cost), 2) as costo_total_usd,
        ROUND(AVG(request_points), 0) as puntos_promedio,
        ROUND(AVG(request_used_cost), 2) as costo_promedio
      FROM \`lala4-377416.lala4.nestjsRequests\`
      WHERE participant_program_id = ${PROGRAM_ID}
        AND request_status IN ("DELIVERED", "APPROVED", "ORDERED", "DISPATCHED", "REQUESTED")
        AND EXTRACT(YEAR FROM request_requested_at) = ${YEAR}
      GROUP BY award_categories
      ORDER BY total_canjes DESC
    `,
    location
  });

  if (results.length === 0) {
    console.log('  No hay canjes registrados\n');
    return;
  }

  console.log(`Total de categorías diferentes: ${results.length}\n`);

  // Table header
  console.log('┌────┬──────────────────────────────┬────────┬────────────┬──────────────┬──────────────┬──────────────┐');
  console.log('│ #  │ Categoría                    │ Canjes │ Vendedores │ Puntos       │ Costo USD    │ Costo Prom.  │');
  console.log('├────┼──────────────────────────────┼────────┼────────────┼──────────────┼──────────────┼──────────────┤');

  let totalCanjes = 0;
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
      ('$' + (r.costo_total_usd || 0).toLocaleString()).padStart(12) + ' │ ' +
      ('$' + (r.costo_promedio || 0).toFixed(2)).padStart(12) + ' │'
    );
  });

  console.log('├────┴──────────────────────────────┴────────┴────────────┴──────────────┴──────────────┴──────────────┤');
  console.log(
    '│ ' + 'TOTAL'.padEnd(31) + ' │ ' +
    totalCanjes.toString().padStart(6) + ' │ ' +
    ''.padStart(10) + ' │ ' +
    totalPuntos.toLocaleString().padStart(12) + ' │ ' +
    ('$' + totalCosto.toLocaleString()).padStart(12) + ' │ ' +
    ''.padStart(12) + ' │'
  );
  console.log('└──────────────────────────────────┴────────┴────────────┴──────────────┴──────────────┴──────────────┘');

  // Estadísticas
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ESTADÍSTICAS GENERALES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const promedioCanjes = (totalCanjes / results.length).toFixed(2);
  const promedioPuntos = (totalPuntos / totalCanjes).toFixed(0);
  const promedioCosto = (totalCosto / totalCanjes).toFixed(2);

  // Top 5 categorías
  const top5 = results.slice(0, 5);
  const canjesTop5 = top5.reduce((sum, r) => sum + r.total_canjes, 0);
  const porcentajeTop5 = ((canjesTop5 / totalCanjes) * 100).toFixed(1);

  console.log(`Total de canjes:                ${totalCanjes.toLocaleString()}`);
  console.log(`Total de categorías diferentes: ${results.length}`);
  console.log(`Promedio canjes por categoría:  ${promedioCanjes}`);
  console.log(`Puntos promedio por canje:      ${promedioPuntos}`);
  console.log(`Costo promedio por canje:       $${promedioCosto}`);
  console.log(`Total puntos utilizados:        ${totalPuntos.toLocaleString()}`);
  console.log(`Total costo en USD:             $${totalCosto.toLocaleString()}`);
  console.log(`\nTop 5 categorías representan:   ${canjesTop5.toLocaleString()} canjes (${porcentajeTop5}%)`);

  // Top 3 categorías
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TOP 3 CATEGORÍAS MÁS POPULARES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  results.slice(0, 3).forEach((r, i) => {
    const porcentaje = ((r.total_canjes / totalCanjes) * 100).toFixed(1);
    console.log(`${i + 1}. ${r.categoria}`);
    console.log(`   Canjes: ${r.total_canjes.toLocaleString()} (${porcentaje}%)`);
    console.log(`   Vendedores: ${r.vendedores.toLocaleString()}`);
    console.log(`   Puntos: ${(r.puntos_usados || 0).toLocaleString()}`);
    console.log(`   Costo total: $${(r.costo_total_usd || 0).toLocaleString()}`);
    console.log(`   Costo promedio: $${(r.costo_promedio || 0).toFixed(2)}\n`);
  });

  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                     FIN DEL REPORTE                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

runReport().catch(console.error);
