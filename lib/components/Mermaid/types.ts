export type MindMapNodeShape = 'square' | 'rounded-square' | 'circle' | 'bang' | 'cloud' | 'hexagon' | 'default';
export interface MindMapNode {
  name: string;
  /**
   * 外形，默认 default
   */
  shape?: MindMapNodeShape;
  children?: MindMapNode[];
}
