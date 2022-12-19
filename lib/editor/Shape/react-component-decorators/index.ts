import { registerReactDecorator } from '@/lib/g6-binding';
import { ObserverDecorator } from './Observer';
import { AutoResizeDecorator } from './AutoResize';

registerReactDecorator('Observer', ObserverDecorator);
registerReactDecorator('AutoResize', AutoResizeDecorator);
