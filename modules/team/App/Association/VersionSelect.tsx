import { VersionBadge } from '@/lib/components/VersionBadge';
import type { IVersion } from '@/lib/components/VersionControl';
import { Select, SelectProps } from 'antd';
import useSwr from 'swr';

export interface VersionSelectProps extends SelectProps {
  /**
   * 唯一 id, 用于 swr 缓存
   */
  identify: string;

  onRequest: () => Promise<IVersion[]>;
}

export const VersionSelect = (props: VersionSelectProps) => {
  const { identify, onRequest, ...other } = props;
  const { data, isLoading } = useSwr(identify, onRequest, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  return (
    <Select
      size="small"
      allowClear
      loading={isLoading}
      placeholder="选择版本号"
      className="u-fw"
      virtual={false}
      bordered={false}
      showSearch
      optionFilterProp="version"
      options={data?.map(i => {
        return {
          label: <VersionBadge version={i.currentVersion} status={i.state} />,
          version: i.currentVersion,
          value: i.id,
        };
      })}
      {...other}
    ></Select>
  );
};
