"use client";

import { Plus, X } from "@phosphor-icons/react";
import { useRef } from "react";
import { Button } from "./ui/button";
import { useDocumentContext } from "@/context/documents";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const ChatFileUpload = ({ disabled }: { disabled?: boolean }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addDocuments, documents } = useDocumentContext();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addDocuments(Array.from(e.target.files));
    }
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
        disabled={disabled}
      />
      <TooltipProvider>
        <Tooltip content={disabled ? "Enable RAG/Docs in plugins to upload documents" : "Attach files (Max 10)"}>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => !disabled && fileInputRef.current?.click()}
            className={`relative ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={disabled}
          >
            <Plus size={18} weight="bold" />
            {documents.length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
              >
                {documents.length}
              </Badge>
            )}
          </Button>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};
