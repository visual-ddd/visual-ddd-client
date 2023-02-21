import classNames from 'classnames';
import { useState } from 'react';

export interface ContentEditableProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'value' | 'onChange' | 'children'> {
  value?: string;
  onChange?: (value: string) => void;
  children?: never;
}

export const ContentEditable = (props: ContentEditableProps) => {
  const { value, onChange, className, ...other } = props;
  const [editing, setEditing] = useState(false);

  const handleStartEdit = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    evt.preventDefault();
    setEditing(true);
  };

  const handleEndEdit = (evt: React.FocusEvent) => {
    evt.stopPropagation();
    evt.preventDefault();

    setEditing(false);
    const element = evt.target as HTMLDivElement;
    const value = element.innerText;

    if (value) {
      onChange?.(value);
    } else {
      element.innerText = value;
    }
  };

  const handleMouseDown = (evt: React.MouseEvent) => {
    if (editing) {
      evt.stopPropagation();
    }
  };

  return (
    <div
      className={classNames(className, { editing: editing })}
      contentEditable={editing}
      dangerouslySetInnerHTML={{ __html: value || '' }}
      onDoubleClick={handleStartEdit}
      onMouseDown={handleMouseDown}
      onBlur={handleEndEdit}
      {...other}
    />
  );
};
