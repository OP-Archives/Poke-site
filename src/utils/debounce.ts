export function debounce<T extends (..._args: unknown[]) => void>(fn: T, delay: number) {
  let timeout: ReturnType<typeof setTimeout>;
  const debounced = ((...args: unknown[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...(args as Parameters<T>)), delay);
  }) as T;
  return debounced;
}
