import { useToast } from "@/components/ui/use-toast";
import { SettingsContainer } from "../settings-container";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePreferenceContext } from "@/context/preferences";
import { Flex } from "@/components/ui/flex";
import { Type } from "@/components/ui/text";
import { Function } from "@phosphor-icons/react";

export const WolframPlugin = () => {
  const { toast } = useToast();
  const { preferences, updatePreferences } = usePreferenceContext();

  const handleSaveAppId = () => {
    if (!preferences.wolframAppId) {
      toast({
        title: "Error",
        description: "Please enter an App ID",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Success",
      description: "Wolfram App ID saved",
      variant: "default",
    });
  };

  const handleRemoveAppId = () => {
    updatePreferences({ wolframAppId: "" });
    toast({
      title: "Removed",
      description: "Wolfram App ID removed",
      variant: "default",
    });
  };

  return (
    <Flex direction="col" gap="md" className="w-full">
      <SettingsContainer title="Wolfram Alpha Configuration">
        <Flex direction="col" gap="sm" className="w-full">
          <Type size="sm" textColor="secondary">
            Wolfram Alpha App ID
          </Type>
          <Flex gap="sm" className="w-full">
            <Input
              placeholder="Enter your Wolfram Alpha App ID"
              value={preferences.wolframAppId || ""}
              onChange={(e) =>
                updatePreferences({ wolframAppId: e.target.value })
              }
              type="password"
              className="flex-1"
            />
            <Button onClick={handleSaveAppId} size="sm">
              Save
            </Button>
            {preferences.wolframAppId && (
              <Button
                variant="destructive"
                onClick={handleRemoveAppId}
                size="sm"
              >
                Remove
              </Button>
            )}
          </Flex>
          <Type size="xs" textColor="tertiary">
            You can obtain an App ID from the Wolfram Alpha Developer Portal.
          </Type>
        </Flex>
      </SettingsContainer>
    </Flex>
  );
};
