import { getDB } from "../core/firebase.js";

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

export async function runStories(): Promise<void> {
  try {
    const db = getDB();
    const cacheRef = db.collection("stories");

    const snapshot = await cacheRef.get();

    if (snapshot.empty) {
      console.log("[stories] No stories found");
      process.exitCode = 0;
      return;
    }

    const stories: Story[] = snapshot.docs.map((doc) => {
      const story = doc.data() as Partial<Story>;
      return {
        id: story.id ?? doc.id,
        ...story,
      } as Story;
    });

    console.log(`[stories] Found ${stories.length} stories`);
    for (const story of stories) {
      console.log(
        `[stories] id=${story.id}, title=${story.title}, published=${story.isPublished}, videoUrl=${story.videoUrl}`,
      );
    }

    process.exitCode = 0;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[stories] Failed to fetch stories");
    console.error(`[stories] reason: ${message}`);
    process.exitCode = 1;
  }
}
