import { usePreferenceContext, useSettingsContext } from "@/context";
import { EMBEDDING_PROVIDERS } from "@/lib/embeddings-config";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowClockwise,
  ArrowRight,
  CaretDown,
  Database,
  Faders,
  Info,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Flex } from "../ui/flex";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import { Type } from "../ui/text";
import { SettingsContainer } from "./settings-container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { defaultPreferences } from "@/hooks/use-preferences";

export const RagSettings = () => {
  const { preferences, updatePreferences } = usePreferenceContext();
  const { selectedSubMenu } = useSettingsContext();
  const { toast } = useToast();
  const { ragSettings } = preferences;
  const [tempKey, setTempKey] = useState("");
  const [tempPineconeKey, setTempPineconeKey] = useState("");
  const [tempPineconeIndex, setTempPineconeIndex] = useState("");
  const [accordionValue, setAccordionValue] = useState<string[]>(
    selectedSubMenu
      ? Array.from(
          new Set(["embedding", "retrieval", "pinecone", selectedSubMenu])
        )
      : ["embedding", "retrieval", "pinecone"]
  );

  useEffect(() => {
    if (selectedSubMenu && !accordionValue.includes(selectedSubMenu)) {
      setAccordionValue((prev) => [...prev, selectedSubMenu]);
    }
  }, [selectedSubMenu]);

  const updateRagSettings = (updates: Partial<typeof ragSettings>) => {
    updatePreferences({
      ragSettings: { ...ragSettings, ...updates },
    });
  };

  const renderResetToDefault = (key: keyof typeof ragSettings) => {
    return (
      <Button
        variant="outline"
        size="iconXS"
        rounded="lg"
        onClick={() => {
          updateRagSettings({ [key]: defaultPreferences.ragSettings[key] });
        }}
      >
        <ArrowClockwise size={14} weight="bold" />
      </Button>
    );
  };

  const currentProvider = EMBEDDING_PROVIDERS.find(
    (p) => p.id === ragSettings.provider
  );

  return (
    <SettingsContainer title="RAG Configuration">
      <Flex direction="col" gap="lg" className="w-full">
        <Accordion
          type="multiple"
          className="w-full"
          value={accordionValue}
          onValueChange={setAccordionValue}
        >
          <AccordionItem value="embedding">
            <AccordionTrigger>
              <Flex gap="sm" items="center">
                <Database size={16} />
                Embedding Model
              </Flex>
            </AccordionTrigger>
            <AccordionContent className="px-2 pb-4">
              <Flex direction="col" gap="sm" className="w-full">
                <Flex direction="col" gap="sm" className="w-full">
                  <Type size="xs" textColor="secondary">
                    Embedding Model Provider
                  </Type>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between font-normal"
                      >
                        {currentProvider?.name || "Select Provider"}
                        <CaretDown size={14} weight="bold" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[300px]" align="start">
                      {EMBEDDING_PROVIDERS.map((provider) => (
                        <DropdownMenuItem
                          key={provider.id}
                          onClick={() => {
                            updateRagSettings({
                              provider: provider.id,
                              model: provider.models[0].id,
                              apiKey: "",
                            });
                            setTempKey("");
                          }}
                        >
                          {provider.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Flex>

                <Flex direction="col" gap="sm" className="w-full">
                  <Type size="xs" textColor="secondary">
                    API Key
                  </Type>
                  <Input
                    type="password"
                    placeholder="Enter API Key"
                    value={ragSettings.apiKey || tempKey}
                    disabled={!!ragSettings.apiKey}
                    onChange={(e) => setTempKey(e.target.value)}
                  />
                  <Flex gap="sm" className="w-full">
                    {currentProvider?.getApiKeyUrl && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          window.open(currentProvider.getApiKeyUrl, "_blank")
                        }
                      >
                        Get your API key here
                        <ArrowRight size={16} weight="bold" className="ml-2" />
                      </Button>
                    )}
                    {ragSettings.apiKey ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateRagSettings({ apiKey: "" });
                          setTempKey("");
                        }}
                      >
                        Remove API Key
                      </Button>
                    ) : tempKey ? (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          updateRagSettings({ apiKey: tempKey });
                          toast({
                            title: "Success",
                            description: "Embedding model API key saved",
                            variant: "default",
                          });
                        }}
                      >
                        Save API Key
                      </Button>
                    ) : null}
                  </Flex>
                </Flex>

                <Flex direction="col" gap="sm" className="w-full">
                  <Type size="xs" textColor="secondary">
                    Embedding model
                  </Type>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between font-normal"
                      >
                        {currentProvider?.models.find(
                          (m) => m.id === ragSettings.model
                        )?.id || ragSettings.model}
                        <CaretDown size={14} weight="bold" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[300px]" align="start">
                      {currentProvider?.models.map((model) => (
                        <DropdownMenuItem
                          key={model.id}
                          onClick={() => updateRagSettings({ model: model.id })}
                        >
                          {model.id}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Flex gap="xs" items="center" className="text-zinc-500">
                    <Info size={14} weight="bold" />
                    <Type size="xs" textColor="secondary">
                      Your API Key is stored locally on your browser and never sent anywhere else.
                    </Type>
                  </Flex>
                </Flex>
              </Flex>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pinecone">
            <AccordionTrigger>
              <Flex gap="sm" items="center">
                <Database size={16} />
                Vector Database Configuration (Pinecone)
              </Flex>
            </AccordionTrigger>
            <AccordionContent className="px-2 pb-4">
              <Flex direction="col" gap="sm" className="w-full">
                <Flex direction="col" gap="xs" className="w-full">
                  <Type size="xs" textColor="secondary">
                    Pinecone API Key
                  </Type>
                  <Input
                    type="password"
                    placeholder="Enter Pinecone API Key"
                    value={ragSettings.pineconeApiKey || tempPineconeKey}
                    disabled={!!ragSettings.pineconeApiKey}
                    onChange={(e) => setTempPineconeKey(e.target.value)}
                  />
                  <Flex gap="sm" className="w-full">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        window.open("https://app.pinecone.io/", "_blank")
                      }
                    >
                      Get your API key here
                      <ArrowRight size={16} weight="bold" className="ml-2" />
                    </Button>
                    {ragSettings.pineconeApiKey ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateRagSettings({ pineconeApiKey: "" });
                          setTempPineconeKey("");
                        }}
                      >
                        Remove API Key
                      </Button>
                    ) : tempPineconeKey ? (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          updateRagSettings({ pineconeApiKey: tempPineconeKey });
                          toast({
                            title: "Success",
                            description: "Pinecone API key saved",
                            variant: "default",
                          });
                        }}
                      >
                        Save API Key
                      </Button>
                    ) : null}
                  </Flex>
                </Flex>

                <Flex direction="col" gap="xs" className="w-full">
                  <Type size="xs" textColor="secondary">
                    Pinecone Index Name
                  </Type>
                  <Input
                    placeholder="e.g., smolchat-index"
                    value={ragSettings.pineconeIndex || tempPineconeIndex}
                    disabled={!!ragSettings.pineconeIndex}
                    onChange={(e) => setTempPineconeIndex(e.target.value)}
                  />
                  <Flex gap="sm" className="w-full justify-start">
                    {ragSettings.pineconeIndex ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateRagSettings({ pineconeIndex: "" });
                          setTempPineconeIndex("");
                        }}
                      >
                        Remove Index Name
                      </Button>
                    ) : tempPineconeIndex ? (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          updateRagSettings({
                            pineconeIndex: tempPineconeIndex,
                          });
                          toast({
                            title: "Success",
                            description: "Pinecone Index Name saved",
                            variant: "default",
                          });
                        }}
                      >
                        Save Index Name
                      </Button>
                    ) : null}
                  </Flex>
                </Flex>

                <Flex gap="xs" items="center" className="mt-2">
                  <Info size={16} className="text-zinc-500" />
                  <Type size="xxs" textColor="tertiary">
                    Your API Key is stored locally on your browser and never sent anywhere else.
                  </Type>
                </Flex>
              </Flex>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="retrieval">
            <AccordionTrigger>
              <Flex gap="sm" items="center">
                <Faders size={16} />
                Retrieval Parameters
              </Flex>
            </AccordionTrigger>
            <AccordionContent className="px-2 pb-4">
              <Flex direction="col" gap="md" className="w-full">
                <Flex
                  direction="row"
                  justify="between"
                  className="w-full items-center"
                >
                  <Flex direction="row" gap="xs" items="center">
                    <Type size="xs" textColor="secondary">
                      Top K
                    </Type>
                    <Info size={14} className="text-zinc-400" />
                  </Flex>
                  <Flex items="center" gap="sm">
                    <Input
                      type="number"
                      size="sm"
                      className="w-[80px]"
                      value={ragSettings.topK}
                      onChange={(e) =>
                        updateRagSettings({ topK: Number(e.target.value) })
                      }
                    />
                    {renderResetToDefault("topK")}
                  </Flex>
                </Flex>

                <Flex
                  direction="row"
                  justify="between"
                  className="w-full items-center"
                >
                  <Type size="xs" textColor="secondary">
                    Chunk Size
                  </Type>
                  <Flex items="center" gap="sm">
                    <Input
                      type="number"
                      size="sm"
                      className="w-[80px]"
                      value={ragSettings.chunkSize}
                      onChange={(e) =>
                        updateRagSettings({ chunkSize: Number(e.target.value) })
                      }
                    />
                    {renderResetToDefault("chunkSize")}
                  </Flex>
                </Flex>

                <Flex
                  direction="row"
                  justify="between"
                  className="w-full items-center"
                >
                  <Type size="xs" textColor="secondary">
                    Chunk Overlap
                  </Type>
                  <Flex items="center" gap="sm">
                    <Input
                      type="number"
                      size="sm"
                      className="w-[80px]"
                      value={ragSettings.chunkOverlap}
                      onChange={(e) =>
                        updateRagSettings({
                          chunkOverlap: Number(e.target.value),
                        })
                      }
                    />
                    {renderResetToDefault("chunkOverlap")}
                  </Flex>
                </Flex>

                <Flex direction="col" gap="sm" className="w-full">
                  <Type size="xs" textColor="secondary">
                    Search Type
                  </Type>
                  <div className="flex flex-row gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="searchType"
                        value="similarity"
                        checked={ragSettings.searchType === "similarity"}
                        onChange={() =>
                          updateRagSettings({ searchType: "similarity" })
                        }
                        className="accent-zinc-900 dark:accent-white"
                      />
                      Similarity
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="searchType"
                        value="mmr"
                        checked={ragSettings.searchType === "mmr"}
                        onChange={() =>
                          updateRagSettings({ searchType: "mmr" })
                        }
                        className="accent-zinc-900 dark:accent-white"
                      />
                      MMR (Maximal Marginal Relevance)
                    </label>
                  </div>
                </Flex>

                <Flex
                  direction="row"
                  justify="between"
                  className="w-full items-center"
                >
                  <Type size="xs" textColor="secondary">
                    Similarity Threshold
                  </Type>
                  <Flex items="center" gap="sm">
                    <Slider
                      className="w-[100px]"
                      value={[ragSettings.similarityThreshold]}
                      min={0}
                      max={1}
                      step={0.05}
                      onValueChange={(vals) =>
                        updateRagSettings({ similarityThreshold: vals[0] })
                      }
                    />
                    <Input
                      type="number"
                      size="sm"
                      className="w-[80px]"
                      value={ragSettings.similarityThreshold}
                      step={0.05}
                      onChange={(e) =>
                        updateRagSettings({
                          similarityThreshold: Number(e.target.value),
                        })
                      }
                    />
                    {renderResetToDefault("similarityThreshold")}
                  </Flex>
                </Flex>
              </Flex>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Flex>
    </SettingsContainer>
  );
};

