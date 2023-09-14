import { registerSubjectSummary } from '@/lib/chat-bot';

import './global';
// import './echo';
import './ddd-master';
// import './dall-e';

registerSubjectSummary(async text => {
  const res = await fetch('/api/rest/ai/subject', {
    method: 'POST',
    body: JSON.stringify({ text }),
    headers: {
      'content-type': 'application/json',
    },
  });

  if (res.ok) {
    return await res.text();
  }

  return '';
});
