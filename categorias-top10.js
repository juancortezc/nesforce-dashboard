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
  console.log('║      TOP 10 CATEGORÍAS + OTRAS - NESFORCE 2025                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const [results] = await bigquery.query({
    query: `
      SELECT
        COALESCE(award_categories, 'Sin categoría') as categoria,
        COUNT(*) as total_canjes,
        COUNT(DISTINCT request_participant_id) as vendedores,
        SUM(request_points) as puntos_usados,
        ROUND(SUM(request_used_cost), 2) as costo_total_usd
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

  // Separar top 10 y otras
  const top10 = results.slice(0, 10);
  const otras = results.slice(10);

  // Calcular totales de "OTRAS"
  let otrasCanjes = 0;
  let otrasVendedores = new Set();
  let otrasPuntos = 0;
  let otrasCosto = 0;

  otras.forEach(r => {
    otrasCanjes += r.total_canjes;
    otrasPuntos += r.puntos_usados || 0;
    otrasCosto += r.costo_total_usd || 0;
  });

  // Contar vendedores únicos en "OTRAS" (aproximación)
  const otrasVendedoresCount = otras.reduce((sum, r) => sum + r.vendedores, 0);

  // Crear array combinado
  const displayData = [...top10];
  if (otras.length > 0) {
    displayData.push({
      categoria: `OTRAS (${otras.length} categorías)`,
      total_canjes: otrasCanjes,
      vendedores: otrasVendedoresCount,
      puntos_usados: otrasPuntos,
      costo_total_usd: otrasCosto
    });
  }

  // Table header
  console.log('┌────┬──────────────────────────────┬────────┬────────────┬──────────────┬──────────────┬────────────┐');
  console.log('│ #  │ Categoría                    │ Canjes │ Vendedores │ Puntos       │ Costo USD    │ % Canjes   │');
  console.log('├────┼──────────────────────────────┼────────┼────────────┼──────────────┼──────────────┼────────────┤');

  let totalCanjes = results.reduce((sum, r) => sum + r.total_canjes, 0);
  let totalPuntos = results.reduce((sum, r) => sum + (r.puntos_usados || 0), 0);
  let totalCosto = results.reduce((sum, r) => sum + (r.costo_total_usd || 0), 0);

  displayData.forEach((r, i) => {
    const porcentaje = ((r.total_canjes / totalCanjes) * 100).toFixed(1);

    console.log(
      '│ ' + (i < 10 ? (i + 1).toString().padStart(2) : '--') + ' │ ' +
      r.categoria.substring(0, 28).padEnd(28) + ' │ ' +
      r.total_canjes.toString().padStart(6) + ' │ ' +
      r.vendedores.toString().padStart(10) + ' │ ' +
      (r.puntos_usados || 0).toLocaleString().padStart(12) + ' │ ' +
      ('$' + (r.costo_total_usd || 0).toLocaleString()).padStart(12) + ' │ ' +
      (porcentaje + '%').padStart(10) + ' │'
    );
  });

  console.log('├────┴──────────────────────────────┴────────┴────────────┴──────────────┴──────────────┴────────────┤');
  console.log(
    '│ ' + 'TOTAL'.padEnd(31) + ' │ ' +
    totalCanjes.toString().padStart(6) + ' │ ' +
    ''.padStart(10) + ' │ ' +
    totalPuntos.toLocaleString().padStart(12) + ' │ ' +
    ('$' + totalCosto.toLocaleString()).padStart(12) + ' │ ' +
    '100.0%'.padStart(10) + ' │'
  );
  console.log('└──────────────────────────────────┴────────┴────────────┴──────────────┴──────────────┴────────────┘');

  // Estadísticas
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ANÁLISIS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const canjesTop10 = top10.reduce((sum, r) => sum + r.total_canjes, 0);
  const porcentajeTop10 = ((canjesTop10 / totalCanjes) * 100).toFixed(1);
  const puntosTop10 = top10.reduce((sum, r) => sum + (r.puntos_usados || 0), 0);
  const costoTop10 = top10.reduce((sum, r) => sum + (r.costo_total_usd || 0), 0);

  console.log(`Total de categorías:           ${results.length}`);
  console.log(`\nTOP 10 categorías:`);
  console.log(`  Canjes:    ${canjesTop10.toLocaleString()} (${porcentajeTop10}%)`);
  console.log(`  Puntos:    ${puntosTop10.toLocaleString()}`);
  console.log(`  Costo:     $${costoTop10.toLocaleString()}`);

  if (otras.length > 0) {
    const porcentajeOtras = ((otrasCanjes / totalCanjes) * 100).toFixed(1);
    console.log(`\nOTRAS ${otras.length} categorías:`);
    console.log(`  Canjes:    ${otrasCanjes.toLocaleString()} (${porcentajeOtras}%)`);
    console.log(`  Puntos:    ${otrasPuntos.toLocaleString()}`);
    console.log(`  Costo:     $${otrasCosto.toLocaleString()}`);
  }

  console.log(`\nGRAND TOTAL:`);
  console.log(`  Canjes:    ${totalCanjes.toLocaleString()}`);
  console.log(`  Puntos:    ${totalPuntos.toLocaleString()}`);
  console.log(`  Costo:     $${totalCosto.toLocaleString()}`);

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                     FIN DEL REPORTE                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

runReport().catch(console.error);
