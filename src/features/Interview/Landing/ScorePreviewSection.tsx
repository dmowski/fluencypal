export interface ScoreMetric {
  title: string;
  score: number;
}

export interface ScorePreview {
  totalScore: number;
  buttonTitle: string;
  buttonHref: string;
  label: string;
  description: string;
  scoreMetrics: ScoreMetric[];
}

export interface ScorePreviewSectionProps {
  title: string;
  subtitle: string;
  infoList: string[];
  buttonTitle: string;
  buttonHref: string;
  scorePreview: ScorePreview;
}

/** Interview Landing Score Preview Section */
export const ScorePreviewSection = ({}: ScorePreviewSectionProps) => {
  return <></>;
};
