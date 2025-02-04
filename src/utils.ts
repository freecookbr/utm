import { utils, writeFile } from 'xlsx';
import { GeneratedLink, UTMParams } from './types';

export const generateUTMUrl = (url: string, params: UTMParams): string => {
  const utmParams = new URLSearchParams({
    utm_source: params.utm_source,
    utm_medium: params.utm_medium,
    utm_campaign: params.utm_campaign,
    utm_content: params.utm_content
  });

  return `${url}${url.includes('?') ? '&' : '?'}${utmParams.toString()}`;
};

export const exportToExcel = (links: GeneratedLink[]) => {
  const worksheet = utils.json_to_sheet(
    links.map(link => ({
      'Produto (URL original)': link.originalUrl,
      'Link UTM Gerado': link.utmUrl,
      utm_source: link.params.utm_source,
      utm_medium: link.params.utm_medium,
      utm_campaign: link.params.utm_campaign,
      utm_content: link.params.utm_content
    }))
  );

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Links UTM');
  
  writeFile(workbook, 'links_utm_freecook.xlsx');
};