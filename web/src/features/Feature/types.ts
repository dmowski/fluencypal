export interface FeatureData {
  id: string;
  title: string;
  removed?: boolean;
  subTitle: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  content: string;
}

export interface FeaturesInfo {
  features: FeatureData[];
}
