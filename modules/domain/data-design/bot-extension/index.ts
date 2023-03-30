import { useDataObjectCreateBot } from './create';
import { useDataObjectSqlMasterBot } from './sqlMaster';

export function useDataDesignBot() {
  useDataObjectCreateBot();
  useDataObjectSqlMasterBot();
}
