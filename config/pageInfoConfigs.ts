import { PageInfoConfig } from '@/components/PageInfoDialog';

export const pointsPageInfo: PageInfoConfig = {
  title: 'Puntos',
  dataSources: [
    {
      dataset: 'nesforce',
      table: 'results_nesforce',
      description: 'Vista que contiene los resultados de KPIs por participante, incluyendo metas, logros y puntos asignados.',
    },
  ],
  calculations: [
    {
      name: 'Total Puntos',
      description: 'Suma de todos los puntos ganados por los participantes en el período seleccionado.',
      formula: 'SUM(points)',
    },
    {
      name: 'Puntos por Participante',
      description: 'Promedio de puntos por participante activo.',
      formula: 'SUM(points) / COUNT(DISTINCT participant_id)',
    },
    {
      name: '% Logro',
      description: 'Porcentaje de cumplimiento de la meta. Indica qué tanto se alcanzó del objetivo establecido.',
      formula: '(SUM(achieved) / SUM(target)) × 100',
    },
    {
      name: 'Distribución por Segmento',
      description: 'Puntos totales agrupados por cada segmento de negocio (TSP, Autoservicios, etc.).',
    },
  ],
  filters: [
    {
      name: 'Rango de Fechas',
      description: 'Filtra los datos según el mes y año de inicio/fin seleccionados en el header.',
    },
    {
      name: 'Datos con resultados completos',
      description: 'Solo se muestran registros donde existe un valor de "achieved" (logro). Los meses sin resultados cargados no aparecen.',
      isExclusion: true,
    },
  ],
  notes: [
    'Los puntos se asignan según el nivel de cumplimiento de cada KPI.',
    'Un participante puede tener múltiples KPIs y acumular puntos de cada uno.',
  ],
};

export const transactionsPageInfo: PageInfoConfig = {
  title: 'Transacciones',
  dataSources: [
    {
      dataset: 'nesforce',
      table: 'transactions_nesforce',
      description: 'Tabla de transacciones de venta que contiene información de productos, distribuidores, cantidades y valores.',
    },
  ],
  calculations: [
    {
      name: 'Total Ventas',
      description: 'Suma del valor de todas las transacciones sin IVA en el período.',
      formula: 'SUM(valor_s_iva)',
    },
    {
      name: 'Total Unidades',
      description: 'Cantidad total de unidades vendidas.',
      formula: 'SUM(und)',
    },
    {
      name: 'Ticket Promedio',
      description: 'Valor promedio por transacción.',
      formula: 'SUM(valor_s_iva) / COUNT(transacciones)',
    },
    {
      name: 'Ventas por Categoría',
      description: 'Agrupa las ventas por categoría de producto (sku_categoria_name).',
    },
    {
      name: 'Top Productos',
      description: 'Productos ordenados por cantidad de unidades vendidas.',
    },
    {
      name: 'Ventas por Distribuidor',
      description: 'Total de ventas agrupado por código y nombre de distribuidor.',
    },
  ],
  filters: [
    {
      name: 'Rango de Fechas',
      description: 'Filtra las transacciones según la fecha de la operación, usando el rango seleccionado en el header.',
    },
    {
      name: 'Formato de Fecha',
      description: 'Las fechas se parsean desde formato DD/MM/YYYY para comparación.',
    },
  ],
  notes: [
    'Los valores de venta son sin IVA (valor_s_iva).',
    'El top de productos se ordena por unidades vendidas, no por valor.',
  ],
};

export const resultsAnalysisPageInfo: PageInfoConfig = {
  title: 'Análisis de Resultados',
  dataSources: [
    {
      dataset: 'nesforce',
      table: 'results_nesforce',
      description: 'Vista de resultados que contiene el desempeño de cada participante por KPI, incluyendo metas y logros.',
    },
  ],
  calculations: [
    {
      name: 'Total Participantes',
      description: 'Cantidad de participantes únicos que tienen resultados en el período.',
      formula: 'COUNT(DISTINCT participant_id)',
    },
    {
      name: '% Logro Promedio',
      description: 'Porcentaje promedio de cumplimiento de metas de todos los participantes.',
      formula: '(SUM(achieved) / SUM(target)) × 100',
    },
    {
      name: 'Puntos Totales',
      description: 'Suma de todos los puntos ganados en el período seleccionado.',
      formula: 'SUM(points)',
    },
    {
      name: 'Top Performer',
      description: 'Participante con el mayor porcentaje de logro en el período.',
    },
    {
      name: 'Rendimiento por KPI',
      description: 'Muestra el cumplimiento promedio para cada KPI individual.',
    },
    {
      name: 'Comparación por Segmento',
      description: 'Compara el desempeño entre diferentes segmentos de negocio.',
    },
  ],
  filters: [
    {
      name: 'Cargo (Obligatorio)',
      description: 'Debe seleccionar un cargo (Vendedor, Supervisor, etc.). Los supervisores suman los resultados de sus vendedores.',
      isExclusion: false,
    },
    {
      name: 'Sin Vacacionistas',
      description: 'Se excluyen automáticamente los participantes con cargo "VACACIONISTA".',
      isExclusion: true,
    },
    {
      name: 'Solo datos completos',
      description: 'Solo se muestran registros donde "achieved" no es nulo. Los meses sin resultados cargados no aparecen.',
      isExclusion: true,
    },
    {
      name: 'Filtros en cascada',
      description: 'Región → Segmento → Distribuidor. Al cambiar región se resetean segmento y distribuidor.',
    },
  ],
  notes: [
    'El filtro de Cargo es obligatorio para ver datos.',
    'Los datos se muestran hasta el último mes con información completa.',
    'La tabla de Top Participantes muestra los 20 mejores por % de logro.',
  ],
};

export const program28PageInfo: PageInfoConfig = {
  title: 'Solicitudes (Programa 28)',
  dataSources: [
    {
      dataset: 'nesforce',
      table: 'requests_nesforce',
      description: 'Vista de solicitudes del programa de incentivos, incluyendo estados y montos.',
    },
  ],
  calculations: [
    {
      name: 'Total Solicitudes',
      description: 'Cantidad de solicitudes registradas en el período.',
      formula: 'COUNT(*)',
    },
    {
      name: 'Solicitudes Aprobadas',
      description: 'Cantidad de solicitudes con estado "Aprobado".',
    },
    {
      name: 'Solicitudes Pendientes',
      description: 'Cantidad de solicitudes en espera de revisión.',
    },
    {
      name: 'Monto Total',
      description: 'Suma de los montos de todas las solicitudes.',
    },
    {
      name: 'Distribución por Estado',
      description: 'Agrupa las solicitudes por su estado actual.',
    },
  ],
  filters: [
    {
      name: 'Filtros de página',
      description: 'Permite filtrar por región, segmento, distribuidor y estado de la solicitud.',
    },
  ],
  notes: [
    'Las solicitudes corresponden al programa de incentivos.',
    'Los estados pueden variar según el flujo de aprobación configurado.',
  ],
};

export const comparativesPageInfo: PageInfoConfig = {
  title: 'Comparativos',
  dataSources: [
    {
      dataset: 'nesforce',
      table: 'results_nesforce',
      description: 'Vista de resultados utilizada para comparar el desempeño entre períodos consecutivos.',
    },
  ],
  calculations: [
    {
      name: 'Total Achieved',
      description: 'Suma total de logros (achieved) en el período actual.',
      formula: 'SUM(achieved)',
    },
    {
      name: '% Cumplimiento',
      description: 'Porcentaje de cumplimiento de la meta en el período.',
      formula: '(SUM(achieved) / SUM(target)) × 100',
    },
    {
      name: 'Total Puntos',
      description: 'Suma de puntos ganados en el período actual.',
      formula: 'SUM(points)',
    },
    {
      name: 'Participantes',
      description: 'Cantidad de participantes únicos con resultados.',
      formula: 'COUNT(DISTINCT participant_id)',
    },
    {
      name: 'Variación (Δ)',
      description: 'Diferencia entre el período actual y el anterior.',
      formula: 'valor_actual - valor_anterior',
    },
    {
      name: 'Variación Porcentual',
      description: 'Cambio porcentual respecto al período anterior.',
      formula: '((valor_actual - valor_anterior) / valor_anterior) × 100',
    },
    {
      name: 'Tendencia Temporal',
      description: 'Gráfico que muestra la evolución de logros y cumplimiento a lo largo del tiempo.',
    },
  ],
  filters: [
    {
      name: 'Cargo (Obligatorio)',
      description: 'Debe seleccionar un cargo. Los supervisores suman los resultados de sus vendedores.',
      isExclusion: false,
    },
    {
      name: 'Sin Vacacionistas',
      description: 'Se excluyen automáticamente los participantes con cargo "VACACIONISTA".',
      isExclusion: true,
    },
    {
      name: 'Solo períodos con datos completos',
      description: 'Solo se consideran meses donde existe información de "achieved". Los meses sin resultados cargados (ej: Enero 2026) no se incluyen en las comparaciones.',
      isExclusion: true,
    },
    {
      name: 'Modo de Comparación',
      description: 'Mes a Mes compara el período actual vs el anterior. También disponible: Trimestre y YTD.',
    },
    {
      name: 'Filtros en cascada',
      description: 'Región → Segmento → Distribuidor. Al cambiar región se resetean los filtros dependientes.',
    },
  ],
  notes: [
    'Los datos se muestran hasta el último mes con información completa.',
    'El período "actual" es el más reciente con datos de achieved.',
    'Las comparaciones requieren al menos 2 períodos con datos.',
    'El cambio de ranking muestra si el distribuidor subió (↑) o bajó (↓) posiciones.',
  ],
};

export const logisticsPageInfo: PageInfoConfig = {
  title: 'Logística',
  dataSources: [
    {
      dataset: 'nesforce',
      table: 'transactions_nesforce',
      description: 'Datos de transacciones utilizados para análisis logístico y de distribución.',
    },
  ],
  calculations: [
    {
      name: 'Métricas de Distribución',
      description: 'Análisis de la distribución de productos por zona y canal.',
    },
    {
      name: 'Cobertura',
      description: 'Porcentaje de puntos de venta atendidos.',
    },
  ],
  filters: [
    {
      name: 'Filtros estándar',
      description: 'Región, segmento, distribuidor y período.',
    },
  ],
  notes: [
    'Esta página muestra métricas relacionadas con la operación logística.',
  ],
};
