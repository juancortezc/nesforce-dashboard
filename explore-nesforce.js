require('dotenv').config();
const { BigQuery } = require('@google-cloud/bigquery');

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const bigquery = new BigQuery({
  projectId: 'lala4-377416',
  credentials,
});

const location = 'southamerica-east1';
const PROGRAM_ID = 5;

async function explore() {
  // Ver años disponibles en canjes
  console.log('=== Años con canjes en NESFORCE ===\n');
  const [requestYears] = await bigquery.query({
    query: `
      SELECT
        EXTRACT(YEAR FROM request_delivered_at) as year,
        COUNT(*) as canjes
      FROM \`lala4-377416.lala4.nestjsRequests\`
      WHERE participant_program_id = ${PROGRAM_ID}
        AND request_status = "DELIVERED"
      GROUP BY EXTRACT(YEAR FROM request_delivered_at)
      ORDER BY year
    `,
    location
  });
  requestYears.forEach(r => console.log('  Año ' + r.year + ': ' + r.canjes + ' canjes'));

  // Ver años en nesforce_results
  console.log('\n=== Años con resultados en nesforce_results ===\n');
  const [resultYears] = await bigquery.query({
    query: `
      SELECT
        result_year,
        COUNT(*) as registros,
        COUNT(DISTINCT participant_id) as participantes
      FROM \`lala4-377416.lala4.nesforce_results\`
      GROUP BY result_year
      ORDER BY result_year
    `,
    location
  });
  resultYears.forEach(r => console.log('  Año ' + r.result_year + ': ' + r.registros + ' registros, ' + r.participantes + ' participantes'));

  // Ver último mes disponible en 2025
  console.log('\n=== Último mes con datos en nesforce_results 2025 ===\n');
  const [lastMonth] = await bigquery.query({
    query: `
      SELECT
        result_month,
        COUNT(*) as registros
      FROM \`lala4-377416.lala4.nesforce_results\`
      WHERE result_year = 2025
      GROUP BY result_month
      ORDER BY result_month
    `,
    location
  });
  lastMonth.forEach(r => console.log('  Mes ' + r.result_month + ': ' + r.registros + ' registros'));
}

explore().catch(console.error);
