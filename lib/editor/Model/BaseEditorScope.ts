declare global {
  /**
   * 全局声明作用域成员
   */
  interface IBaseEditorScopeMembers {}
}

/**
 * 获取当前作用域
 */
export function getCurrentEditorScope() {
  return BaseEditorScope.getCurrentScope();
}

/**
 * 编辑器作用域管理
 */
export class BaseEditorScope {
  /**
   * 当前激活的作用域
   */
  private static currentScope: BaseEditorScope;

  static getCurrentScope() {
    return this.currentScope.members;
  }

  private scopeId: string;

  private members: IBaseEditorScopeMembers;

  constructor(inject: { scopeId: string }) {
    this.scopeId = inject.scopeId;
    this.members = {} as any;
  }

  /**
   * 生成命名空间
   * @param name
   * @returns
   */
  generateScopeName(name: string) {
    return `${name}-${this.scopeId}`;
  }

  /**
   * 激活命名空间
   */
  activeScope() {
    BaseEditorScope.currentScope = this;
  }

  /**
   * 当前作用域是否激活
   * @returns
   */
  isActive() {
    return BaseEditorScope.currentScope === this;
  }

  getMembers() {
    return this.members;
  }

  /**
   * 注册成员
   * @param name
   * @param value
   */
  registerScopeMember<T extends keyof IBaseEditorScopeMembers>(name: T, value: IBaseEditorScopeMembers[T]) {
    this.members[name] = value;
  }
}
