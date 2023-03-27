import { VersionBadge } from '@/lib/components/VersionBadge';
import { useSession } from '@/modules/session';
import { Button } from 'antd';
import type { ColumnType } from 'antd/es/table';
import Table from 'antd/es/table';
import Head from 'next/head';
import Link from 'next/link';
import { useMemo } from 'react';

import { AppDocLayoutProps, AppDocLayout, DomainInfo, ScenarioInfo } from './AppDocLayout';

export const AppDoc = (props: AppDocLayoutProps) => {
  const { info } = props;
  const session = useSession({ shouldRedirect: false });

  const DOMAIN_COLUMNS = useMemo<ColumnType<DomainInfo>[]>(() => {
    return [
      {
        title: '业务域',
        render(_, record) {
          return (
            <Link
              className="u-link"
              href={`/doc/app/${info.applicationDTO.id}/reversion/${info.id}/domain/${record.domainDesignDTO.id}/reversion/${record.id}`}
            >
              {record.domainDesignDTO.name}
            </Link>
          );
        },
      },
      {
        title: '描述',
        render(_, record) {
          return record.domainDesignDTO.description;
        },
      },
      {
        title: '版本',
        render(_, record) {
          return <VersionBadge version={record.currentVersion} status={record.state} />;
        },
      },
      {
        title: '版本描述',
        dataIndex: 'description',
      },
    ];
  }, [info]);

  const SCENARIO_COLUMNS = useMemo<ColumnType<ScenarioInfo>[]>(() => {
    return [
      {
        title: '业务场景',
        render(_, record) {
          return (
            <Link
              className="u-link"
              href={`/doc/app/${info.applicationDTO.id}/reversion/${info.id}/scenario/${record.businessScenarioDTO.id}/reversion/${record.id}`}
            >
              {record.businessScenarioDTO.name}
            </Link>
          );
        },
      },
      {
        title: '描述',
        render(_, record) {
          return record.businessScenarioDTO.description;
        },
      },
      {
        title: '版本',
        render(_, record) {
          return <VersionBadge version={record.currentVersion} status={record.state} />;
        },
      },
      {
        title: '版本描述',
        dataIndex: 'description',
      },
    ];
  }, [info]);

  return (
    <AppDocLayout {...props}>
      <Head>
        <title>{`${info.applicationDTO.name} - 应用`}</title>
      </Head>
      <h1 id="title">{info.applicationDTO.name}</h1>
      <section>
        <dl>
          <dt>标识符：</dt>
          <dd>{info.applicationDTO.identity}</dd>
          <dt>版本：</dt>
          <dd>
            <VersionBadge version={info.currentVersion} status={info.state} type="text" />
          </dd>
          <dt>最后更新于：</dt>
          <dd>{info.updateTime}</dd>
        </dl>
        <blockquote>
          <p>
            <b>应用说明</b>
            <br></br>
            {info.applicationDTO.description || '应用描述'}
          </p>

          <p>
            <b>版本说明</b>
            <br></br>
            {info.description || '版本描述'}
          </p>
          {!!session.session && (
            <p>
              <Button
                onClick={() => {
                  window.open(
                    `/launch?from=${encodeURIComponent(
                      `/team/${info.applicationDTO.teamId}/app/${info.applicationDTO.id}/reversion/${info.id}`
                    )}`,
                    'main'
                  );
                }}
              >
                进入主页
              </Button>
            </p>
          )}
        </blockquote>
      </section>
      <section>
        <h2>关联的业务域</h2>
        <Table
          columns={DOMAIN_COLUMNS}
          rowKey="id"
          dataSource={info.domainDesignVersionInfos}
          pagination={false}
        ></Table>
      </section>
      <section>
        <h2>关联的业务场景</h2>
        <Table
          columns={SCENARIO_COLUMNS}
          rowKey="id"
          dataSource={info.businessScenarioVersionInfos}
          pagination={false}
        ></Table>
      </section>
    </AppDocLayout>
  );
};
