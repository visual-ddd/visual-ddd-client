export enum DirectiveName {
  Start = 'Start',
  End = 'End',
  Node = 'Node',
  Condition = 'Condition',
  Edge = 'Edge',
}

export const AVAILABLE_DIRECTIVES = Object.values(DirectiveName);

export interface StartDirective {
  type: DirectiveName.Start;
  params: {
    x: number;
    y: number;
  };
}

export interface EndDirective {
  type: DirectiveName.End;
  params: {
    x: number;
    y: number;
  };
}

export interface NodeDirective {
  type: DirectiveName.Node;
  params: {
    name: string;
    label: string;
    x: number;
    y: number;
  };
}

export interface ConditionDirective {
  type: DirectiveName.Condition;
  params: {
    name: string;
    label: string;
    x: number;
    y: number;
  };
}

export interface EdgeDirective {
  type: DirectiveName.Edge;
  params: {
    label?: string;
    from: string;
    to: string;
  };
}

export type ScenarioDirective = StartDirective | EndDirective | NodeDirective | ConditionDirective | EdgeDirective;
