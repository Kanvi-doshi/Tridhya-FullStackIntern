import CounterDemo from "./components/counterDemo";
import ToggleDemo from "./components/toggleDemo";
import SearchDemo from "./components/searchDemo";
import FilterDemo from "./components/filterDemo";
import LocalStorageDemo from "./components/storageDemo";
import FetchDemo from "./components/fetchDemo";

function App() {
  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <h1 className="text-4xl font-bold text-center mb-8">
        Custom Hooks Library
      </h1>
      <div className="max-w-5xl mx-auto space-y-6">
        <CounterDemo />
        <ToggleDemo />
        <SearchDemo />
        <FilterDemo />
        <LocalStorageDemo />
        <FetchDemo />
      </div>
    </div>
  );
}

export default App;
