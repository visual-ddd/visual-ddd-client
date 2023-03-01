import { IUser } from '@/lib/core';
import { NodeBBox } from '@/lib/g6-binding';
import { Avatar, Tooltip } from 'antd';
import { observer } from 'mobx-react';
import { useMemo } from 'react';

import { useEditorModel } from '../Model';

import s from './Awareness.module.scss';

/**
 * 远程用户焦点
 */
export const Awareness = observer(function Awareness(props: {}) {
  const { model } = useEditorModel();

  const focusingNode = useMemo(() => {
    type NodeId = string;
    type UserId = string;
    const nodes = new Map<NodeId, Map<UserId, IUser>>();

    for (const item of model.viewStore.remoteFocusing) {
      const users = nodes.get(item.node.id) || new Map<UserId, IUser>();
      users.set(item.user.id, item.user);

      nodes.set(item.node.id, users);
    }

    return Array.from(nodes.entries()).map(([nodeId, users]) => {
      return {
        nodeId,
        users: Array.from(users.values()),
      };
    });
  }, [model.viewStore.remoteFocusing]);

  return (
    <>
      {focusingNode.map(i => {
        return (
          <NodeBBox key={i.nodeId} node={i.nodeId} className={s.root}>
            <div
              className={s.users}
              style={{ transform: `scale(${Math.min(1, model.viewStore.viewState.canvasScale?.sx ?? 1)})` }}
            >
              <Avatar.Group className={s.avatars} maxCount={3}>
                {i.users.map(i => {
                  return (
                    <Tooltip key={i.id} title={i.name} placement="bottom">
                      <Avatar src={i.avatar} size={20} className={s.avatar}>
                        {i.name}
                      </Avatar>
                    </Tooltip>
                  );
                })}
              </Avatar.Group>
              <div className={s.tip}>编辑中...</div>
            </div>
          </NodeBBox>
        );
      })}
    </>
  );
});
