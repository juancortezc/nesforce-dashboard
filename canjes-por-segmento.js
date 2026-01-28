require('dotenv').config();
const { BigQuery } = require('@google-cloud/bigquery');

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const bigquery = new BigQuery({
  projectId: 'lala4-377416',
  credentials,
});

const location = 'southamerica-east1';
const PROGRAM_ID = 28;

async function runReport() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║           CANJES POR SEGMENTO - NESFORCE 2025 Y 2026          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const [results] = await bigquery.query({
    query: `
      SELECT
        EXTRACT(YEAR FROM r.request_requested_at) as anio,
        COALESCE(nf.segment_name, 'Sin segmento') as segmento,
        COUNT(*) as total_canjes,
        COUNT(DISTINCT r.request_participant_id) as vendedores_con_canjes,
        SUM(r.request_points) as puntos_canjeados,
        ROUND(SUM(r.request_used_cost), 2) as costo_total_usd
      FROM \`lala4-377416.lala4.nestjsRequests\` r
      LEFT JOIN (
        SELECT DISTINCT participant_id, segment_name
        FROM \`lala4-377416.lala4.nesforce_results\`
        WHERE result_year IN (2025, 2026)
      ) nf ON r.request_participant_id = nf.participant_id
      WHERE r.participant_program_id = ${PROGRAM_ID}
        AND r.request_status IN ("DELIVERED", "APPROVED", "ORDERED", "DISPATCHED", "REQUESTED")
        AND EXTRACT(YEAR FROM r.request_requested_at) IN (2025, 2026)
      GROUP BY anio, nf.segment_name
      ORDER BY anio DESC, total_canjes DESC
    `,
    location
  });

  // Agrupar por año
  const data2025 = results.filter(r => r.anio === 2025);
  const data2026 = results.filter(r => r.anio === 2026);

  // Función para mostrar tabla
  function printTable(data, year) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`AÑO ${year}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (data.length === 0) {
      console.log('  No hay canjes registrados para este año\n');
      return;
    }

    console.log('┌─────────────────┬────────────┬─────────────┬──────────────┬───────────────┐');
    console.log('│ Segmento        │ Canjes     │ Vendedores  │ Puntos       │ Costo USD     │');
    console.log('├─────────────────┼────────────┼─────────────┼──────────────┼───────────────┤');

    let totalCanjes = 0;
    let totalVendedores = 0;
    let totalPuntos = 0;
    let totalCosto = 0;

    data.forEach(r => {
      totalCanjes += r.total_canjes;
      totalVendedores += r.vendedores_con_canjes;
      totalPuntos += r.puntos_canjeados || 0;
      totalCosto += r.costo_total_usd || 0;

      console.log(
        '│ ' + r.segmento.padEnd(15) + ' │ ' +
        r.total_canjes.toString().padStart(10) + ' │ ' +
        r.vendedores_con_canjes.toString().padStart(11) + ' │ ' +
        r.puntos_canjeados.toLocaleString().padStart(12) + ' │ ' +
        ('$' + (r.costo_total_usd || 0).toLocaleString()).padStart(13) + ' │'
      );
    });

    console.log('├─────────────────┼────────────┼─────────────┼──────────────┼───────────────┤');
    console.log(
      '│ ' + 'TOTAL'.padEnd(15) + ' │ ' +
      totalCanjes.toString().padStart(10) + ' │ ' +
      totalVendedores.toString().padStart(11) + ' │ ' +
      totalPuntos.toLocaleString().padStart(12) + ' │ ' +
      ('$' + totalCosto.toLocaleString()).padStart(13) + ' │'
    );
    console.log('└─────────────────┴────────────┴─────────────┴──────────────┴───────────────┘\n');
  }

  printTable(data2025, 2025);
  printTable(data2026, 2026);

  // Resumen comparativo
  const total2025 = data2025.reduce((sum, r) => sum + r.total_canjes, 0);
  const total2026 = data2026.reduce((sum, r) => sum + r.total_canjes, 0);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('RESUMEN COMPARATIVO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`Total canjes 2025: ${total2025.toLocaleString()}`);
  console.log(`Total canjes 2026: ${total2026.toLocaleString()}`);

  if (total2025 > 0) {
    const variacion = ((total2026 - total2025) / total2025 * 100).toFixed(2);
    console.log(`Variación: ${variacion > 0 ? '+' : ''}${variacion}%`);
  }

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                     FIN DEL REPORTE                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

runReport().catch(console.error);
