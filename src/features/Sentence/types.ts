export interface Story {
  id: string;
  title: string;
  subtitle?: string;

  videoUrl?: string;
  audioUrl?: string;
  imageUrl: string;

  textEn: string;
}
