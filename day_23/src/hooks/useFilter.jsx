import { useState } from "react";

export function useFilter(data, field) {
  const [filter, setFilter] = useState("All");

  const filteredData =
    filter === "All" ? data : data.filter((item) => item[field] === filter);

  return {
    filter,
    setFilter,
    filteredData,
  };
}
