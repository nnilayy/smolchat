import {
  Globe,
  YoutubeLogo,
  Link,
  Calculator,
  UploadSimple,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

export type TExample = {
  title: string;
  prompt: string;
  color: string;
  icon: JSX.Element;
};

export const ChatExamples = ({
  onClick,
}: {
  onClick: (example: TExample) => void;
}) => {
  const examples: TExample[] = [
    {
      title: "Search Web",
      prompt: "What is the 'May I meet you' meme smolchat, search online",
      color:
        "bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400",
      icon: <Globe size={24} weight="duotone" />,
    },
    {
      title: "Youtube Search",
      prompt:
        "Yo smolchat, Summarize this video by the Trash Taste boys: https://www.youtube.com/watch?v=Mx_Ngua4NW4",
      color:
        "bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400",
      icon: <YoutubeLogo size={24} weight="duotone" />,
    },
    {
      title: "Search Any WebPage",
      prompt: "Analyze the findings of this research paper: https://arxiv.org/abs/2511.13954",
      color:
        "bg-green-50 hover:bg-green-100 dark:bg-green-500/10 dark:hover:bg-green-500/20 border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400",
      icon: <Link size={24} weight="duotone" />,
    },
    {
      title: "Wolfram Alpha",
      prompt: "Generate a visualization of the Mandelbrot set and explain the math behind it.",
      color:
        "bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-400",
      icon: <Calculator size={24} weight="duotone" />,
    },
    {
      title: "Chat with Docs",
      prompt:
        "Hey smolchat, can you analyze this document and summarize its contents?",
      color:
        "bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-400",
      icon: <UploadSimple size={24} weight="duotone" />,
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 w-full max-w-4xl px-4 mt-4">
      {examples.map((example, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: index * 0.15, duration: 0.5 } }}
          className={`flex flex-col gap-2 p-4 rounded-3xl border cursor-pointer transition-all duration-300 active:opacity-60 w-full sm:w-[calc(50%-0.75rem)] md:w-[calc(33.33%-0.75rem)] ${example.color}`}
          onClick={() => onClick(example)}
        >
          <div className="flex items-center gap-2 mb-1">
            {example.icon}
            <span className="font-semibold text-sm">{example.title}</span>
          </div>
          <p className="text-xs opacity-80 line-clamp-2">{example.prompt}</p>
        </motion.div>
      ))}
    </div>
  );
};
