// src/features/admin/shipping-providers/pages/edit/schemes/concurrency.ts
export async function runWithConcurrency<T>(items: T[], n: number, fn: (x: T) => Promise<void>): Promise<void> {
  const workers = Array.from({ length: Math.max(1, n) }, async () => {
    while (items.length > 0) {
      const x = items.shift();
      if (x === undefined) return;
      await fn(x);
    }
  });
  await Promise.all(workers);
}
