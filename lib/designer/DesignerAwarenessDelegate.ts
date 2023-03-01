import { derive, makeAutoBindThis } from '@/lib/store';
import { makeObservable } from 'mobx';
import { IAwarenessRegistry } from '@/lib/core';

import { BaseDesignerAwarenessState, DesignerAwareness } from './DesignerAwareness';

export class DesignerAwarenessDelegate<
  State extends BaseDesignerAwarenessState = BaseDesignerAwarenessState,
  Key extends keyof State = keyof State,
  Value = State[Key]
> implements IAwarenessRegistry<Value>
{
  private awareness: DesignerAwareness<State>;
  private key: Key;

  @derive
  get remoteStates(): { user?: State['user']; state: Value }[] {
    return this.awareness.remoteStatesInArray
      .filter(i => !this.awareness.isLocal(i))
      .map(i => {
        return {
          user: i.user,
          state: i[this.key] as Value,
        };
      });
  }

  getState() {
    return this.awareness.getState()?.[this.key] as Value;
  }

  constructor(inject: { awareness: DesignerAwareness<State>; key: Key }) {
    this.awareness = inject.awareness;
    this.key = inject.key;

    makeAutoBindThis(this);
    makeObservable(this);
  }

  setState(state: Value) {
    // @ts-expect-error
    this.awareness.setState({ [this.key]: state });
  }
}
