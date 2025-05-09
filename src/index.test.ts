import { createRequestManager } from './index';

describe('RequestManager', () => {
  test('createRequest 应该创建唯一ID', () => {
    const requestManager = createRequestManager();
    const request1 = requestManager.createRequest();
    const request2 = requestManager.createRequest();

    expect(request1.requestId).toBeLessThan(request2.requestId);
    expect(request1.isLatestRequest()).toBe(false);
    expect(request2.isLatestRequest()).toBe(true);
  });

  test('managedRequest 应该处理最新请求', async () => {
    const requestManager = createRequestManager();
    const successFn = jest.fn();
    const outdatedFn = jest.fn();

    // 模拟两个异步请求，第二个先完成
    const slowRequest = requestManager.managedRequest(
      () => new Promise(resolve => setTimeout(() => resolve('slow data'), 100)),
      successFn,
      outdatedFn
    );

    const fastRequest = requestManager.managedRequest(
      () => Promise.resolve('fast data'),
      successFn,
      outdatedFn
    );

    // 等待两个请求完成
    await Promise.all([slowRequest, fastRequest]);

    // 成功回调应该只被调用一次，并使用最新请求的数据
    expect(successFn).toHaveBeenCalledTimes(1);
    expect(successFn).toHaveBeenCalledWith('fast data');

    // 过期请求回调应该被调用一次，使用过期请求的数据
    expect(outdatedFn).toHaveBeenCalledTimes(1);
    expect(outdatedFn).toHaveBeenCalledWith('slow data', expect.any(Number));
  });

  test('managedFetch 应该处理最新请求', async () => {
    const requestManager = createRequestManager();

    // 模拟两个异步请求，第二个先完成
    const slowPromise = requestManager.managedFetch(
      () => new Promise(resolve => setTimeout(() => resolve('slow data'), 100))
    );

    const fastPromise = requestManager.managedFetch(
      () => Promise.resolve('fast data')
    );

    // 等待两个请求完成
    const [slowResult, fastResult] = await Promise.all([slowPromise, fastPromise]);

    // 检查结果
    expect(slowResult.isLatest).toBe(false);
    expect(slowResult.data).toBe('slow data');

    expect(fastResult.isLatest).toBe(true);
    expect(fastResult.data).toBe('fast data');
  });

  test('managedFetch 应该处理错误', async () => {
    const requestManager = createRequestManager();

    // 测试最新请求出错的情况
    const errorPromise = requestManager.managedFetch(() => Promise.reject(new Error('test error')));

    await expect(errorPromise).rejects.toThrow('test error');

    // 测试过期请求出错的情况
    const oldErrorPromise = requestManager.managedFetch(() => Promise.reject(new Error('old error')));
    // 创建新的请求，使上面的请求过期
    requestManager.createRequest();

    // 过期的错误请求不应该抛出错误
    const result = await oldErrorPromise;
    expect(result.isLatest).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe('old error');
  });
}); 