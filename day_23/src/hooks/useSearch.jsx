import { useState } from "react";

export function useSearch(data) {
  const [search, setSearch] = useState("");

  const filteredData = data.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase()),
  );

  return {
    search,
    setSearch,
    filteredData,
  };
}
