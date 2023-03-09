import { useAutoCompleteUbiquitousLanguage } from '@/lib/components/NameInput';
import { useEditorFormContext } from '@/lib/editor';

export function useAutoCompleteUbiquitousLanguageFromFormModel(options: {
  path: string;
  titleName?: string;
  descriptionName?: string;
}) {
  const { formModel } = useEditorFormContext()!;

  return useAutoCompleteUbiquitousLanguage({
    ...options,
    setter: (path: string, value: string) => formModel.setProperty(path, value),
  });
}
