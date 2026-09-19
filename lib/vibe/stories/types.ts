export type StoryChoice = {
  id: string;
  label: string;
  destinationId: string;
};

export type StoryScene = {
  id: string;
  title: string;
  time: string;
  location: string;
  text: string;
  choices: StoryChoice[];
  isEnding: boolean;
  arriveFrom?: Record<string, string>;
  imageUrl?: string;
  imagePath?: string;
};

export type InteractiveStory = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  introduction: string;
  coverImageUrl: string;
  coverImagePath: string;
  startSceneId: string;
  published: boolean;
  scenes: StoryScene[];
  createdAt?: unknown;
  updatedAt?: unknown;
  createdBy?: string;
};

export type StoryProgress = {
  sceneId: string;
  path: string[];
};
