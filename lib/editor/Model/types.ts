export type Properties = Record<string, any>;

export interface BaseNodeProperties {
  __node_name__: string;
  __node_type__: string;
  [key: string]: any;
}

export type ShapeType = 'node' | 'edge';

export type Disposer = () => void;

export type PickParams<T extends (...args: any[]) => any, P = Parameters<T>> = P extends [infer U] ? U : never;
