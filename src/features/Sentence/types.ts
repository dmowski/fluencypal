export interface Story {
  id: string;
  title: string;
  subtitle: string | null;

  videoUrl: string | null;
  audioUrl: string | null;
  imageUrl: string;

  textEn: string;
  sunoPrompt: string | null;
  videoDescription: string | null;

  isPublished: boolean;
}
