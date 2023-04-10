import { Directive } from '@/lib/ai-directive-parser';
import { DirectiveName, ScenarioDirective } from './protocol';

type Task = () => void;

export interface IFlowStore {
  createNode(directive: Directive): void;
}

export class Executor {
  warning: string[] = [];
  store: IFlowStore;
  constructor(inject: { store: IFlowStore }) {
    this.store = inject.store;
  }

  execute(directives: ScenarioDirective[]) {
    console.log(`执行场景编辑: `, directives);

    const highTasks: Task[] = [];
    const task: Task[] = [];
    const availableNodes: Set<string> = new Set();

    const checkName = (name: string) => {
      return availableNodes.has(name);
    };

    for (const dir of directives) {
      if (dir.type === DirectiveName.Edge) {
        task.push(() => {
          if (!dir.params.from || !dir.params.to) {
            this.warning.push(`边缺少 from 和 to 属性`);
            return;
          }

          if (!checkName(dir.params.from)) {
            this.warning.push(`边的 from 属性 ${dir.params.from} 引用不存在`);
            return;
          }

          if (!checkName(dir.params.to)) {
            this.warning.push(`边的 to 属性 ${dir.params.to} 引用不存在`);
            return;
          }

          this.store.createNode(dir);
        });
      } else if (dir.type === DirectiveName.Node || dir.type === DirectiveName.Condition) {
        highTasks.push(() => {
          if (!dir.params.name) {
            this.warning.push(`节点 ${dir.params.label} 缺少 name 属性`);
            return;
          }

          if (availableNodes.has(dir.params.name)) {
            this.warning.push(`节点 ${dir.params.label} 的 name 属性重复`);
            return;
          }

          dir.params.label ||= dir.params.name;
          availableNodes.add(dir.params.name);

          this.store.createNode(dir);
        });
      } else if (dir.type === DirectiveName.Start) {
        highTasks.push(() => {
          availableNodes.add(DirectiveName.Start);

          this.store.createNode(dir);
        });
      } else if (dir.type === DirectiveName.End) {
        highTasks.push(() => {
          availableNodes.add(DirectiveName.End);

          this.store.createNode(dir);
        });
      } else {
        this.warning.push(`未知指令: ${(dir as Directive).type}`);
      }
    }

    highTasks.forEach(t => t());
    task.forEach(t => t());

    return this.warning;
  }
}
