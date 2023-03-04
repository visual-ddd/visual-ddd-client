import { BaseEditorPropertyLocationObserver, EditorPropertyLocationEvent } from './BaseEditorPropertyLocationObserver';

describe('BaseEditorPropertyLocationObserver', () => {
  test('base features', () => {
    const observer = new BaseEditorPropertyLocationObserver();

    observer.emit({ nodeId: 'nodeId', path: 'path' });

    expect(observer.isResolved()).toBeFalsy();
    expect(observer.peek()).toEqual({ nodeId: 'nodeId', path: 'path' });

    observer.resolve();
    expect(observer.isResolved()).toBeTruthy();
    expect(observer.peek()).toBe(undefined);
  });

  test('touch', () => {
    const observer = new BaseEditorPropertyLocationObserver();

    expect(observer.isTouched('path')).toBeFalsy();
    expect(observer.isTouched('')).toBeFalsy();

    observer.emit({ nodeId: 'nodeId', path: 'path' });

    expect(observer.isTouched('path')).toBeFalsy();

    observer.touch('path');
    observer.touch('');
    expect(observer.isTouched('path')).toBeTruthy();
    expect(observer.isTouched('')).toBeTruthy();

    // new location
    observer.emit({ nodeId: 'nodeId', path: 'path' });
    expect(observer.isTouched('path')).toBeFalsy();
  });

  test('satisfy', () => {
    const observer = new BaseEditorPropertyLocationObserver();

    // unresolved
    expect(observer.satisfy('nodeId')).toBeFalsy();
    expect(observer.satisfy('nodeId', 'path')).toBeFalsy();
    expect(observer.satisfy('nodeId', 'path')).toBeFalsy();
    expect(observer.satisfy('nodeId', 'path.2')).toBeFalsy();

    // resolved with node
    observer.emit({ nodeId: 'nodeId' });
    expect(observer.satisfy('nodeId')).toBeTruthy();
    expect(observer.satisfy('nodeId2', 'path')).toBeFalsy();
    expect(observer.satisfy('nodeId', 'path')).toBeFalsy();
    expect(observer.satisfy('nodeId', 'path.2')).toBeFalsy();

    // resolved with simple path
    observer.emit({ nodeId: 'nodeId', path: 'path' });
    expect(observer.satisfy('nodeId', 'path')).toBeTruthy();
    expect(observer.satisfy('nodeId', 'path.2')).toBeFalsy();
    expect(observer.satisfy('nodeId', 'path2')).toBeFalsy();
    expect(observer.satisfy('nodeId2', 'path')).toBeFalsy();
    expect(observer.satisfy('nodeId2', 'path2')).toBeFalsy();

    // resolve with deeper path
    observer.emit({ nodeId: 'nodeId', path: 'path.2.3' });
    expect(observer.satisfy('nodeId')).toBeTruthy();
    expect(observer.satisfy('nodeId', 'path')).toBeTruthy();
    expect(observer.satisfy('nodeId', 'path.2')).toBeTruthy();
    expect(observer.satisfy('nodeId', 'path.2.3')).toBeTruthy();
    expect(observer.satisfy('nodeId', 'path.2.3.4')).toBeFalsy();
    expect(observer.satisfy('nodeId', 'path.2.4')).toBeFalsy();
    expect(observer.satisfy('nodeId', 'path2')).toBeFalsy();
    expect(observer.satisfy('nodeId2')).toBeFalsy();
  });

  test('anonymous listen', () => {
    const observer = new BaseEditorPropertyLocationObserver();

    const listener = jest.fn();
    observer.subscribeAnonymous(listener);

    // 路径匹配
    observer.emit({ nodeId: 'nodeId', path: 'path' });

    expect(listener).toBeCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith({
      nodeId: 'nodeId',
      path: 'path',
      currentPath: '',
      resolve: observer.resolve,
    });

    // 节点匹配
    observer.emit({ nodeId: 'nodeId' });

    expect(listener).toBeCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith({ nodeId: 'nodeId', currentPath: '', resolve: observer.resolve });
  });

  test('node listen', () => {
    const observer = new BaseEditorPropertyLocationObserver();

    const nodeListener = jest.fn();
    const anonymousListener = jest.fn();

    observer.subscribeNode('nodeId', nodeListener);
    observer.subscribeAnonymous(anonymousListener);

    // 路径匹配
    observer.emit({ nodeId: 'nodeId', path: 'path' });

    expect(nodeListener).toBeCalledTimes(1);
    expect(nodeListener).toHaveBeenLastCalledWith({
      nodeId: 'nodeId',
      path: 'path',
      currentPath: '',
      resolve: observer.resolve,
    });
    expect(anonymousListener).toBeCalledTimes(1);
    expect(anonymousListener).toHaveBeenLastCalledWith({
      nodeId: 'nodeId',
      path: 'path',
      currentPath: '',
      resolve: observer.resolve,
    });

    // 节点匹配
    observer.emit({ nodeId: 'nodeId' });

    expect(nodeListener).toBeCalledTimes(2);
    expect(nodeListener).toHaveBeenLastCalledWith({ nodeId: 'nodeId', currentPath: '', resolve: observer.resolve });
    expect(anonymousListener).toBeCalledTimes(2);
    expect(anonymousListener).toHaveBeenLastCalledWith({
      nodeId: 'nodeId',
      currentPath: '',
      resolve: observer.resolve,
    });

    // 未匹配
    observer.emit({ nodeId: 'nodeId2' });
    expect(nodeListener).toBeCalledTimes(2);
    expect(anonymousListener).toBeCalledTimes(3);
  });

  test('node listen and resolve', () => {
    const observer = new BaseEditorPropertyLocationObserver();

    const nodeListener = jest.fn((evt: EditorPropertyLocationEvent) => {
      evt.resolve();
    });
    const anonymousListener = jest.fn();

    observer.subscribeNode('nodeId', nodeListener);
    observer.subscribeAnonymous(anonymousListener);

    // 路径匹配
    expect(observer.emit({ nodeId: 'nodeId', path: 'path' })).toBeTruthy();

    expect(nodeListener).toBeCalledTimes(1);
    expect(nodeListener).toHaveBeenLastCalledWith({
      nodeId: 'nodeId',
      path: 'path',
      currentPath: '',
      resolve: observer.resolve,
    });
    // 被中断
    expect(anonymousListener).toBeCalledTimes(0);

    // 节点匹配
    observer.emit({ nodeId: 'nodeId' });

    expect(nodeListener).toBeCalledTimes(2);
    expect(nodeListener).toHaveBeenLastCalledWith({ nodeId: 'nodeId', currentPath: '', resolve: observer.resolve });
    expect(anonymousListener).toBeCalledTimes(0);
  });

  test('path listen', () => {
    const observer = new BaseEditorPropertyLocationObserver();

    const pathListener = jest.fn();
    const nodeListener = jest.fn();
    const anonymousListener = jest.fn();

    observer.subscribePath('nodeId', 'path', pathListener);
    observer.subscribeNode('nodeId', nodeListener);
    observer.subscribeAnonymous(anonymousListener);

    // 路径匹配
    expect(observer.emit({ nodeId: 'nodeId', path: 'path' })).toBeFalsy();

    expect(pathListener).toBeCalledTimes(1);
    expect(pathListener).toHaveBeenLastCalledWith({
      nodeId: 'nodeId',
      path: 'path',
      currentPath: 'path',
      resolve: observer.resolve,
    });
    expect(nodeListener).toBeCalledTimes(1);
    expect(anonymousListener).toBeCalledTimes(1);
    expect(anonymousListener).toHaveBeenLastCalledWith({
      nodeId: 'nodeId',
      path: 'path',
      currentPath: '',
      resolve: observer.resolve,
    });

    // 节点匹配
    expect(observer.emit({ nodeId: 'nodeId' })).toBeFalsy();

    expect(pathListener).toBeCalledTimes(1);
    expect(nodeListener).toBeCalledTimes(2);
    expect(anonymousListener).toBeCalledTimes(2);
    expect(anonymousListener).toHaveBeenLastCalledWith({
      nodeId: 'nodeId',
      currentPath: '',
      resolve: observer.resolve,
    });

    // 未匹配节点
    observer.emit({ nodeId: 'nodeId2' });
    expect(pathListener).toBeCalledTimes(1);
    expect(nodeListener).toBeCalledTimes(2);
    expect(anonymousListener).toBeCalledTimes(3);

    // 未匹配路径
    observer.emit({ nodeId: 'nodeId', path: 'path2' });
    expect(pathListener).toBeCalledTimes(1);
    expect(nodeListener).toBeCalledTimes(3);
    expect(anonymousListener).toBeCalledTimes(4);
  });

  test('multi path listen and resolve', () => {
    const observer = new BaseEditorPropertyLocationObserver();

    const path1Listener = jest.fn();
    const path2Listener = jest.fn();

    const nodeListener = jest.fn();
    const anonymousListener = jest.fn();

    observer.subscribePath('nodeId', 'path', path1Listener);
    observer.subscribePath('nodeId', 'path', path2Listener);
    observer.subscribeNode('nodeId', nodeListener);
    observer.subscribeAnonymous(anonymousListener);

    // 路径匹配
    expect(observer.emit({ nodeId: 'nodeId', path: 'path' })).toBeFalsy();

    expect(path1Listener).toBeCalledTimes(1);
    expect(path2Listener).toBeCalledTimes(1);

    expect(path1Listener).toHaveBeenLastCalledWith({
      nodeId: 'nodeId',
      path: 'path',
      currentPath: 'path',
      resolve: observer.resolve,
    });
    expect(path2Listener).toHaveBeenLastCalledWith({
      nodeId: 'nodeId',
      path: 'path',
      currentPath: 'path',
      resolve: observer.resolve,
    });
    expect(nodeListener).toBeCalledTimes(1);
    expect(anonymousListener).toBeCalledTimes(1);

    // 被中断
    path1Listener.mockImplementationOnce((evt: EditorPropertyLocationEvent) => {
      evt.resolve();
    });
    expect(observer.emit({ nodeId: 'nodeId', path: 'path' })).toBeTruthy();
    expect(path1Listener).toBeCalledTimes(2);
    expect(path2Listener).toBeCalledTimes(1); // 被中断了
    expect(nodeListener).toBeCalledTimes(1);
    expect(anonymousListener).toBeCalledTimes(1);

    // 节点匹配
    observer.emit({ nodeId: 'nodeId' });

    expect(path1Listener).toBeCalledTimes(2);
    expect(path2Listener).toBeCalledTimes(1);
    expect(nodeListener).toBeCalledTimes(2);
    expect(anonymousListener).toBeCalledTimes(2);
  });

  test('dispose subscribe', () => {
    const observer = new BaseEditorPropertyLocationObserver();

    const pathListener = jest.fn();
    const nodeListener = jest.fn();
    const anonymousListener = jest.fn();

    const pathDispose = observer.subscribePath('nodeId', 'path', pathListener);
    const nodeDispose = observer.subscribeNode('nodeId', nodeListener);
    const anonymousDispose = observer.subscribeAnonymous(anonymousListener);

    // 触发
    expect(observer.emit({ nodeId: 'nodeId', path: 'path' })).toBeFalsy();

    expect(pathListener).toBeCalledTimes(1);
    expect(nodeListener).toBeCalledTimes(1);
    expect(anonymousListener).toBeCalledTimes(1);

    pathDispose();
    nodeDispose();
    anonymousDispose();

    // 释放后触发将不会调用监听器
    observer.emit({ nodeId: 'nodeId', path: 'path' });
    expect(pathListener).toBeCalledTimes(1);
    expect(nodeListener).toBeCalledTimes(1);
    expect(anonymousListener).toBeCalledTimes(1);

    // 重新监听应该可以正常触发
    observer.subscribePath('nodeId', 'path', pathListener);
    observer.subscribeNode('nodeId', nodeListener);
    observer.subscribeAnonymous(anonymousListener);
    expect(observer.emit({ nodeId: 'nodeId', path: 'path' })).toBeFalsy();

    expect(pathListener).toBeCalledTimes(2);
    expect(nodeListener).toBeCalledTimes(2);
    expect(anonymousListener).toBeCalledTimes(2);
  });
});
