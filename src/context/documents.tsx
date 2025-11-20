"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";

export type TDocument = {
  file: File;
  id: string;
  status: "pending" | "uploading" | "processed" | "error";
};

type DocumentContextType = {
  documents: TDocument[];
  addDocuments: (files: File[]) => void;
  removeDocument: (id: string) => void;
  clearDocuments: () => void;
};

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const [documents, setDocuments] = useState<TDocument[]>([]);
  const { toast } = useToast();

  const MAX_FILES = 10;
  const ALLOWED_TYPES = [
    "application/pdf",
    "text/plain",
    "text/markdown",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    "application/msword", // doc
    "text/csv",
    "application/vnd.ms-excel", // xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
    "application/json",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
  ];

  const addDocuments = (files: File[]) => {
    if (documents.length + files.length > MAX_FILES) {
      toast({
        title: "Limit Exceeded",
        description: `You can only upload up to ${MAX_FILES} files.`,
        variant: "destructive",
      });
      return;
    }

    const validFiles: TDocument[] = [];

    files.forEach((file) => {
      // Check for markdown files explicitly or by mime type
      const isMarkdown = file.name.toLowerCase().endsWith('.md') || file.name.toLowerCase().endsWith('.markdown');
      const isAllowedType = ALLOWED_TYPES.includes(file.type);

      if (!isAllowedType && !isMarkdown) {
         toast({
          title: "Unsupported File Type",
          description: `${file.name} is not supported.`,
          variant: "destructive",
        });
        return;
      }
      
      validFiles.push({
        file,
        id: Math.random().toString(36).substring(7),
        status: "pending",
      });
    });

    setDocuments((prev) => [...prev, ...validFiles]);
  };

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const clearDocuments = () => {
    setDocuments([]);
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        addDocuments,
        removeDocument,
        clearDocuments,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error("useDocumentContext must be used within a DocumentProvider");
  }
  return context;
};
