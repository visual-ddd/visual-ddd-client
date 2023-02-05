import { NameDSL } from '@/modules/domain/domain-design/dsl/dsl';
import { MapTypeRoot } from '@/lib/editor/Model/NodeYMap';

export interface CoreProperties {
  __node_name__: string;
  uuid?: string;
}

export interface Tree<T extends CoreProperties = CoreProperties> {
  id: string;
  parent?: string;
  children: Record<string, never>;
  properties: T;
}

export const ROOT = MapTypeRoot;

export abstract class BaseContainer {
  private postTraverses: (() => void)[] = [];

  constructor() {}

  abstract handle(node: Tree, tree: Record<string, Tree>): void;

  protected addPostTraverse(fn: () => void) {
    this.postTraverses.push(fn);
  }

  traverse(tree: Record<string, Tree>) {
    const walk = (node: Tree) => {
      this.handle(node, tree);

      const childrenKeys = Object.keys(node.children);
      if (childrenKeys) {
        for (const childKey of childrenKeys) {
          node = tree[childKey];
          if (node) {
            walk(node);
          }
        }
      }
    };

    const root = tree[ROOT];
    walk(root);

    if (this.postTraverses.length) {
      const list = this.postTraverses;
      this.postTraverses = [];
      for (const fn of list) {
        fn();
      }
    }
  }
}

export interface IContainer {
  getNodeById(id: string): Node<any> | undefined;
}

/**
 * 基础节点信息
 */
export abstract class Node<T extends NameDSL = NameDSL> {
  /**
   * 唯一 id
   */
  id: string;

  /**
   * 属性
   */
  properties: T;

  container: IContainer;

  get name() {
    return this.properties.name;
  }

  constructor(id: string, properties: T, container: IContainer) {
    this.container = container;
    this.id = id;

    this.properties = properties;
  }

  getReference = (id: string): NameDSL => {
    return this.container.getNodeById(id)!.properties;
  };
}
