import dynamic from 'next/dynamic';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { TeamDetail } from '@/modules/organization/types';
import { useRequestByGet } from '@/modules/backend-client';
import { useRouter } from 'next/router';

export interface UpdaterProps {}

export interface UpdaterRef {
  open(): void;
}

export function useUpdater() {
  return useRef<UpdaterRef>(null);
}

const UpdateTeam = dynamic(() => import('@/modules/organization/Organization/UpdateTeam'), { ssr: false });

export const Updater = forwardRef<UpdaterRef, UpdaterProps>((props, ref) => {
  const updateTeamRef = useRef<{ open(detail: TeamDetail): void }>(null);
  const router = useRouter();
  const teamId = router.query.id as string | undefined;
  const { data } = useRequestByGet<TeamDetail>(teamId ? `/wd/visual/web/team/team-detail-query?id=${teamId}` : null);

  useImperativeHandle(ref, () => {
    return {
      open() {
        if (data) {
          updateTeamRef.current?.open(data);
        }
      },
    };
  });

  return <UpdateTeam lazyRef={updateTeamRef} />;
});

Updater.displayName = 'Updater';
