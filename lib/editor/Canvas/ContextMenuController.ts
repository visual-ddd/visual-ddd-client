import { mutation } from '@/lib/store';
import { IDisposable } from '@/lib/utils';
import type { Cell } from '@antv/x6';
import { Disposer } from '@wakeapp/utils';
import { makeObservable, observable } from 'mobx';
import type { BaseNode } from '../Model';
import type { CanvasModel } from './CanvasModel';

export interface EditorContextMenuContext {
  target?: { model: BaseNode; cell: Cell };
  event: MouseEvent;
  canvasModel: CanvasModel;
}

type WithContext<T> = T | ((context: EditorContextMenuContext) => T);

interface EditorContextMenuItemRaw {
  label: React.ReactNode;
  disabled?: boolean;
  visible?: boolean;
  danger?: boolean;
}

type ObjectWithContext<T> = { [K in keyof T]: WithContext<T[K]> };

export interface EditorContextMenuItem extends ObjectWithContext<EditorContextMenuItemRaw> {
  key: string;
  handler: (context: EditorContextMenuContext) => void;
}

export interface EditorContextMenuDivider {
  type: 'divider';
}

export type EditorContextMenu = (EditorContextMenuItem | EditorContextMenuDivider)[];

export type EditorContextMenuGetter = (context: EditorContextMenuContext) => EditorContextMenu | undefined;

interface EditorContextMenuItemNormalized extends EditorContextMenuItemRaw {
  key: string;
  handler: () => void;
}

type EditorContextMenuNormalized = (EditorContextMenuItemNormalized | EditorContextMenuDivider)[];

export function isDivider(item: any): item is EditorContextMenuDivider {
  return 'type' in item && item.type === 'divider';
}

/**
 * 默认，即画布右键菜单
 */
const DEFAULT_CONTEXT_MENU: EditorContextMenu = [
  {
    key: 'copy',
    label: '复制',
    disabled: ({ canvasModel }) => {
      return !canvasModel.canCopy();
    },
    handler: ({ canvasModel }) => {
      canvasModel.handleCopy();
    },
  },
  {
    key: 'paste',
    label: '粘贴',
    disabled: ({ canvasModel }) => {
      return canvasModel.readonly;
    },
    handler: ({ canvasModel }) => {
      canvasModel.handlePaste();
    },
  },
  {
    key: 'selectAll',
    label: '全选',
    handler: ({ canvasModel }) => {
      canvasModel.handleSelectAll();
    },
  },
  {
    key: 'exportAsImage',
    label: '导出图片',
    handler: ({ canvasModel }) => {
      canvasModel.handleExportAsImage();
    },
  },
];

const DEFAULT_CELL_CONTEXT_MENU: EditorContextMenu = [
  {
    key: 'copy',
    label: '复制',
    disabled: ({ canvasModel, target }) => {
      return !canvasModel.canCopy(target!.model);
    },
    handler: ({ canvasModel, target }) => {
      return canvasModel.handleCopyCells([target!.cell]);
    },
  },
  {
    key: 'select',
    label: '选中',
    handler: ({ canvasModel, target }) => {
      return canvasModel.handleAddSelect({ cellIds: [target!.cell.id] });
    },
  },
  {
    key: 'bringForward',
    label: '前置一层',
    handler: ({ canvasModel, target }) => {
      return canvasModel.handleIncrementZIndex({ cell: target!.cell, value: 1 });
    },
  },
  {
    key: 'sendBackward',
    label: '后置一层',
    handler: ({ canvasModel, target }) => {
      return canvasModel.handleIncrementZIndex({ cell: target!.cell, value: -1 });
    },
  },
  {
    key: 'toFront',
    label: '置于顶层',
    handler: ({ canvasModel, target }) => {
      canvasModel.handleToFront({ cell: target!.cell });
    },
  },
  {
    key: 'toBack',
    label: '置于底层',
    handler: ({ canvasModel, target }) => {
      canvasModel.handleToBack({ cell: target!.cell });
    },
  },
  { type: 'divider' },
  {
    key: 'delete',
    label: '删除',
    disabled: ({ canvasModel, target }) => {
      return !canvasModel.canRemove(target!.model);
    },
    danger: true,
    handler: ({ canvasModel, target }) => {
      return canvasModel.handleRemove({ node: target!.model });
    },
  },
];

/**
 * 右键菜单处理器
 */
export class ContextMenuController implements IDisposable {
  private canvasModel: CanvasModel;
  private getContextMenuForTarget: EditorContextMenuGetter;
  private disposer = new Disposer();

  @observable.ref
  visible: boolean = false;

  @observable.ref
  menu?: {
    menus: EditorContextMenuNormalized;
    position: { x: number; y: number };
  };

  constructor(inject: { canvasModel: CanvasModel; getContextMenuForTarget: EditorContextMenuGetter }) {
    this.canvasModel = inject.canvasModel;
    this.getContextMenuForTarget = inject.getContextMenuForTarget;

    makeObservable(this);

    document.addEventListener('click', this.hideIfNeed, { capture: true });

    this.disposer.push(() => {
      document.removeEventListener('click', this.hideIfNeed, { capture: true });
    });
  }

  dispose = () => {
    this.disposer.release();
  };

  /**
   * 如果没有 target 则触发画布的右键菜单
   * @param event
   */
  trigger(event: { event: MouseEvent; target?: { model: BaseNode; cell: Cell } }) {
    const { target } = event;

    const context: EditorContextMenuContext = {
      ...event,
      canvasModel: this.canvasModel,
    };

    let menus: EditorContextMenuNormalized | undefined;

    if (target == null) {
      menus = this.buildContextMenu(DEFAULT_CONTEXT_MENU, context);
    } else {
      const m = this.getContextMenuForTarget(context);
      if (m) {
        menus = this.buildContextMenu([...DEFAULT_CELL_CONTEXT_MENU, ...m], context);
      }
    }

    if (menus) {
      this.showMenu({ menus, context });
    }
  }

  buildContextMenu(handler: EditorContextMenu, context: EditorContextMenuContext): EditorContextMenuNormalized {
    return handler.map(item => {
      if (isDivider(item)) {
        return item;
      }

      const { key, handler, ...rest } = item;

      const normalized: Partial<EditorContextMenuItemNormalized> = {
        key,
        handler: () => {
          handler(context);
        },
      };

      const keys = Object.keys(rest) as (keyof EditorContextMenuItem)[];

      for (const key of keys) {
        const value = (rest as any)[key];
        if (typeof value === 'function') {
          normalized[key] = value(context);
        } else {
          normalized[key] = value;
        }
      }

      return normalized as EditorContextMenuItemNormalized;
    });
  }

  @mutation('CONTEXTMENU:SHOW', false)
  showMenu(params: { menus: EditorContextMenuNormalized; context: EditorContextMenuContext }) {
    const { menus, context } = params;
    const { event } = context;
    const { clientX, clientY } = event;

    this.menu = { position: { x: clientX, y: clientY }, menus };
    this.visible = true;
  }

  @mutation('CONTEXTMENU:HIDE', false)
  hideMenu() {
    this.visible = false;
  }

  protected hideIfNeed = () => {
    setTimeout(() => {
      if (this.menu) {
        this.hideMenu();
      }
    }, 0);
  };
}
