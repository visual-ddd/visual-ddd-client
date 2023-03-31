import { delay } from '@wakeapp/utils';
import { TimeoutController, TimeoutError } from './TimeoutController';

describe('TimeoutController', () => {
  jest.useFakeTimers();

  it('should resolve promise when finished', async () => {
    const timeoutController = new TimeoutController(50);
    const me = timeoutController.start();
    const partner = delay(100);

    // cancel
    timeoutController.dispose();

    jest.advanceTimersByTime(1000);

    await expect(Promise.race([me, partner])).resolves.toBeUndefined();
  });

  it('should reject promise when timed out', async () => {
    const timeoutController = new TimeoutController(1000);

    const pro = expect(timeoutController.start()).rejects.toThrow(TimeoutError);

    jest.advanceTimersByTime(1000);

    return pro;
  });

  it('should refresh timer and trigger timeout', async () => {
    const timeoutController = new TimeoutController(2000);

    const me = timeoutController.start();

    jest.advanceTimersByTime(1500);

    timeoutController.refresh();

    jest.advanceTimersByTime(1500);

    const promise = expect(Promise.race([delay(400), me])).resolves.toBeUndefined();

    jest.advanceTimersByTime(1000);

    return promise;
  });
});
