import { useState, useRef, useEffect } from 'react';

export interface DynamicSlotMethods {
  render: (content: React.ReactNode) => void;
}

const DynamicSlot = (props: { renderForward: React.MutableRefObject<DynamicSlotMethods | undefined> }) => {
  const { renderForward } = props;
  const [content, setContent] = useState<React.ReactNode>(null);
  const unmounted = useRef(false);

  renderForward.current = {
    render(children) {
      Promise.resolve().then(() => {
        if (unmounted.current) {
          return;
        }

        setContent(children);
      });
    },
  };

  useEffect(() => {
    return () => {
      unmounted.current = true;
    };
  }, []);

  return <>{content}</>;
};

DynamicSlot.displayName = 'DynamicSlot';

export function useDynamicSlot() {
  const ref = useRef<DynamicSlotMethods>();

  return {
    render(content: React.ReactNode) {
      ref.current?.render(content);
    },
    content: <DynamicSlot renderForward={ref} />,
  };
}
