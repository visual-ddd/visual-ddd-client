import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function User() {
  const router = useRouter();

  useEffect(() => {
    console.log('render user');
  }, []);

  return (
    <div>
      {router.route}
      <Link href="/245">goto 245</Link>
    </div>
  );
}
