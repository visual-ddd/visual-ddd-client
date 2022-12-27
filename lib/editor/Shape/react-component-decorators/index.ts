import { registerReactDecorator } from '@/lib/g6-binding';
import { ObserverDecorator } from './Observer';
import { AutoResizeDecorator } from './AutoResize';
import { FormStatus } from './FormStatus';

registerReactDecorator('Observer', ObserverDecorator);
registerReactDecorator('FormStatus', FormStatus);
registerReactDecorator('AutoResize', AutoResizeDecorator);
