export interface UTMParams {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
}

export interface GeneratedLink {
  originalUrl: string;
  utmUrl: string;
  params: UTMParams;
}