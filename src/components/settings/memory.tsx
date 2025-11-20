import { usePreferenceContext } from "@/context";
import { SettingCard } from "./setting-card";
import { SettingsContainer } from "./settings-container";

export const MemorySettings = () => {
  const { updatePreferences, preferences } = usePreferenceContext();

  const renderMemory = (memory: string) => {
    return (
      <SettingCard className="justify-center flex flex-col">
        {memory}
      </SettingCard>
    );
  };

  return (
    <SettingsContainer title="Memories">
      {preferences?.memories?.length ? (
        preferences?.memories?.map(renderMemory)
      ) : (
        <SettingCard className="justify-center flex flex-col items-center py-8 text-center text-zinc-500 dark:text-zinc-400">
          <p>There are currently no memories from your chat.</p>
          <p className="text-xs mt-1">
            Chat and ask the agent to remember things to create memories.
          </p>
        </SettingCard>
      )}
    </SettingsContainer>
  );
};
