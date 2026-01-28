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

async function runQuery() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TOP 10 PREMIOS MÁS COSTOSOS - NESFORCE 2025');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const [results] = await bigquery.query({
    query: `
      SELECT
        award_name,
        award_categories as categoria,
        MAX(request_used_cost) as costo_usd,
        MAX(request_points) as puntos,
        COUNT(*) as veces_canjeado,
        SUM(request_used_cost) as costo_total_usd
      FROM \`lala4-377416.lala4.nestjsRequests\`
      WHERE participant_program_id = ${PROGRAM_ID}
        AND request_status IN ("DELIVERED", "APPROVED", "ORDERED", "DISPATCHED", "REQUESTED")
        AND EXTRACT(YEAR FROM request_requested_at) = ${YEAR}
        AND request_used_cost > 0
      GROUP BY award_name, award_categories
      ORDER BY costo_usd DESC
      LIMIT 10
    `,
    location
  });

  console.log('#'.padEnd(4) + 'Premio'.padEnd(35) + 'Categoría'.padEnd(20) + 'Costo Unit.'.padStart(13) + 'Puntos'.padStart(10) + 'Canjes'.padStart(8) + 'Costo Total'.padStart(13));
  console.log('-'.repeat(103));
  
  results.forEach((r, i) => {
    console.log(
      (i + 1 + '.').padEnd(4) +
      r.award_name.substring(0, 34).padEnd(35) +
      (r.categoria || '-').substring(0, 19).padEnd(20) +
      ('$' + (r.costo_usd || 0).toFixed(2)).padStart(13) +
      (r.puntos || 0).toLocaleString().padStart(10) +
      r.veces_canjeado.toString().padStart(8) +
      ('$' + (r.costo_total_usd || 0).toFixed(2)).padStart(13)
    );
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Exportar a CSV
  const fs = require('fs');
  const csvData = [
    ['#', 'Premio', 'Categoría', 'Costo Unitario USD', 'Puntos', 'Veces Canjeado', 'Costo Total USD'],
    ...results.map((r, i) => [
      i + 1,
      r.award_name,
      r.categoria || '-',
      r.costo_usd || 0,
      r.puntos || 0,
      r.veces_canjeado,
      r.costo_total_usd || 0
    ])
  ];
  
  const csvContent = csvData.map(row => row.join(',')).join('\n');
  fs.writeFileSync('top_10_premios_costosos.csv', csvContent);
  console.log('\n✅ Exportado a: top_10_premios_costosos.csv');
}

runQuery().catch(console.error);
