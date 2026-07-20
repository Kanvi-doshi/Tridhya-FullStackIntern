import { useState } from "react";

export function useCounter(i = 0) {
  const [count, setCount] = useState(i);

  function inc() {
    setCount((prev) => prev + 1);
  }
  function dec() {
    setCount((prev) => prev - 1);
  }
  function reset() {
    setCount(i);
  }

  return {
    count,
    inc,
    dec,
    reset,
  };
}
