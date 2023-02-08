import { Logo } from '@/modules/user';

import s from './index.module.scss';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { ORG_TYPE } from '@/modules/user/constants';
import { setLaunchConfig } from '@/modules/user/utils';

export default function Launch() {
  const router = useRouter();

  const handleGo = (type: ORG_TYPE, organizationId?: number) => {
    // 缓存启动配置
    setLaunchConfig({ type, organizationId });

    if (type === ORG_TYPE.SYSTEM) {
      router.push(`/system`);
    } else if (type === ORG_TYPE.ORGANIZATION) {
      router.push(`/organization/${organizationId}/list`);
    } else if (type === ORG_TYPE.TEAM) {
      router.push(`/team/${organizationId}`);
    }
  };

  return (
    <div className={s.login}>
      <Logo />
      <div className={s.org}>
        <div className={s.orgTitle}>
          系统管理
          <ArrowRightOutlined onClick={() => handleGo(ORG_TYPE.SYSTEM)} />
        </div>

        <div className={s.orgTitle}>组织管理</div>
        <div className={s.orgChild}>
          组织1
          <ArrowRightOutlined onClick={() => handleGo(ORG_TYPE.ORGANIZATION, 1)} />
        </div>
        <div className={s.orgChild}>
          组织2
          <ArrowRightOutlined onClick={() => handleGo(ORG_TYPE.ORGANIZATION, 2)} />
        </div>

        <div className={s.orgTitle}>团队管理</div>
        <div className={s.orgChild}>
          团队1（组织1）
          <ArrowRightOutlined onClick={() => handleGo(ORG_TYPE.TEAM, 1)} />
        </div>
        <div className={s.orgChild}>
          团队2（组织1）
          <ArrowRightOutlined onClick={() => handleGo(ORG_TYPE.TEAM, 2)} />
        </div>
      </div>
    </div>
  );
}
