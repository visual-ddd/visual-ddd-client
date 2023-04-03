import { useDataObjectCreateBot } from './create';
import { useDataObjectBot } from './dataObject';
import { useDataObjectSqlMasterBot } from './sqlMaster';

export function useDataDesignBot() {
  useDataObjectCreateBot();
  useDataObjectSqlMasterBot();
  useDataObjectBot();
}
