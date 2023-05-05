import { useWakeadminFormBot } from './wakeadmin-form';
import { useWakeadminTableBot } from './wakeadmin-table';

export function useBotExtension() {
  useWakeadminTableBot();
  useWakeadminFormBot();
}
