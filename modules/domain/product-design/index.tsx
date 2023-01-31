import { Doc as YDoc } from 'yjs';
import { observer } from 'mobx-react';
import dynamic from 'next/dynamic';

const WYSIWYGEditor = dynamic(() => import('@/lib/wysiwyg-editor'), { ssr: false });

export interface ProductDesignProps {
  doc: YDoc;
  field: string;
  readonly?: boolean;
}

/**
 * 产品资料
 */
export const ProductDesign = observer(function ProductDesign(props: ProductDesignProps) {
  const { doc, field, readonly } = props;

  return <WYSIWYGEditor doc={doc} field={field} readonly={readonly} />;
});
