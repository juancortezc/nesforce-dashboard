import Head from 'next/head';
import { useState } from 'react';

interface TestResult {
  success: boolean;
  message: string;
  data?: {
    bigqueryConnected: boolean;
    resultsTableColumns?: string[];
    transactionsTableColumns?: string[];
    sampleResults?: unknown[];
    sampleTransactions?: unknown[];
  };
  error?: string;
}

export default function Home() {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error al conectar con el servidor',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Nesforce Dashboard</title>
        <meta name="description" content="Dashboard de analítica para Nesforce" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Nesforce Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Dashboard de Analítica - Nestle
            </p>
          </div>

          {/* Welcome Card */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenido al Dashboard de Nesforce
              </h2>
              <p className="text-gray-600">
                Sistema de análisis de datos conectado a BigQuery
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">Dataset</h3>
                <p className="text-sm text-blue-700">lala4-377416.lala4</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="font-semibold text-purple-900 mb-2">Ubicación</h3>
                <p className="text-sm text-purple-700">southamerica-east1</p>
              </div>
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-2">Tabla 1</h3>
                <p className="text-sm text-green-700">nesforce_results</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-6">
                <h3 className="font-semibold text-amber-900 mb-2">Tabla 2</h3>
                <p className="text-sm text-amber-700">nestle_transactions</p>
              </div>
            </div>

            {/* Test Connection Button */}
            <div className="text-center">
              <button
                onClick={testConnection}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Probando conexión...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Probar Conexión a BigQuery
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Test Results */}
          {testResult && (
            <div className="max-w-4xl mx-auto">
              <div
                className={`rounded-2xl shadow-xl p-8 ${
                  testResult.success
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-red-50 border-2 border-red-200'
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {testResult.success ? (
                      <svg
                        className="h-8 w-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-8 w-8 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3
                      className={`text-lg font-semibold ${
                        testResult.success ? 'text-green-900' : 'text-red-900'
                      }`}
                    >
                      {testResult.message}
                    </h3>
                    {testResult.error && (
                      <p className="mt-2 text-sm text-red-700">{testResult.error}</p>
                    )}

                    {testResult.data && (
                      <div className="mt-4 space-y-4">
                        {testResult.data.resultsTableColumns && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Columnas de nesforce_results ({testResult.data.resultsTableColumns.length}):
                            </h4>
                            <div className="bg-white rounded p-3 text-sm text-gray-700">
                              {testResult.data.resultsTableColumns.join(', ')}
                            </div>
                          </div>
                        )}

                        {testResult.data.transactionsTableColumns && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Columnas de nestle_transactions ({testResult.data.transactionsTableColumns.length}):
                            </h4>
                            <div className="bg-white rounded p-3 text-sm text-gray-700">
                              {testResult.data.transactionsTableColumns.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Próximos Pasos
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold mr-4">
                    1
                  </span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Configurar Variables de Entorno</h4>
                    <p className="text-gray-600 text-sm">
                      Copia .env.example a .env y agrega tus credenciales de BigQuery
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold mr-4">
                    2
                  </span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Probar Conexión</h4>
                    <p className="text-gray-600 text-sm">
                      Usa el botón de arriba para verificar la conexión a BigQuery
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold mr-4">
                    3
                  </span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Desarrollar Dashboard</h4>
                    <p className="text-gray-600 text-sm">
                      Crea tus vistas y componentes personalizados
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
