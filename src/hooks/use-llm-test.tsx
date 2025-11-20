import { useState } from "react";
import { TBaseModel, useModelList } from "./use-model-list";
import { useToast } from "@/components/ui/use-toast";
import { usePreferences } from "./use-preferences";
import { Button } from "@/components/ui/button";

export const useLLMTest = () => {
  const { getModelByKey, createInstance, getTestModelKey } = useModelList();

  const [isTestRunning, setIsTestRunning] = useState(false);

  const { toast } = useToast();

  const { getApiKey } = usePreferences();

  const testLLM = async (
    model: TBaseModel,
    apiKey?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const modelKey = getTestModelKey(model);

      if (!apiKey) {
        return { success: false, error: "API Key is missing" };
      }

      const selectedModelKey = getModelByKey(modelKey);

      if (!selectedModelKey) {
        return { success: false, error: "Model not found" };
      }

      const selectedModel = await createInstance(selectedModelKey, apiKey);

      const data = await selectedModel
        .withListeners({
          onError: (error) => {
            console.error("error", error);
          },
        })
        .withConfig({
          recursionLimit: 2,
        })
        .invoke("This is a test message", {
          callbacks: [
            {
              handleLLMError: (error) => {
                console.error("lll", error);
                throw new Error(error);
              },
            },
          ],
        });

      if (data) {
        return { success: true };
      }
      return { success: false, error: "No data returned from model" };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  };

  const renderSaveApiKeyButton = (
    model: TBaseModel,
    key: string,
    onValidated: () => void
  ) => {
    return (
      <Button
        size={"sm"}
        onClick={async () => {
          setIsTestRunning(true);
          const result = await testLLM(model, key);
          if (result.success) {
            onValidated();
            toast({
              title: "API Key Saved successfully",
              description: "Model is working as expected",
              variant: "default",
            });
          } else {
            toast({
              title: "API Key Invalid",
              description:
                result.error || "Please check your API key and try again.",
              variant: "destructive",
            });
          }
          setIsTestRunning(false);
        }}
      >
        {isTestRunning ? "Validating ..." : "Save API Key"}
      </Button>
    );
  };

  return { testLLM, renderSaveApiKeyButton };
};
