require('dotenv').config();
const { BigQuery } = require('@google-cloud/bigquery');
const fs = require('fs');

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const bigquery = new BigQuery({
  projectId: 'lala4-377416',
  credentials,
});

const location = 'southamerica-east1';
const YEAR = 2025;

function arrayToCSV(data) {
  return data.map(row =>
    row.map(cell => {
      if (cell === null || cell === undefined) return '';
      const str = String(cell);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }).join(',')
  ).join('\n');
}

async function runReport() {
  console.log('Generando reporte por categoría KPI...\n');

  const allData = [
    ['Segmento', 'Categoría KPI', 'Participantes', 'Cumplimiento %', 'Puntos Ganados']
  ];

  const segments = ['TSP', 'ELITE', 'DSD'];

  for (const segment of segments) {
    const [results] = await bigquery.query({
      query: `
        WITH categorized AS (
          SELECT
            CASE
              -- SELL OUT (Sell Out / Presupuesto)
              WHEN UPPER(kpi_reference_code) LIKE '%SELL-OUT%'
                OR UPPER(kpi_name) LIKE '%PRESUPUESTO%' THEN 'SELL OUT'

              -- INNOVACIONES (productos nuevos/especiales)
              WHEN UPPER(kpi_reference_code) LIKE '%AMOR%'
                OR UPPER(kpi_reference_code) LIKE '%TABLETA%'
                OR UPPER(kpi_reference_code) LIKE '%CHOCOWAFFER%'
                OR UPPER(kpi_reference_code) LIKE '%CHOCOFACTASTICOS%'
                OR UPPER(kpi_reference_code) LIKE '%CHOCOBISCUIT%'
                OR UPPER(kpi_reference_code) LIKE '%CHOCOTRIO%'
                OR UPPER(kpi_reference_code) LIKE '%KIT-KAT%'
                OR UPPER(kpi_name) LIKE '%AMOR%'
                OR UPPER(kpi_name) LIKE '%TABLETA%'
                OR UPPER(kpi_name) LIKE '%CHOCOWAFFER%'
                OR UPPER(kpi_name) LIKE '%KIT KAT%'
                OR UPPER(kpi_name) LIKE '%CHOCOFANTÁSTICOS%' THEN 'INNOVACIONES'

              -- CLIENTES COMPRAN (todas las demás categorías de productos)
              WHEN UPPER(kpi_reference_code) LIKE '%CAFE%'
                OR UPPER(kpi_reference_code) LIKE '%CALDOS%'
                OR UPPER(kpi_reference_code) LIKE '%CEREAL%'
                OR UPPER(kpi_reference_code) LIKE '%GALLETA%'
                OR UPPER(kpi_reference_code) LIKE '%GUMS%'
                OR UPPER(kpi_reference_code) LIKE '%GRANOLA%'
                OR UPPER(kpi_reference_code) LIKE '%PURINA%'
                OR UPPER(kpi_reference_code) LIKE '%MAGGI%'
                OR UPPER(kpi_reference_code) LIKE '%ACHIOTE%'
                OR UPPER(kpi_reference_code) LIKE '%SAZON%'
                OR UPPER(kpi_reference_code) LIKE '%SALSAS%'
                OR UPPER(kpi_reference_code) LIKE '%NUTRICION%'
                OR UPPER(kpi_reference_code) LIKE '%TERRAFERTIL%'
                OR UPPER(kpi_reference_code) LIKE '%CHOCOLATE%'
                OR UPPER(kpi_reference_code) LIKE '%SNACK%'
                OR UPPER(kpi_name) LIKE '%CAFE%'
                OR UPPER(kpi_name) LIKE '%CALDOS%'
                OR UPPER(kpi_name) LIKE '%CEREAL%'
                OR UPPER(kpi_name) LIKE '%GALLETA%'
                OR UPPER(kpi_name) LIKE '%WAFFER%'
                OR UPPER(kpi_name) LIKE '%RICAS%'
                OR UPPER(kpi_name) LIKE '%ZOOLOGIA%'
                OR UPPER(kpi_name) LIKE '%MARIA%'
                OR UPPER(kpi_name) LIKE '%VAINILLA%'
                OR UPPER(kpi_name) LIKE '%GUMS%'
                OR UPPER(kpi_name) LIKE '%GRANOLA%'
                OR UPPER(kpi_name) LIKE '%PURINA%'
                OR UPPER(kpi_name) LIKE '%MAGGI%'
                OR UPPER(kpi_name) LIKE '%SAZÓN%'
                OR UPPER(kpi_name) LIKE '%SALSAS%'
                OR UPPER(kpi_name) LIKE '%MAYONESA%'
                OR UPPER(kpi_name) LIKE '%NUTRICION%'
                OR UPPER(kpi_name) LIKE '%TERRAFERTIL%'
                OR UPPER(kpi_name) LIKE '%CHOCOLATE%'
                OR UPPER(kpi_name) LIKE '%SNACK%' THEN 'CLIENTES COMPRAN'

              ELSE 'Otros'
            END as categoria_kpi,
            participant_id,
            target,
            achieved,
            points
          FROM \`lala4-377416.lala4.nesforce_results\`
          WHERE result_year = ${YEAR}
            AND segment_name = '${segment}'
            AND target > 0
        )
        SELECT
          categoria_kpi,
          COUNT(DISTINCT participant_id) as participantes,
          ROUND(AVG((achieved / target) * 100), 2) as cumplimiento_pct,
          SUM(points) as puntos_ganados
        FROM categorized
        GROUP BY categoria_kpi
        ORDER BY puntos_ganados DESC
      `,
      location
    });

    results.forEach(r => {
      allData.push([
        segment,
        r.categoria_kpi,
        r.participantes,
        r.cumplimiento_pct || 0,
        r.puntos_ganados || 0
      ]);
    });
  }

  // Guardar CSV
  const csvContent = arrayToCSV(allData);
  fs.writeFileSync('categorias_kpi.csv', csvContent);

  console.log('✅ Archivo generado: categorias_kpi.csv');
  console.log(`   Total de filas: ${allData.length - 1}`);
  console.log('\n📊 Para ver como tabla:');
  console.log('   - Abre el archivo en Excel o Google Sheets');
  console.log('   - O usa: column -t -s, categorias_kpi.csv (en terminal)\n');
}

runReport().catch(console.error);
