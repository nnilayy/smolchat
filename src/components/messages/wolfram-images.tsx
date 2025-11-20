import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft01Icon, ArrowRight01Icon } from "hugeicons-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export const WolframImages = ({ content }: { content: string }) => {
  const extractImages = (text: string) => {
    const matches = new Set<string>();

    // Support both [image: URL] and image: URL formats
    const explicitRegex = /(?:\[image:\s*|image:\s*)(https?:\/\/[^\s\]]+)(?:\])?/g;
    let match;
    while ((match = explicitRegex.exec(text)) !== null) {
      matches.add(match[1]);
    }

    // Support direct image links ending in common extensions
    const extensionRegex = /(https?:\/\/[^\s<>"')]+\.(?:png|jpg|jpeg|gif|webp|svg))/gi;
    while ((match = extensionRegex.exec(text)) !== null) {
      matches.add(match[1]);
    }

    return Array.from(matches);
  };

  const images = extractImages(content);

  if (images.length === 0) {
    return null;
  }

  if (images.length === 1) {
    return (
      <div className="w-full mt-4 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
        <img
          src={images[0]}
          alt="Wolfram Alpha Result"
          className="w-full h-auto object-contain bg-white"
        />
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 w-full">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800"
          >
            <img
              src={img}
              alt={`Wolfram Alpha Result ${idx + 1}`}
              className="w-full h-auto object-contain bg-white"
            />
          </div>
        ))}
      </div>
    );
  }

  return <ImageSlider images={images} />;
};

const ImageSlider = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full mt-4 group">
      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`Wolfram Alpha Result ${currentIndex + 1}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full object-contain"
          />
        </AnimatePresence>
      </div>

      <div className="absolute inset-y-0 left-0 flex items-center pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="secondary"
          size="iconSm"
          className="rounded-full bg-black/50 hover:bg-black/70 text-white border-none"
          onClick={prev}
        >
          <ArrowLeft01Icon size={16} />
        </Button>
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="secondary"
          size="iconSm"
          className="rounded-full bg-black/50 hover:bg-black/70 text-white border-none"
          onClick={next}
        >
          <ArrowRight01Icon size={16} />
        </Button>
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {images.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors",
              idx === currentIndex ? "bg-black dark:bg-white" : "bg-black/20 dark:bg-white/20"
            )}
          />
        ))}
      </div>
    </div>
  );
};
