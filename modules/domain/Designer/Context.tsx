import { useDesignerContext } from '@/lib/designer';
import { DomainDesignerModel } from './model';

export function useDomainDesignerContext() {
  return useDesignerContext<DomainDesignerModel>();
}
