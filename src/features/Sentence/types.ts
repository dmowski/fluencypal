export interface StoryPart {
  textEn: string;
  imageUrl?: string;
}

export interface Story {
  id: string;
  title: string;

  videoUrl?: string;
  audioUrl?: string;
  imageUrl: string;

  parts: StoryPart[];
}
