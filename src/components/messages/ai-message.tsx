import { Check, Copy, Quotes, TrashSimple } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import * as Selection from "selection-popover";

import {
  useChatContext,
  useSessionsContext,
  useSettingsContext,
} from "@/context";
import { TChatMessage } from "@/hooks/use-chat-session";

import {
  TToolResponse,
  useClipboard,
  useMarkdown,
  useModelList,
  useTextSelection,
  useTools,
} from "@/hooks";
import { RegenerateWithModelSelect } from "../regenerate-model-select";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Flex } from "../ui/flex";
import Spinner from "../ui/loading-spinner";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Type } from "../ui/text";
import { Tooltip } from "../ui/tooltip";
import {
  Copy01Icon,
  Delete01Icon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Tick01Icon,
  VolumeHighIcon,
  StopIcon,
  CloudUploadIcon,
} from "hugeicons-react";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { useToast } from "../ui/use-toast";
import { WolframImages } from "./wolfram-images";
import { YouTubeEmbed } from "./youtube-embed";
export type TAIMessage = {
  chatMessage: TChatMessage;
  isLast: boolean;
};

export const AIMessage = ({ chatMessage, isLast }: TAIMessage) => {
  const { id, rawAI, isLoading, stop, stopReason, tools, inputProps } =
    chatMessage;

  const { getToolInfoByKey } = useTools();
  const messageRef = useRef<HTMLDivElement>(null);
  const { showCopied, copy } = useClipboard();
  const { getModelByKey, getAssistantByKey, getAssistantIcon } = useModelList();
  const { renderMarkdown } = useMarkdown();
  const { open: openSettings } = useSettingsContext();
  const { removeMessage } = useSessionsContext();
  const { handleRunModel, setContextValue, editor } = useChatContext();
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const { selectedText } = useTextSelection();
  const { speak, isSpeaking, supported } = useTextToSpeech();
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

  const isToolRunning = !!tools?.filter((t) => !!t?.toolLoading)?.length;

  const handleFeedback = (type: "like" | "dislike") => {
    if (feedback === type) {
      setFeedback(null);
      return;
    }
    setFeedback(type);
    toast({
      title: type === "like" ? "You liked the response" : "You disliked the response",
      duration: 2000,
    });
  };

  const renderTool = (tool: TToolResponse) => {
    const toolUsed = tool?.toolName
      ? getToolInfoByKey(tool?.toolName)
      : undefined;

    if (!toolUsed) {
      return null;
    }

    const Icon = toolUsed.smallIcon;

    return (
      <>
        {toolUsed && (
          <Type
            size={"xs"}
            className="flex flex-row gap-2 items-center"
            textColor={"tertiary"}
          >
            <Icon
              size={20}
              strokeWidth={1.5}
              className={tool?.toolLoading ? "animate-pulse" : ""}
            />
            <Type size={"sm"} textColor={"tertiary"}>
              {tool?.toolLoading
                ? toolUsed.loadingMessage
                : toolUsed.resultMessage}
            </Type>
          </Type>
        )}
        {toolUsed &&
          tool?.toolRenderArgs &&
          toolUsed?.renderUI?.(tool?.toolRenderArgs)}
      </>
    );
  };

  const modelForMessage = getModelByKey(inputProps!.assistant.baseModel);

  const handleCopyContent = () => {
    if (messageRef.current && rawAI) {
      copy(rawAI);
    }
  };

  const renderStopReason = () => {
    switch (stopReason) {
      case "error":
        return (
          <Alert variant="destructive">
            <AlertDescription className="flex flex-col gap-2">
              <div>
                {chatMessage.errorMessage ||
                  "Something went wrong. Please make sure your API is working properly"}
              </div>
              {chatMessage.errorDetails && (
                <div className="text-xs opacity-80 whitespace-pre-wrap font-mono bg-black/10 p-2 rounded">
                  {chatMessage.errorDetails}
                </div>
              )}
              <Button
                variant="link"
                size="link"
                className="w-fit p-0 h-auto"
                onClick={() => openSettings()}
              >
                Check API Key
              </Button>
            </AlertDescription>
          </Alert>
        );
      case "cancel":
        return (
          <Type size="sm" textColor="tertiary" className="italic">
            Chat session ended
          </Type>
        );
      case "apikey":
        return (
          <Alert variant="destructive">
            <AlertDescription>
              Invalid API Key{" "}
              <Button variant="link" size="link" onClick={() => openSettings()}>
                Check API Key
              </Button>
            </AlertDescription>
          </Alert>
        );
      case "recursion":
        return (
          <Alert variant="destructive">
            <AlertDescription>Recursion detected</AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-row mt-6 w-full">
      <div className="p-2 md:px-3 md:py-2">
        <Tooltip content={inputProps?.assistant.name}>
          {getAssistantIcon(inputProps!.assistant.key)}
        </Tooltip>
      </div>
      <Flex
        ref={messageRef}
        direction="col"
        gap="md"
        items="start"
        className="w-full p-2 flex-1 overflow-hidden"
      >
        {chatMessage.isUploading && (
          <div className="flex flex-row gap-2 items-center">
            <CloudUploadIcon
              size={18}
              className="text-zinc-500 animate-pulse"
            />
            <Type size="sm" textColor="tertiary">
              Uploading Files...
            </Type>
          </div>
        )}
        {!chatMessage.isUploading && isLoading && tools?.map(renderTool)}

        {rawAI && (
          <Selection.Root>
            <Selection.Trigger asChild>
              <article className="prose dark:prose-invert w-full prose-zinc prose-h3:font-medium prose-h4:font-medium prose-h5:font-medium prose-h6:font-medium prose-h3:text-lg prose-h4:text-base prose-h5:text-base prose-h6:text-base prose-heading:font-medium prose-strong:font-medium prose-headings:text-lg prose-th:text-sm">
                {renderMarkdown(rawAI, !!isLoading, id)}
              </article>
            </Selection.Trigger>
            <Selection.Portal
              container={document?.getElementById("chat-container")}
            >
              <Selection.Content sticky="always" sideOffset={10}>
                {selectedText && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setContextValue(selectedText);
                      editor?.commands.clearContent();
                      editor?.commands.focus("end");
                    }}
                  >
                    <Quotes size="16" weight="bold" /> Reply
                  </Button>
                )}
              </Selection.Content>
            </Selection.Portal>
          </Selection.Root>
        )}
        {rawAI && <WolframImages content={rawAI} />}
        {chatMessage.rawHuman &&
          !isLoading &&
          tools?.some((t) => t.toolName === "youtube_tool") && (
            <YouTubeEmbed content={chatMessage.rawHuman} />
          )}
        {stop && stopReason && renderStopReason()}

        <Flex
          justify="between"
          items="center"
          className="w-full pt-1 opacity-100 transition-opacity"
        >
          {isLoading && !chatMessage.isUploading && (
            <Flex gap="sm">
              <Spinner />
              <Type size="sm" textColor="tertiary">
                {!!rawAI?.length ? "Typing ..." : "Thinking ..."}
              </Type>
            </Flex>
          )}
          {!isLoading && (
            <div className="flex flex-row gap-1">
              <Tooltip content="Copy">
                <Button
                  variant="ghost"
                  size="iconSm"
                  rounded="lg"
                  onClick={handleCopyContent}
                >
                  {showCopied ? (
                    <Tick01Icon size={18} strokeWidth={"2"} />
                  ) : (
                    <Copy01Icon size={18} strokeWidth={"2"} />
                  )}
                </Button>
              </Tooltip>

              {supported && (
                <Tooltip content={isSpeaking ? "Stop Speaking" : "Speak"}>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    rounded="lg"
                    onClick={() => speak(rawAI || "")}
                  >
                    {isSpeaking ? (
                      <StopIcon size={18} strokeWidth={"2"} />
                    ) : (
                      <VolumeHighIcon
                        size={18}
                        strokeWidth={"2"}
                      />
                    )}
                  </Button>
                </Tooltip>
              )}

              <Tooltip content="Like">
                <Button
                  variant={"ghost"}
                  size={"iconSm"}
                  rounded={"lg"}
                  onClick={() => handleFeedback("like")}
                >
                  <ThumbsUpIcon
                    size={18}
                    strokeWidth={"2"}
                    className={feedback === "like" ? "text-emerald-500" : ""}
                  />
                </Button>
              </Tooltip>

              <Tooltip content="Dislike">
                <Button
                  variant={"ghost"}
                  size={"iconSm"}
                  rounded={"lg"}
                  onClick={() => handleFeedback("dislike")}
                >
                  <ThumbsDownIcon
                    size={18}
                    strokeWidth={"2"}
                    className={feedback === "dislike" ? "text-red-500" : ""}
                  />
                </Button>
              </Tooltip>
              <Tooltip content="Delete">
                <Popover
                  open={openDeleteConfirm}
                  onOpenChange={setOpenDeleteConfirm}
                >
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="iconSm" rounded="lg">
                      <Delete01Icon
                        size={18}
                        strokeWidth={"2"}
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <p className="text-sm md:text-base font-medium pb-2">
                      Are you sure you want to delete this message?
                    </p>
                    <div className="flex flex-row gap-1">
                      <Button
                        variant="destructive"
                        onClick={() => removeMessage(id)}
                      >
                        Delete Message
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setOpenDeleteConfirm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </Tooltip>
            </div>
          )}
          {chatMessage && isLast && (
            <RegenerateWithModelSelect
              assistant={inputProps!.assistant}
              onRegenerate={(assistant: string) => {
                const props = getAssistantByKey(assistant);
                if (!props?.assistant) {
                  return;
                }
                handleRunModel({
                  input: chatMessage.rawHuman,
                  messageId: chatMessage.id,
                  assistant: props.assistant,
                  sessionId: chatMessage.sessionId,
                });
              }}
            />
          )}
          {/* {!isLoading && !isToolRunning && (
            <div className="flex flex-row gap-2 items-center text-xs text-zinc-500">
              {modelForMessage?.name}
            </div>
          )} */}
        </Flex>
      </Flex>
    </div>
  );
};
