// deno-lint-ignore no-explicit-any
export type Wrapper = <T extends (...args: any[]) => void>(
  fn: T,
) => (...args: Parameters<T>) => void;

export const debounce = (delay: number): Wrapper => {
  return (func) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<typeof func>) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };
};
