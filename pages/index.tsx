import { useSession } from '@/modules/session';

export default function Home() {
  const { session } = useSession();
  return <div>TODO: 首页, {JSON.stringify(session)}</div>;
}
