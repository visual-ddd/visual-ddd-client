import { BaseEditorModel, FormModel } from '@/lib/editor';
import { debounce } from '@wakeapp/utils';

enum CheckScope {
  /**
   * 命名校验
   */
  Name,

  /**
   * 根节点校验
   */
  Root,

  /**
   * 完整校验
   */
  Full,

  /**
   * 不需要处理
   */
  Never,
}

/**
 * 校验管理器
 * 实验性
 */
export class BaseEditorValidateManager {
  static CheckScope = CheckScope;

  protected editorModel: BaseEditorModel;

  /**
   * 请求队列
   */
  private queue: Map<string, Set<CheckScope>> = new Map();

  constructor(inject: { editorModel: BaseEditorModel }) {
    this.editorModel = inject.editorModel;
  }

  protected push(id: string, scope: CheckScope) {
    if (!this.queue.has(id)) {
      this.queue.set(id, new Set([scope]));
    } else {
      this.queue.get(id)?.add(scope);
    }

    this.validate();
  }

  protected checkFull(id: string) {
    this.push(id, CheckScope.Full);
  }

  protected checkNever(id: string) {
    this.push(id, CheckScope.Never);
  }

  protected cancelNever(id: string) {
    if (this.queue.has(id)) {
      this.queue.get(id)?.delete(CheckScope.Never);
    }
  }

  /**
   * 进行验证
   */
  private validate = debounce(() => {
    const queue = this.queue;
    this.queue = new Map();

    for (const [id, scopes] of queue) {
      const model = this.getFormModel(id);
      if (!model) {
        continue;
      }

      if (scopes.has(CheckScope.Never)) {
        // 已删除，不需要验证
        continue;
      }

      if (scopes.has(CheckScope.Full)) {
        // 全量检查
        this.validateFull(model);
      } else {
        if (scopes.has(CheckScope.Name)) {
          this.validateName(model);
        }

        if (scopes.has(CheckScope.Root)) {
          this.validateRoot(model);
        }
      }
    }
  }, 600);

  private validateFull(object: FormModel) {
    console.log(`---- check full: ${object.id} ----`, object);

    object.validateAll();
  }

  protected validateName(object: FormModel) {
    console.log(`---- check name: ${object.id} ----`, object);
    object.validateField('name');
  }

  private validateRoot(object: FormModel) {
    console.log(`---- check root: ${object.id}  ----`, object);
    object.validateRoot();
  }

  protected getFormModel(id: string) {
    return this.editorModel.formStore.getFormModel(id);
  }
}
