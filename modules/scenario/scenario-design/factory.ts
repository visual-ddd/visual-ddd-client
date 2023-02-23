import { ScenarioObjectName } from './dsl';
import { ScenarioEditorModel, ScenarioEditorModelOptions } from './model';

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
  options: Omit<ScenarioEditorModelOptions, 'shapeList' | 'whitelist' | 'scopeId'>
) {
  return new ScenarioEditorModel({
    ...options,
    scopeId: 'scenario',
    shapeList: SHAPE_LIST,
    whitelist: WHITE_LIST,
    activeScope: false,
  });
}
