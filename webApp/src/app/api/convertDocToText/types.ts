export interface BookMetadata {
  title: string;
  subtitle: string;
  author: string;
}

export interface ConvertDocToTextResponse {
  markdown?: string;
  metadata?: BookMetadata;
  imageDataUrlByHref?: Record<string, string>;
  error?: string;
}
