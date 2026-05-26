import type { CloudResult } from '../types/domain';

export async function callFunction<T>(name: string, data: Record<string, unknown> = {}): Promise<T> {
  const result = await wx.cloud.callFunction({ name, data });
  const payload = result.result as CloudResult<T>;

  if (!payload || payload.success !== true) {
    const message = payload?.error?.message || '请求失败，请稍后重试';
    throw new Error(message);
  }

  return payload.data as T;
}

export function showError(error: unknown): void {
  const message = error instanceof Error ? error.message : '操作失败，请稍后重试';
  wx.showToast({ title: message, icon: 'none' });
}
