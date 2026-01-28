require('dotenv').config();
const { BigQuery } = require('@google-cloud/bigquery');

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const bigquery = new BigQuery({
  projectId: 'lala4-377416',
  credentials,
});

const location = 'southamerica-east1';
const YEAR = 2025;

async function runQuery() {
  const segments = ['TSP', 'ELITE', 'DSD'];
  
  for (const segment of segments) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TOP 10 DISTRIBUIDORAS - ' + segment);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const [results] = await bigquery.query({
      query: `
        SELECT
          group_name as distribuidora,
          group_code as codigo,
          COUNT(DISTINCT participant_id) as vendedores,
          ROUND(AVG(CASE WHEN target > 0 THEN (achieved / target) * 100 ELSE NULL END), 2) as cumplimiento_pct,
          SUM(points) as puntos_ganados
        FROM \`lala4-377416.lala4.nesforce_results\`
        WHERE result_year = ${YEAR}
          AND target > 0
          AND segment_name = '${segment}'
        GROUP BY group_name, group_code
        ORDER BY puntos_ganados DESC
        LIMIT 10
      `,
      location
    });
    
    console.log('#'.padEnd(4) + 'Distribuidora'.padEnd(40) + 'Vendedores'.padStart(12) + 'Cumpl.%'.padStart(10) + 'Puntos'.padStart(12));
    console.log('-'.repeat(78));
    results.forEach((r, i) => {
      console.log(
        (i + 1 + '.').padEnd(4) +
        r.distribuidora.substring(0, 39).padEnd(40) +
        r.vendedores.toString().padStart(12) +
        (r.cumplimiento_pct + '%').padStart(10) +
        r.puntos_ganados.toLocaleString().padStart(12)
      );
    });
  }
}

runQuery().catch(console.error);
