export const debounce = (callback, delay) => {
  let timer;

  return (...args) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};

export const throttle = (callback, delay) => {
  let canRun = true;

  return (...args) => {
    if (!canRun) return;

    callback(...args);
    canRun = false;

    setTimeout(() => {
      canRun = true;
    }, delay);
  };
};
