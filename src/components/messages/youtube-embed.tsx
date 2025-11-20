import { useMemo } from "react";

export const YouTubeEmbed = ({ content }: { content: string }) => {
  const videoIds = useMemo(() => {
    if (!content) return [];
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/g;
    const matches = new Set<string>();
    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.add(match[1]);
    }
    return Array.from(matches);
  }, [content]);

  if (!videoIds.length) return null;

  return (
    <div className="flex flex-col gap-4 mt-4 w-full">
      {videoIds.map((id) => (
        <div
          key={id}
          className="relative w-full aspect-video rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-black"
        >
          <iframe
            src={`https://www.youtube.com/embed/${id}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      ))}
    </div>
  );
};
