'use client';

import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-sm border border-zinc-200 bg-zinc-50 px-6 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
          页面暂时出了点问题
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600">
          这是一个未被页面内逻辑接住的异常，请稍后重试。如果问题持续存在，再回头检查服务日志。
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-6 text-sm font-medium text-zinc-900 transition-colors hover:text-zinc-600"
        >
          重新加载
        </button>
      </div>
    </main>
  );
}
