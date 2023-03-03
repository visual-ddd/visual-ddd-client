import {
  defineShape,
  EditorFormContainer,
  EditorFormItem,
  ShapeComponentProps,
  useHoverShowPorts,
  useShapeModel,
} from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';
import { ContentEditable } from '@/lib/components/ContentEditable';
import { MessageOutlined } from '@ant-design/icons';

import { CommentDSL, createCommentDSL, ScenarioObjectName } from '../../dsl';
import { PORTS } from '../shared';
import s from './index.module.scss';
import icon from './comment.png';
import { Input } from 'antd';

const CommentReactShapeComponent = (props: ReactComponentProps) => {
  const { node } = props;
  const { properties, updateProperty } = useShapeModel<CommentDSL>(node);

  const handleChange = (value: string) => {
    updateProperty('content', value);
  };

  if (properties == null) {
    return null;
  }

  return (
    <div className={s.root}>
      <div className={s.icon}>
        <MessageOutlined />
      </div>
      <ContentEditable className={s.content} value={properties.content} onChange={handleChange} />
    </div>
  );
};

const CommentShapeComponent = (props: ShapeComponentProps) => {
  const hoverHandlers = useHoverShowPorts();
  return <ReactComponentBinding {...props.cellProps} component={ScenarioObjectName.Comment} {...hoverHandlers} />;
};

const CommentEditor = () => {
  return (
    <EditorFormContainer>
      <EditorFormItem path="content" label="内容">
        <Input.TextArea placeholder="写点注释吧" />
      </EditorFormItem>
    </EditorFormContainer>
  );
};

registerReactComponent(ScenarioObjectName.Comment, CommentReactShapeComponent);

defineShape({
  name: ScenarioObjectName.Comment,
  icon,
  title: '注释',
  description: '注释节点',
  shapeType: 'node',
  group: false,
  allowLoopConnect: false,
  allowConnectNodes: [
    ScenarioObjectName.Activity,
    ScenarioObjectName.Start,
    ScenarioObjectName.End,
    ScenarioObjectName.Decision,
  ],
  edgeFactory: ScenarioObjectName.CommentEdge,

  /**
   * 注释只允许一条出边
   */
  allowMagnetCreateEdge: ({ graph, cell }) => {
    const outgoingEdges = graph.getOutgoingEdges(cell);
    if (outgoingEdges?.length) {
      return false;
    }

    return true;
  },

  initialProps: () => {
    return {
      ...createCommentDSL(),
    };
  },

  staticProps: () => ({
    zIndex: 2,
    ...PORTS,
  }),

  component: CommentShapeComponent,
  attributeComponent: CommentEditor,
});
