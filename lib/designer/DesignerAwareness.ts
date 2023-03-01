import { Doc as YDoc } from 'yjs';
import * as protocol from 'y-protocols/awareness';
import { IDisposable } from '@/lib/utils';
import { derive, makeAutoBindThis, mutation } from '@/lib/store';
import { IUser } from '@/lib/core';
import { makeObservable, observable } from 'mobx';

export interface BaseDesignerAwarenessState {
  /**
   * 唯一 id
   */
  id: number;
  user?: IUser;
}

export class DesignerAwareness<State extends BaseDesignerAwarenessState = BaseDesignerAwarenessState>
  implements IDisposable
{
  readonly awareness: protocol.Awareness;

  /**
   * 远程状态
   */
  @observable.shallow
  remoteStates: Map<number, State> = new Map();

  /**
   * 远程状态，数组模式
   */
  @derive
  get remoteStatesInArray() {
    return Array.from(this.remoteStates.values());
  }

  constructor(inject: { doc: YDoc }) {
    const { doc } = inject;

    const awareness = (this.awareness = new protocol.Awareness(doc));

    awareness.on('change', (evt: any) => {
      this.updateState(evt);
    });

    makeObservable(this);
    makeAutoBindThis(this);
  }

  isLocal(state: State) {
    return state.id === this.awareness.clientID;
  }

  /**
   * 设置本地状态
   */
  setState(state: Partial<State>) {
    const currentState = this.awareness.getLocalState();
    this.awareness.setLocalState({ id: this.awareness.clientID, ...currentState, ...state });
  }

  getState(): State | undefined {
    return this.awareness.getLocalState() as State | undefined;
  }

  dispose() {
    this.awareness.destroy();
  }

  @mutation('AWARENESS:CHANGE', false)
  private updateState(delta: { added: number[]; removed: number[]; updated: number[] }) {
    for (const toRemove of delta.removed) {
      this.remoteStates.delete(toRemove);
    }

    const states = this.awareness.getStates();

    for (const toUpdate of delta.updated.concat(delta.added)) {
      const state = states.get(toUpdate);

      if (state) {
        this.remoteStates.set(toUpdate, state as State);
      }
    }
  }
}
