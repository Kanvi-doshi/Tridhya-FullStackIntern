import Sidebar from "@/components/Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-10 bg-gray-100">{children}</div>
    </div>
  );
}
