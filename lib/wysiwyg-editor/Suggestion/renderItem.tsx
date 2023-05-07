import { ReactRenderer } from '@tiptap/react';
import { SuggestionKeyDownProps, SuggestionOptions } from '@tiptap/suggestion';
import { CommandList, CommandListProps } from './CommandList';
import { Item } from './types';

export const renderItems: SuggestionOptions<Item>['render'] = () => {
  let component: ReactRenderer<{ onKeyDown: (evt: SuggestionKeyDownProps) => boolean }, CommandListProps>;

  return {
    onStart: props => {
      component = new ReactRenderer(CommandList, {
        props,
        editor: props.editor,
      });
    },
    onUpdate(props) {
      component.updateProps(props);
    },
    onKeyDown(props) {
      if (props.event.key === 'Escape') {
        component?.destroy();
        return true;
      }

      return !!component.ref?.onKeyDown(props);
    },
    onExit() {
      component.destroy();
    },
  };
};
