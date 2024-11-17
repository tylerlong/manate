export type Wrapper = (fn: () => void) => () => void;

export const debounce = (delay: number): Wrapper => {
  return (func: () => void) => {
    let timeout: NodeJS.Timeout;
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        func();
      }, delay);
    };
  };
};
