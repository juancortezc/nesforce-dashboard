require('dotenv').config();
const { BigQuery } = require('@google-cloud/bigquery');
const fs = require('fs');

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const bigquery = new BigQuery({
  projectId: 'lala4-377416',
  credentials,
});

const location = 'southamerica-east1';
const PROGRAM_ID = 28;
const YEAR = 2025;

function arrayToCSV(data) {
  return data.map(row =>
    row.map(cell => {
      if (cell === null || cell === undefined) return '';
      const str = String(cell);
      // Escapar comillas y envolver en comillas si contiene comas o saltos de línea
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }).join(',')
  ).join('\n');
}

async function exportToCSV() {
  const csvFiles = [];

  // 1. Cumplimiento por segmento
  console.log('Exportando cumplimiento por segmento...');
  const [compliance] = await bigquery.query({
    query: `
      SELECT
        segment_name,
        COUNT(DISTINCT participant_id) as total_participantes,
        ROUND(AVG(CASE WHEN target > 0 THEN (achieved / target) * 100 ELSE NULL END), 2) as cumplimiento_promedio_pct,
        SUM(points) as puntos_totales_ganados
      FROM \`lala4-377416.lala4.nesforce_results\`
      WHERE result_year = ${YEAR}
        AND target > 0
      GROUP BY segment_name
      ORDER BY cumplimiento_promedio_pct DESC
    `,
    location
  });

  const complianceCSV = [
    ['Segmento', 'Participantes', 'Cumplimiento %', 'Puntos Ganados'],
    ...compliance.map(r => [r.segment_name, r.total_participantes, r.cumplimiento_promedio_pct, r.puntos_totales_ganados])
  ];
  fs.writeFileSync('1_cumplimiento_segmento.csv', arrayToCSV(complianceCSV));
  csvFiles.push('1_cumplimiento_segmento.csv');

  // 2. Cumplimiento por KPI para cada segmento
  console.log('Exportando cumplimiento por KPI...');
  const segments = ['TSP', 'ELITE', 'DSD'];

  for (const segment of segments) {
    const [kpiResults] = await bigquery.query({
      query: `
        SELECT
          kpi_name,
          COUNT(DISTINCT participant_id) as participantes,
          ROUND(AVG(CASE WHEN target > 0 THEN (achieved / target) * 100 ELSE NULL END), 2) as cumplimiento_pct,
          SUM(points) as puntos_ganados
        FROM \`lala4-377416.lala4.nesforce_results\`
        WHERE result_year = ${YEAR}
          AND segment_name = '${segment}'
          AND target > 0
        GROUP BY kpi_name
        ORDER BY puntos_ganados DESC
      `,
      location
    });

    const kpiCSV = [
      ['KPI', 'Participantes', 'Cumplimiento %', 'Puntos'],
      ...kpiResults.map(r => [r.kpi_name || 'Sin nombre', r.participantes, r.cumplimiento_pct || 0, r.puntos_ganados || 0])
    ];
    fs.writeFileSync(`2_kpi_${segment}.csv`, arrayToCSV(kpiCSV));
    csvFiles.push(`2_kpi_${segment}.csv`);
  }

  // 3. Vendedores que ganaron puntos
  console.log('Exportando vendedores...');
  const [earnedPoints] = await bigquery.query({
    query: `
      SELECT
        segment_name,
        COUNT(DISTINCT participant_id) as vendedores_con_puntos,
        SUM(points) as total_puntos
      FROM \`lala4-377416.lala4.nesforce_results\`
      WHERE result_year = ${YEAR}
        AND points > 0
      GROUP BY segment_name
      ORDER BY vendedores_con_puntos DESC
    `,
    location
  });

  const vendedoresCSV = [
    ['Segmento', 'Vendedores con Puntos', 'Total Puntos'],
    ...earnedPoints.map(r => [r.segment_name, r.vendedores_con_puntos, r.total_puntos])
  ];
  fs.writeFileSync('3_vendedores_puntos.csv', arrayToCSV(vendedoresCSV));
  csvFiles.push('3_vendedores_puntos.csv');

  // 4. Vendedores que canjearon
  const [redeemed] = await bigquery.query({
    query: `
      SELECT
        COALESCE(nf.segment_name, 'Sin segmento') as segment_name,
        COUNT(DISTINCT r.request_participant_id) as vendedores_con_canjes,
        COUNT(*) as total_canjes,
        SUM(r.request_points) as puntos_canjeados
      FROM \`lala4-377416.lala4.nestjsRequests\` r
      LEFT JOIN (
        SELECT DISTINCT participant_id, segment_name
        FROM \`lala4-377416.lala4.nesforce_results\`
        WHERE result_year = ${YEAR}
      ) nf ON r.request_participant_id = nf.participant_id
      WHERE r.participant_program_id = ${PROGRAM_ID}
        AND r.request_status IN ("DELIVERED", "APPROVED", "ORDERED", "DISPATCHED", "REQUESTED")
        AND EXTRACT(YEAR FROM r.request_requested_at) = ${YEAR}
      GROUP BY nf.segment_name
      ORDER BY vendedores_con_canjes DESC
    `,
    location
  });

  const canjesCSV = [
    ['Segmento', 'Vendedores', 'Canjes', 'Puntos Canjeados'],
    ...redeemed.map(r => [r.segment_name, r.vendedores_con_canjes, r.total_canjes, r.puntos_canjeados || 0])
  ];
  fs.writeFileSync('4_vendedores_canjes.csv', arrayToCSV(canjesCSV));
  csvFiles.push('4_vendedores_canjes.csv');

  // 5. Categorías de premios
  console.log('Exportando categorías de premios...');
  const [categories] = await bigquery.query({
    query: `
      SELECT
        COALESCE(award_categories, 'Sin categoría') as categoria,
        COUNT(*) as cantidad_canjes,
        SUM(request_points) as puntos_usados,
        ROUND(SUM(request_used_cost), 2) as costo_total_usd
      FROM \`lala4-377416.lala4.nestjsRequests\`
      WHERE participant_program_id = ${PROGRAM_ID}
        AND request_status IN ("DELIVERED", "APPROVED", "ORDERED", "DISPATCHED", "REQUESTED")
        AND EXTRACT(YEAR FROM request_requested_at) = ${YEAR}
      GROUP BY award_categories
      ORDER BY cantidad_canjes DESC
    `,
    location
  });

  const categoriasCSV = [
    ['Categoría', 'Canjes', 'Puntos Usados', 'Costo USD'],
    ...categories.map(r => [r.categoria, r.cantidad_canjes, r.puntos_usados || 0, r.costo_total_usd || 0])
  ];
  fs.writeFileSync('5_categorias_premios.csv', arrayToCSV(categoriasCSV));
  csvFiles.push('5_categorias_premios.csv');

  // 6. Top premios canjeados
  console.log('Exportando top premios...');
  const [topRedeemed] = await bigquery.query({
    query: `
      SELECT
        award_name,
        award_categories as categoria,
        COUNT(*) as cantidad_canjes,
        SUM(request_points) as puntos_usados,
        MAX(request_used_cost) as costo_usd
      FROM \`lala4-377416.lala4.nestjsRequests\`
      WHERE participant_program_id = ${PROGRAM_ID}
        AND request_status IN ("DELIVERED", "APPROVED", "ORDERED", "DISPATCHED", "REQUESTED")
        AND EXTRACT(YEAR FROM request_requested_at) = ${YEAR}
      GROUP BY award_name, award_categories
      ORDER BY cantidad_canjes DESC
      LIMIT 50
    `,
    location
  });

  const premiosCSV = [
    ['Premio', 'Categoría', 'Canjes', 'Puntos Usados', 'Costo USD'],
    ...topRedeemed.map(r => [r.award_name, r.categoria || '-', r.cantidad_canjes, r.puntos_usados || 0, r.costo_usd || 0])
  ];
  fs.writeFileSync('6_top_premios.csv', arrayToCSV(premiosCSV));
  csvFiles.push('6_top_premios.csv');

  // 7. Distribuidoras por segmento
  console.log('Exportando distribuidoras...');
  for (const segment of segments) {
    const [distResults] = await bigquery.query({
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
      `,
      location
    });

    const distCSV = [
      ['Distribuidora', 'Código', 'Vendedores', 'Cumplimiento %', 'Puntos'],
      ...distResults.map(r => [r.distribuidora, r.codigo, r.vendedores, r.cumplimiento_pct || 0, r.puntos_ganados || 0])
    ];
    fs.writeFileSync(`7_distribuidoras_${segment}.csv`, arrayToCSV(distCSV));
    csvFiles.push(`7_distribuidoras_${segment}.csv`);
  }

  console.log('\n✅ Exportación completada!');
  console.log('\nArchivos CSV generados:');
  csvFiles.forEach(f => console.log('  - ' + f));
  console.log('\n📊 Para importar a Google Sheets:');
  console.log('1. Ve a https://sheets.google.com');
  console.log('2. Archivo > Importar > Subir');
  console.log('3. Selecciona cada archivo CSV');
  console.log('4. Elige "Reemplazar hoja de cálculo actual" o "Insertar nuevas hojas"');
}

exportToCSV().catch(console.error);
