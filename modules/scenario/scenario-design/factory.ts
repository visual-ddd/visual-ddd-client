import { BaseEditorModelOptions } from '@/lib/editor';
import { ScenarioObjectName } from './dsl';
import { ScenarioEditorModel } from './model';

const SHAPE_LIST = [
  ScenarioObjectName.Start,
  ScenarioObjectName.End,
  ScenarioObjectName.Activity,
  ScenarioObjectName.Decision,
  ScenarioObjectName.Comment,
];

const WHITE_LIST = [
  ...SHAPE_LIST,
  ScenarioObjectName.LabelEdge,
  ScenarioObjectName.NormalEdge,
  ScenarioObjectName.CommentEdge,
];

export function createScenarioEditorModel(
  options: Omit<BaseEditorModelOptions, 'shapeList' | 'whitelist' | 'scopeId'>
) {
  return new ScenarioEditorModel({
    ...options,
    scopeId: 'scenario',
    shapeList: SHAPE_LIST,
    whitelist: WHITE_LIST,
    activeScope: false,
  });
}
