import { TChatMessage } from "@/hooks";
import { Quotes } from "@phosphor-icons/react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type THumanMessage = {
  chatMessage: TChatMessage;
  isLast: boolean;
};

const getFileStyle = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "pdf":
      return {
        color: "bg-red-500",
        label: "PDF",
      };
    case "doc":
    case "docx":
      return {
        color: "bg-blue-500",
        label: "DOC",
      };
    case "xls":
    case "xlsx":
    case "csv":
      return {
        color: "bg-emerald-500",
        label: "XLS",
      };
    case "ppt":
    case "pptx":
      return {
        color: "bg-orange-500",
        label: "PPT",
      };
    case "txt":
    case "md":
      return {
        color: "bg-zinc-500",
        label: ext.toUpperCase(),
      };
    case "json":
      return {
        color: "bg-yellow-500",
        label: "JSON",
      };
    default:
      return {
        color: "bg-zinc-500",
        label: ext.toUpperCase().slice(0, 4),
      };
  }
};

export const HumanMessage = ({ chatMessage }: THumanMessage) => {
  const { rawHuman, inputProps, files } = chatMessage;
  return (
    <>
      {inputProps?.context && (
        <div className="bg-zinc-50 text-zinc-600 dark:text-zinc-100 dark:bg-black/30 rounded-2xl p-2 pl-3 ml-16 md:ml-32 text-sm md:text-base flex flex-row gap-2 pr-4 border hover:border-white/5 border-transparent">
          <Quotes size={16} weight="bold" className="flex-shrink-0 mt-2" />
          <span className="pt-[0.35em] pb-[0.25em] leading-6">
            {inputProps?.context}
          </span>
        </div>
      )}
      {files && files.length > 0 && (
        <div className="flex flex-row flex-wrap gap-2 ml-16 md:ml-32 mb-2 justify-end">
          {files.map((file, index) => {
            const { color, label } = getFileStyle(file.name);
            return (
              <div
                key={index}
                className="flex items-center gap-2 pr-2 py-1 pl-1 rounded-lg border bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded flex items-center justify-center text-[9px] font-bold text-white uppercase tracking-tighter shrink-0",
                    color
                  )}
                >
                  {label}
                </div>
                <span className="max-w-[120px] truncate text-xs font-medium text-zinc-700 dark:text-zinc-200">
                  {file.name}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {inputProps?.image && (
        <Image
          src={inputProps?.image}
          alt="uploaded image"
          className="rounded-2xl min-w-[120px] h-[120px] border dark:border-white/10 border-black/10 shadow-sm object-cover"
          width={0}
          sizes="50vw"
          height={0}
        />
      )}
      <div className="bg-zinc-50 text-zinc-600 dark:text-zinc-100 dark:bg-black/30 ml-16 md:ml-32 rounded-2xl text-sm md:text-base flex flex-row gap-2 px-3 py-2">
        <span className="pt-[0.20em] pb-[0.15em] leading-6 whitespace-pre-wrap">
          {rawHuman}
        </span>
      </div>
    </>
  );
};
