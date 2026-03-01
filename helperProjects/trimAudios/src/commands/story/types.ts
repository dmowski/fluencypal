export interface Story {
  id: string;
  title: string;
  subtitle: string | null;

  videoUrl: string | null;
  originalVideoUrl?: string | null;

  audioUrl: string | null;
  imageUrl: string;

  storySystemInstruction: string | null;
  textEn: string;
  sunoPrompt: string | null;
  videoDescription: string | null;

  isPublished: boolean;
  createdAtIso: string;
  updatedAtIso: string;
}

export type OriginVideoFile = {
  hash: string;
  filePath: string;
  fileName: string;
};
