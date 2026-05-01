export interface Character {
  id?: string;
  name: string;
  appearance: string;
}

export interface StoryPage {
  pageNumber: number;
  storyText: string;
  imageBlob: Blob;
  prompt: string;
}

export interface PictureBook {
  id: string;
  title: string;
  characters: Character[];
  pages: StoryPage[];
  coverImageBlob: Blob;
  createdAt: Date;
}

export interface StoryPageDraft {
  pageNumber: number;
  storyText: string;
  imagePrompt: string;
}

export interface GeneratedStory {
  title: string;
  pages: StoryPageDraft[];
}

export interface CreateFormData {
  characters: Character[];
  plot: string;
}
