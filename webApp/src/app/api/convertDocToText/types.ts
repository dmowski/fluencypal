export interface BookMetadata {
  title: string;
  subtitle: string;
  author: string;
}

export interface ConvertDocToTextResponse {
  text?: string;
  metadata?: BookMetadata;
  error?: string;
}
