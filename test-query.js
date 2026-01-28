require('dotenv').config();
const { BigQuery } = require('@google-cloud/bigquery');

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const bigquery = new BigQuery({
  projectId: 'lala4-377416',
  credentials,
});

const location = 'southamerica-east1';

async function testQuery() {
  console.log('=== Test 1: Verificar datos en nesforce_results 2025 ===\n');
  
  const [test1] = await bigquery.query({
    query: `
      SELECT 
        segment_name,
        COUNT(*) as total_rows,
        COUNT(DISTINCT group_name) as distribuidoras,
        COUNT(DISTINCT participant_id) as participantes
      FROM \`lala4-377416.lala4.nesforce_results\`
      WHERE result_year = 2025
      GROUP BY segment_name
    `,
    location
  });
  
  console.log('Segmentos en 2025:');
  test1.forEach(r => {
    console.log(`  ${r.segment_name}: ${r.total_rows} rows, ${r.distribuidoras} distribuidoras, ${r.participantes} participantes`);
  });
  
  console.log('\n=== Test 2: Sample de group_name en TSP ===\n');
  
  const [test2] = await bigquery.query({
    query: `
      SELECT DISTINCT
        group_name,
        group_code,
        COUNT(DISTINCT participant_id) as vendedores
      FROM \`lala4-377416.lala4.nesforce_results\`
      WHERE result_year = 2025
        AND segment_name = 'TSP'
      GROUP BY group_name, group_code
      ORDER BY vendedores DESC
      LIMIT 5
    `,
    location
  });
  
  console.log('Top 5 distribuidoras TSP:');
  test2.forEach(r => {
    console.log(`  ${r.group_name} (${r.group_code}): ${r.vendedores} vendedores`);
  });
  
  console.log('\n=== Test 3: Verificar campo target ===\n');
  
  const [test3] = await bigquery.query({
    query: `
      SELECT 
        COUNT(*) as total_rows,
        COUNT(CASE WHEN target > 0 THEN 1 END) as rows_with_target,
        COUNT(CASE WHEN target IS NULL THEN 1 END) as rows_null_target,
        COUNT(CASE WHEN target = 0 THEN 1 END) as rows_zero_target
      FROM \`lala4-377416.lala4.nesforce_results\`
      WHERE result_year = 2025
        AND segment_name = 'TSP'
    `,
    location
  });
  
  console.log('Target values en TSP 2025:');
  console.log(`  Total rows: ${test3[0].total_rows}`);
  console.log(`  Con target > 0: ${test3[0].rows_with_target}`);
  console.log(`  Con target NULL: ${test3[0].rows_null_target}`);
  console.log(`  Con target = 0: ${test3[0].rows_zero_target}`);
  
  console.log('\n=== Test 4: Query completo TSP (sin filtro target) ===\n');
  
  const [test4] = await bigquery.query({
    query: `
      SELECT
        group_name as distribuidora,
        COUNT(DISTINCT participant_id) as vendedores,
        SUM(points) as puntos_ganados,
        AVG(achieved) as avg_achieved,
        AVG(target) as avg_target
      FROM \`lala4-377416.lala4.nesforce_results\`
      WHERE result_year = 2025
        AND segment_name = 'TSP'
      GROUP BY group_name
      ORDER BY puntos_ganados DESC
      LIMIT 5
    `,
    location
  });
  
  console.log('Top 5 sin filtro target:');
  test4.forEach(r => {
    console.log(`  ${r.distribuidora}: ${r.vendedores} vendedores, ${r.puntos_ganados} puntos`);
  });
}

testQuery().catch(console.error);
