import { useRef, useState } from 'react';
import s from './Label.module.scss';

export interface LabelEdgeProps {
  children: string;
  onChange?: (content: string) => void;
}

export const Label = (props: LabelEdgeProps) => {
  const [editing, setEditing] = useState(false);
  const instanceRef = useRef<HTMLDivElement>(null);

  const handleDoubleClick = () => {
    setEditing(true);
  };
  const handleBlur = () => {
    setEditing(false);
    const content = instanceRef.current?.textContent;

    if (content) {
      props.onChange?.(content);
    } else {
      instanceRef.current!.textContent = props.children;
    }
  };

  return (
    <div
      ref={instanceRef}
      className={s.root}
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
      contentEditable={editing}
      dangerouslySetInnerHTML={{ __html: props.children }}
    ></div>
  );
};
