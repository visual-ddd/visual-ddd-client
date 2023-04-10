import { ScenarioDesignerModel } from './model';
import { useDesignerContext } from '@/lib/designer';

export function useScenarioDesignerContext() {
  return useDesignerContext<ScenarioDesignerModel>();
}
