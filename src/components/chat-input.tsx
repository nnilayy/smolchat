import {
  ArrowDown,
  ArrowElbowDownRight,
  ArrowUp,
  Stop,
  X,
} from "@phosphor-icons/react";
import { EditorContent } from "@tiptap/react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  useAssistantContext,
  useChatContext,
  usePreferenceContext,
  useSessionsContext,
} from "@/context";
import {
  defaultPreferences,
  useModelList,
  useRecordVoice,
  useScrollToBottom,
} from "@/hooks";
import { ArrowDown02Icon, Navigation03Icon } from "hugeicons-react";
import { TAssistant } from "@/hooks/use-chat-session";
import { slideUpVariant } from "@/lib/framer-motion";
import { cn } from "@/lib/utils";
import { ChatExamples } from "./chat-examples";
import { ChatGreeting } from "./chat-greeting";
import { PluginSelect } from "./plugin-select";
import { QuickSettings } from "./quick-settings";
import { Button } from "./ui/button";
import { ChatFileUpload } from "./chat-file-upload";
import { useDocumentContext } from "@/context/documents";
import { Badge } from "./ui/badge";
import { FileText } from "@phosphor-icons/react";

export type TAttachment = {
  file?: File;
  base64?: string;
};

export const ChatInput = () => {
  const { sessionId } = useParams();
  const { showButton, scrollToBottom } = useScrollToBottom();
  const {
    renderRecordingControls,
    recording,
    text,
    transcribing,
  } = useRecordVoice();
  const { currentSession } = useSessionsContext();
  const { selectedAssistant, open: openAssistants } = useAssistantContext();
  const {
    editor,
    handleRunModel,
    sendMessage,
    isGenerating,
    contextValue,
    setContextValue,
    stopGeneration,
  } = useChatContext();

  const { preferences, updatePreferences } = usePreferenceContext();
  const { models, getAssistantByKey, getAssistantIcon } = useModelList();
  const { documents, removeDocument, addDocuments } = useDocumentContext();
  const [isDragging, setIsDragging] = useState(false);

  const isRagEnabled = preferences.defaultPlugins?.includes("retrieval_tool");

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [selectedAssistantKey, setSelectedAssistantKey] = useState<
    TAssistant["key"]
  >(preferences.defaultAssistant);

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (isRagEnabled) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.relatedTarget === null) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (isRagEnabled && e.dataTransfer?.files) {
        addDocuments(Array.from(e.dataTransfer.files));
      }
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, [addDocuments, isRagEnabled]);

  useEffect(() => {
    const assistantProps = getAssistantByKey(preferences.defaultAssistant);
    if (assistantProps?.model) {
      setSelectedAssistantKey(preferences.defaultAssistant);
    } else {
      updatePreferences({
        defaultAssistant: defaultPreferences.defaultAssistant,
      });
    }
  }, [models, preferences]);

  useEffect(() => {
    if (editor?.isActive) {
      editor.commands.focus("end");
    }
  }, [editor?.isActive]);

  useEffect(() => {
    if (sessionId) {
      inputRef.current?.focus();
    }
  }, [sessionId]);

  const isFreshSession = !currentSession?.messages?.length;

  useEffect(() => {
    if (text) {
      editor?.commands.setContent(text);
    }
  }, [text]);

  const renderScrollToBottom = () => {
    if (showButton && !recording && !transcribing) {
      return (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          <Button
            onClick={scrollToBottom}
            size="iconSm"
            variant="outline"
            rounded="full"
          >
            <ArrowDown02Icon size={16} strokeWidth="2" />
          </Button>
        </motion.span>
      );
    }
  };

  const renderStopGeneration = () => {
    if (isGenerating) {
      return (
        <motion.span
          className="mb-2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          <Button
            rounded="full"
            className="dark:bg-zinc-800 dark:border dark:text-white dark:border-white/10"
            onClick={() => {
              stopGeneration();
            }}
          >
            <Stop size={16} weight="fill" />
            Stop generation
          </Button>
        </motion.span>
      );
    }
  };

  //   if (showPopup && !recording && !transcribing) {
  //     return (
  //       <motion.span
  //         initial={{ scale: 0, opacity: 0 }}
  //         animate={{ scale: 1, opacity: 1 }}
  //         exit={{ scale: 0, opacity: 0 }}
  //       >
  //         <Button
  //           onClick={() => {
  //             setContextValue(selectedText);
  //             handleClearSelection();
  //             inputRef.current?.focus();
  //           }}
  //           variant="secondary"
  //           size="sm"
  //         >
  //           <Quotes size={20} weight="bold" /> Reply
  //         </Button>
  //       </motion.span>
  //     );
  //   }
  // };

  const renderSelectedContext = () => {
    if (contextValue) {
      return (
        <div className="flex flex-row items-start py-2 ring-1 ring-zinc-100 dark:ring-zinc-700 bg-white border-zinc-100 dark:bg-zinc-800 border dark:border-white/10 text-zinc-700 dark:text-zinc-200 rounded-xl w-full md:w-[700px] lg:w-[720px]  justify-start gap-2 pl-2 pr-2">
          <ArrowElbowDownRight size={16} weight="bold" className="mt-1" />
          <p className="w-full overflow-hidden ml-2 text-sm md:text-base line-clamp-2">
            {contextValue}
          </p>
          <Button
            size={"iconXS"}
            variant="ghost"
            onClick={() => {
              setContextValue("");
            }}
            className="flex-shrink-0 ml-4"
          >
            <X size={14} weight="bold" />
          </Button>
        </div>
      );
    }
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
          label: ext.toUpperCase(),
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

  const renderDocuments = () => {
    if (documents.length > 0) {
      return (
        <div className="flex flex-row overflow-x-auto gap-2 w-full px-3 pt-3 pb-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700">
          {documents.map((doc) => {
            const { color, label } = getFileStyle(doc.file.name);
            return (
              <div
                key={doc.id}
                className="flex shrink-0 items-center gap-2 pr-2 py-1 pl-1 rounded-lg border bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 transition-all hover:opacity-90"
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
                  {doc.file.name}
                </span>
                <Button
                  variant="ghost"
                  size="iconXS"
                  className="h-5 w-5 ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full"
                  onClick={() => removeDocument(doc.id)}
                >
                  <X size={12} />
                </Button>
              </div>
            );
          })}
        </div>
      );
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center absolute bottom-0 px-2 md:px-4 pb-4 pt-16 gap-2",
        "bg-gradient-to-t transition-all ease-in-out duration-1000 from-white dark:from-zinc-800 to-transparent from-70%",
        "left-12 right-0 md:left-14 md:right-0",
        isFreshSession && "top-0 pb-32"
      )}
    >
      {isFreshSession && <ChatGreeting />}
      <div className="flex flex-row items-center gap-2">
        {renderScrollToBottom()}
        {renderStopGeneration()}
      </div>
      <div className="flex flex-col gap-3 w-full md:w-[700px] lg:w-[720px]">
        {renderSelectedContext()}
        {editor && (
            <motion.div
              variants={slideUpVariant}
              initial={"initial"}
              animate={editor.isEditable ? "animate" : "initial"}
              className="flex flex-col items-start gap-0 focus-within:ring-2 ring-zinc-100 dark:ring-zinc-700 ring-offset-2 dark:ring-offset-zinc-800 bg-zinc-50 dark:bg-white/5 w-full dark:border-white/5 rounded-2xl overflow-hidden"
            >
              {renderDocuments()}
              <div className="flex flex-row items-end pl-2 md:pl-3 pr-2 py-2 w-full gap-0">
                <EditorContent
                  editor={editor}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      sendMessage();
                    }
                  }}
                  className="w-full min-h-8 text-sm md:text-base max-h-[120px] overflow-y-auto outline-none focus:outline-none p-1 [&>*]:outline-none no-scrollbar [&>*]:no-scrollbar [&>*]:leading-6 wysiwyg cursor-text"
                />
              </div>
              <div className="flex flex-row items-center w-full justify-start gap-0 pt-1 pb-2 px-2">
                <div className="mr-2">
                  <ChatFileUpload disabled={!isRagEnabled} />
                </div>
                <Button
                  variant={"ghost"}
                  onClick={openAssistants}
                  className={cn("pl-1 pr-2 gap-2 text-xs md:text-sm")}
                  size="sm"
                >
                  {selectedAssistant!.assistant.key &&
                    getAssistantIcon(selectedAssistant!.assistant.key)}
                  {selectedAssistant?.assistant.name}
                </Button>
                <PluginSelect selectedAssistantKey={selectedAssistantKey} />
                <QuickSettings />
                <div className="flex-1"></div>
                {!isGenerating && renderRecordingControls()}
                {!isGenerating && (
                  <Button
                    size="iconSm"
                    rounded="full"
                    variant={!!editor?.getText() ? "default" : "secondary"}
                    disabled={!editor?.getText()}
                    className={cn(
                      "ml-2",
                      !!editor?.getText() &&
                        "bg-zinc-800 dark:bg-emerald-500/20 text-white dark:text-emerald-400 dark:outline-emerald-400"
                    )}
                    onClick={() => {
                      sendMessage();
                    }}
                  >
                    <Navigation03Icon
                      size={18}
                      variant="stroke"
                      strokeWidth="2"
                    />{" "}
                  </Button>
                )}
              </div>
            </motion.div>
        )}
      </div>
      {isFreshSession && <ChatExamples />}
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-200 pointer-events-none">
          <div className="w-full h-full border-[3px] border-dashed border-zinc-400 dark:border-zinc-500 m-6 rounded-3xl flex flex-col items-center justify-center gap-4 bg-white/5 dark:bg-black/5 animate-pulse">
            <div className="w-20 h-20 rounded-full bg-zinc-100/80 dark:bg-zinc-800/80 flex items-center justify-center shadow-lg backdrop-blur-md">
              <ArrowDown size={40} className="text-zinc-600 dark:text-zinc-300" />
            </div>
            <p className="text-2xl font-semibold text-white drop-shadow-md">
              Drop files anywhere to upload
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
