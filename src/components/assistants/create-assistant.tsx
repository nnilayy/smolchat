import { useFormik } from "formik";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { FormLabel } from "../ui/form-label";
import { ModelSelect } from "../model-select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { TAssistant } from "@/hooks/use-chat-session";

export type TCreateAssistant = {
  assistant?: TAssistant;
  onCreateAssistant: (assistant: Omit<TAssistant, "key">) => void;
  onUpdateAssistant: (assistant: TAssistant) => void;
  onCancel: () => void;
};

export const CreateAssistant = ({
  assistant,
  onCreateAssistant,
  onUpdateAssistant,
  onCancel,
}: TCreateAssistant) => {
  const botTitleRef = useRef<HTMLInputElement | null>(null);

  const formik = useFormik<Omit<TAssistant, "key">>({
    initialValues: {
      name: assistant?.name || "",
      systemPrompt: assistant?.systemPrompt || "",
      baseModel: assistant?.baseModel || "gpt-4o-mini",
      type: "custom",
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      if (assistant?.key) {
        onUpdateAssistant({ ...values, key: assistant?.key });
      } else {
        onCreateAssistant(values);
      }
      clearAssistant();
      onCancel();
    },
  });

  useEffect(() => {
    botTitleRef?.current?.focus();
  }, [open]);

  const clearAssistant = () => {
    formik.resetForm();
  };

  return (
    <div className="flex flex-col items-start w-full bg-white dark:bg-zinc-800 dark:border dark:border-white/10  relative h-full overflow-hidden rounded-2xl">
      <div className="w-full px-4 py-3 border-b  border-zinc-500/20 flex flex-row gap-3 items-center">
        <p className="text-base font-medium">
          {assistant?.key ? "Edit Assistant" : "Add New Assistant"}
        </p>
        <Badge>Beta</Badge>
      </div>
      <div className="flex flex-col w-full p-4 gap-4 items-start flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-row items-center justify-between gap-2 w-full">
          <FormLabel label="Base Model" />
          <ModelSelect
            variant="secondary"
            fullWidth
            className="w-full justify-start p-2 h-10"
            selectedModel={formik.values.baseModel}
            setSelectedModel={(model) => {
              formik.setFieldValue("baseModel", model);
            }}
          />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <FormLabel label="Assistant Name" />
          <Input
            type="text"
            name="name"
            placeholder="Assistant Name"
            value={formik.values.name}
            ref={botTitleRef}
            onChange={formik.handleChange}
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <FormLabel label="System Prompt">
            Assign bot a role to help users understand what the bot can do.
          </FormLabel>
          <Textarea
            name="systemPrompt"
            placeholder="You're a helpful Assistant. Your role is to help users with their queries."
            value={formik.values.systemPrompt}
            onChange={formik.handleChange}
            className="w-full min-h-[100px]"
          />
        </div>
      </div>
      <div className="w-full p-2 border-t justify-between border-zinc-500/20 flex flex-row gap-1 items-center">
        <Button variant="ghost" onClick={onCancel}>
          Back
        </Button>
        <Button
          variant="default"
          onClick={() => {
            formik.handleSubmit();
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
};
