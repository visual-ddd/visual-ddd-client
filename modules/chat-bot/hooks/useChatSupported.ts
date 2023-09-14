import { useRequestByGet } from '@/modules/backend-client';

export function useChatSupported() {
  const res = useRequestByGet<boolean>('/api/rest/ai/chat-supported');

  return res.data ?? false;
}
