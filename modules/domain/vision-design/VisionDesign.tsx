/**
 * 产品愿景显示
 */
import { Doc as YDoc } from 'yjs';
import classNames from 'classnames';
import Image from 'next/image';
import { Form, Input, Select, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import s from './VisionDesign.module.scss';
import ExampleOu from './example-ou.png';
import { useForceUpdate } from '@wakeapp/hooks';
import { useVisionBot } from './useVisionBot';

export interface VisionDesignProps {
  doc: YDoc;
  field: string;
  readonly?: boolean;
  onActive: () => void;
}

const EXAMPLES = [{ label: '在线请假考勤系统 - 欧创新', img: ExampleOu }];

export const VisionDesign = (props: VisionDesignProps) => {
  const { doc, field, readonly, onActive } = props;
  const [selected, setSelected] = useState(0);
  const update = useForceUpdate();
  const text = useMemo(() => {
    return doc.getText(field);
  }, [doc, field]);
  const value = text.toString();
  const handleChange = (newValue: string) => {
    doc.transact(() => {
      text.delete(0, text.length);
      text.insert(0, newValue);
    });
  };

  useEffect(() => {
    const listener = () => {
      update();
    };

    text.observe(listener);

    return () => text.unobserve(listener);
  }, [text]);

  useVisionBot({
    enabled: !readonly,
    insert: v => {
      onActive();
      handleChange(v);
      message.success('已更新愿景');
    },
  });

  return (
    <div className={classNames('vd-vision', s.root)}>
      <div className={classNames('vd-vision__hd', s.header)}>
        产品愿景是对产品顶层价值设计，对产品目标用户、核心价值、差异化竞争点等信息达成一致，避免产品偏离方向
      </div>
      <div className={classNames('vd-vision__body', s.body)}>
        <div className={classNames('vd-vision__example', s.example)}>
          <Form layout="vertical">
            <Form.Item label="案例">
              <Select value={selected} onChange={setSelected}>
                {EXAMPLES.map((i, idx) => {
                  return (
                    <Select.Option key={idx} value={idx}>
                      {i.label}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item>
              <Image
                className={classNames('vd-vision__img', s.img)}
                src={EXAMPLES[selected].img}
                alt={EXAMPLES[selected].label}
              />
            </Form.Item>
          </Form>
        </div>
        <div className={classNames('vd-vision__content', s.content)}>
          <Form layout="vertical">
            <Form.Item label="描述你的产品愿景/目标">
              <Input.TextArea
                disabled={readonly}
                placeholder="尽可能使用一句话描述清楚， 让每个人都记得住"
                rows={6}
                value={value}
                onChange={e => handleChange(e.target.value)}
              ></Input.TextArea>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};
