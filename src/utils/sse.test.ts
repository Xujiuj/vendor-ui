import { describe, expect, it, vi } from 'vitest';
import { ref, nextTick } from 'vue';

const eventSourceState = {
  data: ref<string | null>(null),
  error: ref<Error | null>(null)
};

const addNotice = vi.fn();
const notification = vi.fn();
const useEventSourceMock = vi.fn(() => eventSourceState);

vi.mock('@/utils/auth', () => ({
  getToken: () => 'test-token'
}));

vi.mock('@/store/modules/notice', () => ({
  useNoticeStore: () => ({
    addNotice
  })
}));

vi.mock('element-plus', () => ({
  ElNotification: notification
}));

vi.mock('@/utils/vueuse-lite', () => ({
  useEventSource: useEventSourceMock
}));

describe('initSSE', () => {
  it('connects to the vendor SSE endpoint with token and client id query parameters', async () => {
    const { initSSE } = await import('./sse');

    initSSE('/vendor/prod-api/resource/sse');

    const [url, events, options] = useEventSourceMock.mock.calls[0];
    expect(url).toContain('/vendor/prod-api/resource/sse?Authorization=Bearer test-token&clientid=');
    expect(events).toEqual([]);
    expect(options).toEqual({
      autoReconnect: {
        retries: 5,
        delay: 5000,
        onFailed: expect.any(Function)
      }
    });
  });

  it('clears transient SSE errors after logging them', async () => {
    const { initSSE } = await import('./sse');
    initSSE('/vendor/prod-api/resource/sse');

    eventSourceState.error.value = new Error('temporary failure');
    await nextTick();

    expect(eventSourceState.error.value).toBeNull();
  });

  it('stores and notifies incoming SSE messages once', async () => {
    const { initSSE } = await import('./sse');
    initSSE('/vendor/prod-api/resource/sse');

    eventSourceState.data.value = 'hello';
    await nextTick();

    expect(addNotice).toHaveBeenCalledWith(expect.objectContaining({ message: 'hello', read: false }));
    expect(notification).toHaveBeenCalledWith(expect.objectContaining({ message: 'hello', type: 'success' }));
    expect(eventSourceState.data.value).toBeNull();
  });
});
