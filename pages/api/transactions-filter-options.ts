import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

interface FilterOptions {
  categories: string[];
  sapCodes: string[];
  subcategories: string[];
  distributors: { code: string; name: string }[];
}

interface FilterOptionsResponse {
  success: boolean;
  data?: FilterOptions;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FilterOptionsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Get distinct categories
    const categoriesQuery = `
      SELECT DISTINCT categoria
      FROM ${TABLES.TRANSACTIONS}
      WHERE categoria IS NOT NULL
      ORDER BY categoria
    `;

    // Get distinct SAP codes (top 100 most common)
    const sapCodesQuery = `
      SELECT DISTINCT clean_cod_sap
      FROM ${TABLES.TRANSACTIONS}
      WHERE clean_cod_sap IS NOT NULL
      ORDER BY clean_cod_sap
      LIMIT 100
    `;

    // Get distinct subcategories
    const subcategoriesQuery = `
      SELECT DISTINCT sku_subcategoria_name
      FROM ${TABLES.TRANSACTIONS}
      WHERE sku_subcategoria_name IS NOT NULL
      ORDER BY sku_subcategoria_name
    `;

    // Get distinct distributors
    const distributorsQuery = `
      SELECT DISTINCT
        cod_distribuidor as code,
        distribuidor as name
      FROM ${TABLES.TRANSACTIONS}
      WHERE cod_distribuidor IS NOT NULL
        AND distribuidor IS NOT NULL
      ORDER BY distribuidor
    `;

    const [categoriesRows, sapCodesRows, subcategoriesRows, distributorsRows] = await Promise.all([
      executeQuery(categoriesQuery),
      executeQuery(sapCodesQuery),
      executeQuery(subcategoriesQuery),
      executeQuery(distributorsQuery),
    ]);

    const filterOptions: FilterOptions = {
      categories: categoriesRows.map((row: any) => row.categoria),
      sapCodes: sapCodesRows.map((row: any) => row.clean_cod_sap),
      subcategories: subcategoriesRows.map((row: any) => row.sku_subcategoria_name),
      distributors: distributorsRows.map((row: any) => ({
        code: row.code,
        name: row.name,
      })),
    };

    return res.status(200).json({
      success: true,
      data: filterOptions,
    });
  } catch (error) {
    console.error('Error fetching transaction filter options:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
