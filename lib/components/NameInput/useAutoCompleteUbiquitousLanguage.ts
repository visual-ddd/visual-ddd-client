import { UbiquitousLanguageCompletionItem } from '../UbiquitousLanguageCompletion';

export function useAutoCompleteUbiquitousLanguage(options: {
  path: string;
  titleName?: string;
  descriptionName?: string;
  setter: (path: string, value: string) => void;
}) {
  const { path, titleName, descriptionName, setter } = options;
  return (item: UbiquitousLanguageCompletionItem) => {
    const { title, description } = item;

    if (title?.trim()) {
      const name = titleName ?? 'title';
      const titlePath = path ? `${path}.${name}` : name;
      setter(titlePath, title);
    }

    if (description?.trim()) {
      const name = descriptionName ?? 'description';
      const descriptionPath = path ? `${path}.${name}` : name;
      setter(descriptionPath, description);
    }
  };
}
