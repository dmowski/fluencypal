export interface BookMetadata {
  title: string;
  subtitle: string;
  author: string;
}

export interface ConvertDocToTextResponse {
  metadata?: BookMetadata;
  error?: string;
}
