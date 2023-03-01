import { Doc as YDoc } from 'yjs';
import { observer } from 'mobx-react';
import type { Awareness } from 'y-protocols/awareness';
import dynamic from 'next/dynamic';
import { IUser } from '@/lib/core';

const WYSIWYGEditor = dynamic(() => import('@/lib/wysiwyg-editor'), { ssr: false });

export interface ProductDesignProps {
  doc: YDoc;
  field: string;
  readonly?: boolean;
  awareness?: Awareness;
  user?: IUser;
}

/**
 * 产品资料
 */
export const ProductDesign = observer(function ProductDesign(props: ProductDesignProps) {
  const { doc, field, readonly, awareness, user } = props;

  return <WYSIWYGEditor doc={doc} field={field} readonly={readonly} awareness={awareness} user={user} />;
});
