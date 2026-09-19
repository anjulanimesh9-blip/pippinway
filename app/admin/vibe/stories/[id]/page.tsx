import StoryEditor from "./StoryEditor";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminStoryPage({ params }: PageProps) {
  const { id } = await params;
  return <StoryEditor storyId={id} />;
}
