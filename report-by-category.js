require('dotenv').config();
const { BigQuery } = require('@google-cloud/bigquery');

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const bigquery = new BigQuery({
  projectId: 'lala4-377416',
  credentials,
});

const location = 'southamerica-east1';
const YEAR = 2025;

async function runReport() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║    CUMPLIMIENTO POR CATEGORÍA KPI - NESFORCE 2025              ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const segments = ['TSP', 'ELITE', 'DSD'];

  for (const segment of segments) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`SEGMENTO: ${segment}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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

    // Table header
    console.log('┌─────────────────────────┬───────────────┬────────────┬──────────────┐');
    console.log('│ Categoría KPI           │ Participantes │ Cumpl.%    │ Puntos       │');
    console.log('├─────────────────────────┼───────────────┼────────────┼──────────────┤');

    results.forEach(r => {
      const cumplimiento = r.cumplimiento_pct || 0;
      const puntos = r.puntos_ganados || 0;
      console.log(
        '│ ' + r.categoria_kpi.padEnd(23) + ' │ ' +
        r.participantes.toString().padStart(13) + ' │ ' +
        (cumplimiento.toFixed(2) + '%').padStart(10) + ' │ ' +
        puntos.toLocaleString().padStart(12) + ' │'
      );
    });

    console.log('└─────────────────────────┴───────────────┴────────────┴──────────────┘');
  }

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                     FIN DEL REPORTE                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

runReport().catch(console.error);
