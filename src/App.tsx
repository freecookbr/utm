import React, { useState, useEffect } from 'react';
import { FileDown, Link as LinkIcon, RefreshCw, Copy, Trash2 } from 'lucide-react';
import { UTM_OPTIONS } from './constants';
import { generateUTMUrl, exportToExcel } from './utils';
import type { UTMParams, GeneratedLink } from './types';

function App() {
  const [urls, setUrls] = useState<string[]>([]);
  const [searchUrl, setSearchUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedLinks, setGeneratedLinks] = useState<GeneratedLink[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [utmParams, setUtmParams] = useState<UTMParams>({
    utm_source: UTM_OPTIONS.utm_source[0],
    utm_medium: UTM_OPTIONS.utm_medium[0],
    utm_campaign: UTM_OPTIONS.utm_campaign[0],
    utm_content: UTM_OPTIONS.utm_content[0]
  });

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        setLoading(true);
        const response = await fetch(import.meta.env.VITE_PRODUCT_LIST_URL);
        const text = await response.text();
        setUrls(text.split('\n').filter(url => url.trim()));
      } catch (error) {
        console.error('Error fetching URLs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUrls();
  }, []);

  const handleParamChange = (param: keyof UTMParams, value: string) => {
    setUtmParams(prev => ({ ...prev, [param]: value }));
  };

  const handleGenerateUTM = () => {
    const urlsToGenerate = searchUrl ? [searchUrl] : urls;
    const links = urlsToGenerate.map(url => ({
      originalUrl: url,
      utmUrl: generateUTMUrl(url, utmParams),
      params: { ...utmParams }
    }));
    setGeneratedLinks(links);
  };

  const handleCopyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleClearForm = () => {
    setSearchUrl('');
    setGeneratedLinks([]);
    setUtmParams({
      utm_source: UTM_OPTIONS.utm_source[0],
      utm_medium: UTM_OPTIONS.utm_medium[0],
      utm_campaign: UTM_OPTIONS.utm_campaign[0],
      utm_content: UTM_OPTIONS.utm_content[0]
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <LinkIcon className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Gerador de Links UTM Freecook</h1>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL do Produto
            </label>
            <input
              type="text"
              value={searchUrl}
              onChange={(e) => setSearchUrl(e.target.value)}
              placeholder="Digite ou cole a URL do produto"
              list="urls-list"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-[7px]"
            />
            <datalist id="urls-list">
              {urls.map((url) => (
                <option key={url} value={url} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {(Object.keys(UTM_OPTIONS) as Array<keyof typeof UTM_OPTIONS>).map((param) => (
              <div key={param} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {param.replace('utm_', '').toUpperCase()}
                </label>
                <select
                  value={utmParams[param as keyof UTMParams]}
                  onChange={(e) => handleParamChange(param as keyof UTMParams, e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-[7px]"
                >
                  {UTM_OPTIONS[param].map((option) => (
                    <option key={option} value={option}>
                      {option.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleGenerateUTM}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Gerar UTM
            </button>

            <button
              onClick={() => exportToExcel(generatedLinks)}
              disabled={generatedLinks.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <FileDown className="h-4 w-4" />
              Baixar Excel
            </button>

            <button
              onClick={handleClearForm}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Limpar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando URLs...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4">Links UTM Gerados</h2>
            {generatedLinks.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Link UTM
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {generatedLinks.map((link, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-normal break-all">
                        <a
                          href={link.utmUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {link.utmUrl}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleCopyToClipboard(link.utmUrl, index)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          <Copy className="h-4 w-4" />
                          {copiedIndex === index ? 'Copiado!' : 'Copiar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Digite uma URL e clique em "Gerar UTM" para ver os links aqui.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;