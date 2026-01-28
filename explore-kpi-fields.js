require('dotenv').config();
const { BigQuery } = require('@google-cloud/bigquery');

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const bigquery = new BigQuery({
  projectId: 'lala4-377416',
  credentials,
});

const location = 'southamerica-east1';

async function explore() {
  console.log('=== Campos KPI disponibles ===\n');
  
  const [sample] = await bigquery.query({
    query: `
      SELECT 
        kpi_id,
        kpi_reference_code,
        kpi_execution_code,
        kpi_name,
        segment_name
      FROM \`lala4-377416.lala4.nesforce_results\`
      WHERE result_year = 2025
      LIMIT 10
    `,
    location
  });
  
  console.log('Muestra de KPIs:');
  sample.forEach(r => {
    console.log('\n  kpi_id:', r.kpi_id);
    console.log('  kpi_reference_code:', r.kpi_reference_code);
    console.log('  kpi_execution_code:', r.kpi_execution_code);
    console.log('  kpi_name:', r.kpi_name);
    console.log('  segment_name:', r.segment_name);
  });
  
  console.log('\n=== Valores únicos de kpi_reference_code ===\n');
  
  const [refs] = await bigquery.query({
    query: `
      SELECT DISTINCT kpi_reference_code, COUNT(*) as cnt
      FROM \`lala4-377416.lala4.nesforce_results\`
      WHERE result_year = 2025
      GROUP BY kpi_reference_code
      ORDER BY cnt DESC
    `,
    location
  });
  
  refs.forEach(r => {
    console.log('  ' + r.kpi_reference_code + ': ' + r.cnt);
  });
}

explore().catch(console.error);
