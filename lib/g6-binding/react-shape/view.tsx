import React, { ReactPortal } from 'react';
import { createPortal } from 'react-dom';
import { createRoot, Root } from 'react-dom/client';
import { Dom, NodeView } from '@antv/x6';

import { ReactShape } from './node';
import { Portal } from './portal';
import { Wrap } from './wrap';
import { Disposer } from '@wakeapp/utils';

export class ReactShapeView extends NodeView<ReactShape> {
  root?: Root;
  disposer = new Disposer();

  getComponentContainer() {
    return this.selectors && (this.selectors.foContent as HTMLDivElement);
  }

  override confirmUpdate(flag: number) {
    const ret = super.confirmUpdate(flag);
    return this.handleAction(ret, ReactShapeView.action, () => {
      this.renderReactComponent();
    });
  }

  protected renderReactComponent() {
    this.unmountReactComponent();
    const container = this.getComponentContainer();
    const node = this.cell;

    if (container) {
      const elem = React.createElement(Wrap, { node, graph: this.graph });
      const connection = Portal.getConnection(this.graph);

      if (connection) {
        const portal = createPortal(elem, container) as ReactPortal;
        this.disposer.push(connection(this.cell.id, portal));
      } else {
        this.root = createRoot(container);
        this.root.render(elem);
      }
    }
  }

  protected unmountReactComponent() {
    const container = this.getComponentContainer();
    if (container && this.root) {
      this.root.unmount();
      this.root = undefined;
    }
  }

  override onMouseDown(e: Dom.MouseDownEvent, x: number, y: number) {
    const target = e.target as Element;
    const tagName = target.tagName.toLowerCase();
    if (tagName === 'input') {
      const type = target.getAttribute('type');
      if (type == null || ['text', 'password', 'number', 'email', 'search', 'tel', 'url'].includes(type)) {
        return;
      }
    }

    super.onMouseDown(e, x, y);
  }

  override unmount() {
    this.disposer.release();

    this.unmountReactComponent();
    super.unmount();
    return this;
  }
}

export namespace ReactShapeView {
  export const action = 'react' as any;

  ReactShapeView.config({
    bootstrap: [action],
    actions: {
      component: action,
    },
  });

  NodeView.registry.register('react-shape-view', ReactShapeView, true);
}
